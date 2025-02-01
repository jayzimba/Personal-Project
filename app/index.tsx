import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
} from "react-native";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import { Link } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { getProjects } from "../services/database";
import NewProjectModal from "../components/NewProjectModal";
import SelectProjectModal from "../components/SelectProjectModal";

const screenWidth = Dimensions.get("window").width;

interface ProjectStats {
  ongoing: number;
  completed: number;
  planned: number;
  totalProgress: number;
}

export default function Home() {
  const { isDarkMode } = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const [projectStats, setProjectStats] = useState<ProjectStats>({
    ongoing: 0,
    completed: 0,
    planned: 0,
    totalProgress: 0,
  });

  const [dashboardStats, setDashboardStats] = useState({
    activeProjects: 0,
    tasksDue: 0,
    completed: 0,
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSelectProjectModalVisible, setIsSelectProjectModalVisible] =
    useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadAllStats();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleProjectAdded = async () => {
    const loadAllStats = async () => {
      try {
        const projects = await getProjects();
        const stats = {
          ongoing: projects.filter((p) => p.status === "ongoing").length,
          completed: projects.filter((p) => p.status === "completed").length,
          planned: projects.filter((p) => p.status === "planned").length,
          totalProgress:
            projects.reduce((acc, curr) => acc + curr.progress, 0) /
            (projects.length || 1),
        };
        setProjectStats(stats);

        setDashboardStats({
          activeProjects: projects.filter((p) => p.status === "ongoing").length,
          tasksDue: projects.filter((p) => p.progress < 100).length,
          completed: projects.filter((p) => p.status === "completed").length,
        });
      } catch (error) {
        console.error("Error refreshing stats:", error);
      }
    };

    loadAllStats();
  };

  useEffect(() => {
    const loadAllStats = async () => {
      try {
        const projects = await getProjects();

        // Update project stats for the graph
        const stats = {
          ongoing: projects.filter((p) => p.status === "ongoing").length,
          completed: projects.filter((p) => p.status === "completed").length,
          planned: projects.filter((p) => p.status === "planned").length,
          totalProgress:
            projects.reduce((acc, curr) => acc + curr.progress, 0) /
            (projects.length || 1),
        };
        setProjectStats(stats);

        // Update dashboard stats
        setDashboardStats({
          activeProjects: projects.filter((p) => p.status === "ongoing").length,
          tasksDue: projects.filter((p) => p.progress < 100).length,
          completed: projects.filter((p) => p.status === "completed").length,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      }
    };

    loadAllStats();
  }, []);

  const statsCards = [
    {
      title: "Active Projects",
      value: dashboardStats.activeProjects.toString(),
      icon: "folder-open",
    },
    {
      title: "Tasks Due",
      value: dashboardStats.tasksDue.toString(),
      icon: "time",
    },
    {
      title: "Completed",
      value: dashboardStats.completed.toString(),
      icon: "checkmark-circle",
    },
  ];

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#f4511e"]}
            tintColor={isDarkMode ? "#fff" : "#f4511e"}
            titleColor={isDarkMode ? "#fff" : "#666"}
            title="Pull to refresh"
          />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.greeting, isDarkMode && styles.darkText]}>
            Welcome back,
          </Text>
          <Text style={[styles.name, isDarkMode && styles.darkText]}>
            John Doe
          </Text>
        </View>

        <View style={styles.statsContainer}>
          {statsCards.map((stat, index) => (
            <View
              key={index}
              style={[
                styles.statCard,
                isDarkMode && styles.darkStatCard,
                { marginRight: index < statsCards.length - 1 ? 12 : 0 },
              ]}
            >
              <Ionicons
                name={stat.icon as any}
                size={24}
                color={isDarkMode ? "#fff" : "#f4511e"}
              />
              <Text style={[styles.statValue, isDarkMode && styles.darkText]}>
                {stat.value}
              </Text>
              <Text
                style={[
                  styles.statTitle,
                  isDarkMode && styles.darkSecondaryText,
                ]}
              >
                {stat.title}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            Quick Actions
          </Text>
          <Link href="/projects" asChild>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#f4511e" }]}
            onPress={() => setIsModalVisible(true)}
          >
            <Ionicons name="add-circle" size={24} color="white" />
            <Text style={styles.actionButtonText}>New Project</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#4CAF50" }]}
            onPress={() => setIsSelectProjectModalVisible(true)}
          >
            <Ionicons name="list" size={24} color="white" />
            <Text style={styles.actionButtonText}>Add Task</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chartSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
              Project Statistics
            </Text>
          </View>
          <View
            style={[styles.chartContainer, isDarkMode && styles.darkStatCard]}
          >
            <LineChart
              data={{
                labels: ["Planned", "Ongoing", "Completed"],
                datasets: [
                  {
                    data: [
                      projectStats.planned,
                      projectStats.ongoing,
                      projectStats.completed,
                    ],
                  },
                ],
              }}
              width={screenWidth - 40}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: isDarkMode ? "#1a1a1a" : "#fff",
                backgroundGradientFrom: isDarkMode ? "#1a1a1a" : "#fff",
                backgroundGradientTo: isDarkMode ? "#1a1a1a" : "#fff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(244, 81, 30, ${opacity})`,
                labelColor: (opacity = 1) =>
                  isDarkMode
                    ? `rgba(255, 255, 255, ${opacity})`
                    : `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: "#f4511e",
                  fill: isDarkMode ? "#1a1a1a" : "#fff",
                },
                propsForLabels: {
                  fontSize: 12,
                  fontWeight: "600",
                },
                propsForVerticalLabels: {
                  fontSize: 10,
                  fontWeight: "500",
                },
                strokeWidth: 3,
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
              withVerticalLines={false}
              withHorizontalLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              fromZero={true}
            />
          </View>
          <View style={styles.statsGrid}>
            <View style={[styles.statsCard, isDarkMode && styles.darkStatCard]}>
              <Text style={[styles.statsValue, isDarkMode && styles.darkText]}>
                {projectStats.totalProgress.toFixed(0)}%
              </Text>
              <Text
                style={[
                  styles.statsLabel,
                  isDarkMode && styles.darkSecondaryText,
                ]}
              >
                Average Progress
              </Text>
            </View>
            <View style={[styles.statsCard, isDarkMode && styles.darkStatCard]}>
              <Text style={[styles.statsValue, isDarkMode && styles.darkText]}>
                {projectStats.ongoing +
                  projectStats.completed +
                  projectStats.planned}
              </Text>
              <Text
                style={[
                  styles.statsLabel,
                  isDarkMode && styles.darkSecondaryText,
                ]}
              >
                Total Projects
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backgroundStyle={{
          backgroundColor: isDarkMode ? "#1a1a1a" : "white",
        }}
      >
        <View
          style={[
            styles.bottomSheetContent,
            isDarkMode && styles.darkBottomSheet,
          ]}
        >
          <Text
            style={[styles.bottomSheetTitle, isDarkMode && styles.darkText]}
          >
            Recent Activity
          </Text>
          {[1, 2, 3].map((_, index) => (
            <View
              key={index}
              style={[
                styles.activityItem,
                isDarkMode && styles.darkActivityItem,
              ]}
            >
              <Ionicons
                name="time"
                size={20}
                color={isDarkMode ? "#fff" : "#666"}
              />
              <View style={styles.activityContent}>
                <Text
                  style={[styles.activityTitle, isDarkMode && styles.darkText]}
                >
                  Updated Project Design
                </Text>
                <Text
                  style={[
                    styles.activityTime,
                    isDarkMode && styles.darkSecondaryText,
                  ]}
                >
                  2 hours ago
                </Text>
              </View>
            </View>
          ))}
        </View>
      </BottomSheet>

      <NewProjectModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onProjectAdded={handleProjectAdded}
      />

      <SelectProjectModal
        visible={isSelectProjectModalVisible}
        onClose={() => setIsSelectProjectModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 8,
  },
  statTitle: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  seeAll: {
    color: "#f4511e",
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
  },
  actionButtonText: {
    color: "white",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  bottomSheetContent: {
    flex: 1,
    padding: 20,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    marginBottom: 12,
  },
  activityContent: {
    marginLeft: 12,
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: "#666",
  },
  darkContainer: {
    backgroundColor: "#121212",
  },
  darkText: {
    color: "#ffffff",
  },
  darkSecondaryText: {
    color: "#999",
  },
  darkStatCard: {
    backgroundColor: "#1a1a1a",
  },
  darkBottomSheet: {
    backgroundColor: "#1a1a1a",
  },
  darkActivityItem: {
    backgroundColor: "#242424",
  },
  chartSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  chartContainer: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 4,
  },
  statsCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});
