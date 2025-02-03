import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useState, useCallback } from "react";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Task, Project, updateTaskStatus, getDb } from "../services/database";
import { useFocusEffect } from "expo-router";

interface TaskWithProject extends Task {
  project: Project;
  daysOverdue?: number;
}

export default function TodayTasks() {
  const { isDarkMode } = useTheme();
  const [tasks, setTasks] = useState<TaskWithProject[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadTasks = async () => {
    try {
      const database = await getDb();
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const todayStr = `${year}-${month}-${day}`;

      // Updated query to get all task details including project info
      const tasksData = await database.getAllAsync<TaskWithProject>(
        `SELECT 
          t.*,
          p.title as project_title,
          p.id as project_id,
          p.status as project_status,
          t.due_date,
          t.status as task_status,
          p.status as project_status
        FROM tasks t
        JOIN projects p ON t.project_id = p.id
        WHERE date(t.due_date) <= date(?)
        AND t.status != 'completed'
        ORDER BY t.due_date ASC
      `,
        [todayStr]
      );

      // Calculate days overdue for each task
      const tasksWithOverdue = tasksData.map((task) => {
        const dueDate = new Date(task.due_date);
        const timeDiff = today.getTime() - dueDate.getTime();
        const daysOverdue = Math.floor(timeDiff / (1000 * 3600 * 24));
        return {
          ...task,
          daysOverdue: daysOverdue > 0 ? daysOverdue : 0,
        };
      });

      setTasks(tasksWithOverdue);
    } catch (error) {
      console.error("Error loading today's tasks:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadTasks();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleComplete = async (taskId: number) => {
    try {
      await updateTaskStatus(taskId, "completed");
      await loadTasks();
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  return (
    <ScrollView
      style={[styles.container, isDarkMode && styles.darkContainer]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#f4511e"]}
          tintColor={isDarkMode ? "#fff" : "#f4511e"}
        />
      }
    >
      <Text style={[styles.title, isDarkMode && styles.darkText]}>
        Today's Tasks
      </Text>

      {tasks.map((task) => (
        <View
          key={task.id}
          style={[styles.taskCard, isDarkMode && styles.darkTaskCard]}
        >
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => handleComplete(task.id!)}
          >
            <Ionicons
              name="ellipse-outline"
              size={24}
              color={isDarkMode ? "#fff" : "#f4511e"}
            />
          </TouchableOpacity>

          <View style={styles.taskContent}>
            <Text style={[styles.taskTitle, isDarkMode && styles.darkText]}>
              {task.title}
            </Text>
            <Text
              style={[
                styles.projectName,
                isDarkMode && styles.darkSecondaryText,
              ]}
            >
              Project: {task.project_title}
            </Text>
            {task.description && (
              <Text
                style={[
                  styles.description,
                  isDarkMode && styles.darkSecondaryText,
                ]}
              >
                {task.description}
              </Text>
            )}
            {task.daysOverdue > 0 && (
              <Text style={styles.overdue}>
                {task.daysOverdue} {task.daysOverdue === 1 ? "day" : "days"}{" "}
                overdue
              </Text>
            )}
          </View>
        </View>
      ))}

      {tasks.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, isDarkMode && styles.darkText]}>
            No tasks due today
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  darkContainer: {
    backgroundColor: "#1a1a1a",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  darkText: {
    color: "#fff",
  },
  taskCard: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkTaskCard: {
    backgroundColor: "#333",
  },
  checkbox: {
    marginRight: 12,
    justifyContent: "center",
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  projectName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  darkSecondaryText: {
    color: "#999",
  },
  overdue: {
    color: "#f44336",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});
