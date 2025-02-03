import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Project, getProjects, initDatabase } from "../services/database";
import NewProjectModal from "../components/NewProjectModal";
import { router, useFocusEffect } from "expo-router";
import ProjectActionsSheet from "../components/ProjectActionsSheet";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const Projects = () => {
  const { isDarkMode } = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isActionsVisible, setIsActionsVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadProjects = async () => {
    try {
      const projectsData = await getProjects();
      console.log("Loaded projects:", projectsData);
      setProjects(projectsData || []);
      setError(null);
    } catch (error) {
      console.error("Error loading projects:", error);
      setError("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const setup = async () => {
      try {
        setIsLoading(true);
        await initDatabase();
        await loadProjects();
      } catch (error) {
        console.error("Setup error:", error);
        setError("Failed to initialize database");
      }
    };

    setup();
  }, []);

  const handleProjectAdded = () => {
    loadProjects();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ongoing":
        return "#4CAF50";
      case "completed":
        return "#2196F3";
      default:
        return "#FFC107";
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadProjects();
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setIsLoading(true);
        try {
          await loadProjects();
        } catch (error) {
          console.error("Error refreshing projects:", error);
          setError("Failed to load projects");
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
    }, [])
  );

  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity
      style={[styles.projectCard, isDarkMode && styles.darkProjectCard]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.statusBadge}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          />
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => {
            setSelectedProject(item);
            setIsActionsVisible(true);
          }}
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={24}
            color={isDarkMode ? "#fff" : "#666"}
          />
        </TouchableOpacity>
      </View>

      <Text style={[styles.projectTitle, isDarkMode && styles.darkText]}>
        {item.title}
      </Text>
      <Text
        style={[
          styles.projectDescription,
          isDarkMode && styles.darkDescription,
        ]}
      >
        {item.description}
      </Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: `${item.progress}%` }]} />
        </View>
        <Text
          style={[styles.progressText, isDarkMode && styles.darkSecondaryText]}
        >
          {item.progress}%
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.teamContainer}>
          <Ionicons
            name="people"
            size={20}
            color={isDarkMode ? "#fff" : "#666"}
          />
          <Text
            style={[styles.teamCount, isDarkMode && styles.darkSecondaryText]}
          >
            {item.team} members
          </Text>
        </View>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => {
            router.push({
              pathname: "/project-details",
              params: { project: JSON.stringify(item) },
            });
          }}
        >
          <Text style={styles.detailsButtonText}>Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#f4511e" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={[styles.errorText, isDarkMode && styles.darkText]}>
          {error}
        </Text>
      </View>
    );
  }

  console.log("Current projects state:", projects);

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {projects.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={[styles.emptyText, isDarkMode && styles.darkText]}>
            No projects yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          renderItem={renderProject}
          keyExtractor={(item) => item.id?.toString() || ""}
          contentContainerStyle={styles.listContainer}
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
        />
      )}

      <NewProjectModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onProjectAdded={handleProjectAdded}
      />

      {selectedProject && (
        <ProjectActionsSheet
          project={selectedProject}
          isVisible={isActionsVisible}
          onClose={() => {
            setIsActionsVisible(false);
            setSelectedProject(null);
          }}
          onProjectDeleted={loadProjects}
        />
      )}
    </View>
  );
};

export default Projects;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContainer: {
    padding: 16,
  },
  projectCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
    marginRight: 8,
  },
  progress: {
    height: "100%",
    backgroundColor: "#f4511e",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teamContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  teamCount: {
    marginLeft: 6,
    fontSize: 14,
    color: "#666",
  },
  detailsButton: {
    backgroundColor: "#f4511e",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  detailsButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  darkContainer: {
    backgroundColor: "#121212",
  },
  darkProjectCard: {
    backgroundColor: "#1a1a1a",
  },
  darkText: {
    color: "#ffffff",
  },
  darkDescription: {
    color: "#999",
  },
  darkSecondaryText: {
    color: "#999",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#f4511e",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#f4511e",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  moreButton: {
    padding: 8,
    position: "absolute",
    right: 12,
    top: 12,
    zIndex: 1,
  },
});
