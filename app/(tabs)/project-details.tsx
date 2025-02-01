import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import {
  getProjectTasks,
  Task,
  updateTaskStatus,
} from "../../services/database";
import TaskModal from "../../components/TaskModal";

export default function ProjectDetails() {
  const { isDarkMode } = useTheme();
  const params = useLocalSearchParams<{ project: string }>();
  const project = JSON.parse(params.project);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);

  const loadTasks = async () => {
    try {
      const projectTasks = await getProjectTasks(project.id!);
      setTasks(projectTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [project.id]);

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <View style={styles.header}>
          <Text style={[styles.title, isDarkMode && styles.darkText]}>
            {project.title}
          </Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: getStatusColor(project.status) },
            ]}
          >
            <Text style={styles.badgeText}>{project.status}</Text>
          </View>
        </View>

        <Text
          style={[styles.description, isDarkMode && styles.darkSecondaryText]}
        >
          {project.description}
        </Text>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons
              name="time-outline"
              size={20}
              color={isDarkMode ? "#fff" : "#666"}
            />
            <Text style={[styles.infoText, isDarkMode && styles.darkText]}>
              Created: {new Date(project.created_at).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons
              name="people-outline"
              size={20}
              color={isDarkMode ? "#fff" : "#666"}
            />
            <Text style={[styles.infoText, isDarkMode && styles.darkText]}>
              Team Size: {project.team}
            </Text>
          </View>

          <View style={styles.progressSection}>
            <Text style={[styles.progressTitle, isDarkMode && styles.darkText]}>
              Progress
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[styles.progress, { width: `${project.progress}%` }]}
              />
            </View>
            <Text style={[styles.progressText, isDarkMode && styles.darkText]}>
              {project.progress}%
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.taskSection}>
        <View style={styles.taskHeader}>
          <Text style={[styles.taskTitle, isDarkMode && styles.darkText]}>
            Tasks
          </Text>
          <TouchableOpacity
            style={styles.addTaskButton}
            onPress={() => setIsTaskModalVisible(true)}
          >
            <Text style={styles.addTaskButtonText}>Add Task</Text>
          </TouchableOpacity>
        </View>

        {tasks.map((task) => (
          <View
            key={task.id}
            style={[styles.taskCard, isDarkMode && styles.darkTaskCard]}
          >
            <TouchableOpacity
              style={styles.taskCheckbox}
              onPress={() =>
                updateTaskStatus(
                  task.id!,
                  task.status === "completed" ? "pending" : "completed"
                )
              }
            >
              <Ionicons
                name={
                  task.status === "completed"
                    ? "checkmark-circle"
                    : "ellipse-outline"
                }
                size={24}
                color={isDarkMode ? "#fff" : "#f4511e"}
              />
            </TouchableOpacity>
            <View style={styles.taskContent}>
              <Text
                style={[styles.taskCardTitle, isDarkMode && styles.darkText]}
              >
                {task.title}
              </Text>
              {task.description && (
                <Text
                  style={[
                    styles.taskDescription,
                    isDarkMode && styles.darkSecondaryText,
                  ]}
                >
                  {task.description}
                </Text>
              )}
              {task.due_date && (
                <Text
                  style={[
                    styles.taskDueDate,
                    isDarkMode && styles.darkSecondaryText,
                  ]}
                >
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>

      <TaskModal
        visible={isTaskModalVisible}
        onClose={() => setIsTaskModalVisible(false)}
        projectId={project.id!}
        onTaskAdded={loadTasks}
      />
    </ScrollView>
  );
}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  darkContainer: {
    backgroundColor: "#121212",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  darkCard: {
    backgroundColor: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
  },
  darkText: {
    color: "#ffffff",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 12,
  },
  badgeText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  description: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    lineHeight: 24,
  },
  darkSecondaryText: {
    color: "#999",
  },
  infoSection: {
    gap: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 16,
    color: "#666",
  },
  progressSection: {
    marginTop: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    marginBottom: 8,
  },
  progress: {
    height: "100%",
    backgroundColor: "#f4511e",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
  },
  taskSection: {
    marginTop: 24,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  addTaskButton: {
    padding: 12,
    backgroundColor: "#f4511e",
    borderRadius: 8,
  },
  addTaskButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 8,
  },
  darkTaskCard: {
    borderColor: "#333",
  },
  taskCheckbox: {
    padding: 8,
  },
  taskContent: {
    flex: 1,
  },
  taskCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  taskDescription: {
    fontSize: 14,
    color: "#666",
  },
  taskDueDate: {
    fontSize: 12,
    color: "#999",
  },
});
