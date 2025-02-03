import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Task, updateTaskStatus, deleteTask } from "../services/database";

interface TaskActionsSheetProps {
  task: Task;
  isVisible: boolean;
  onClose: () => void;
  onTaskUpdated: () => void;
}

export default function TaskActionsSheet({
  task,
  isVisible,
  onClose,
  onTaskUpdated,
}: TaskActionsSheetProps) {
  const { isDarkMode } = useTheme();

  const handleStatusToggle = async () => {
    try {
      await updateTaskStatus(
        task.id!,
        task.status === "completed" ? "pending" : "completed"
      );
      onTaskUpdated();
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to update task status");
    }
  };

  const handleDelete = async () => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTask(task.id!);
            onTaskUpdated();
            onClose();
          } catch (error) {
            Alert.alert("Error", "Failed to delete task");
          }
        },
      },
    ]);
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.container, isDarkMode && styles.darkContainer]}>
          <View style={styles.header}>
            <Text style={[styles.title, isDarkMode && styles.darkText]}>
              Task Actions
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons
                name="close"
                size={24}
                color={isDarkMode ? "#fff" : "#000"}
              />
            </TouchableOpacity>
          </View>

          {task.status === "completed" ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.incompleteButton]}
              onPress={handleStatusToggle}
            >
              <Ionicons name="refresh-circle" size={24} color="#FF9800" />
              <Text style={styles.incompleteText}>Mark as Incomplete</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.completeButton]}
                onPress={handleStatusToggle}
              >
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={styles.completeText}>Mark as Complete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
              >
                <Ionicons name="trash" size={24} color="#f44336" />
                <Text style={styles.deleteText}>Delete Task</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  darkContainer: {
    backgroundColor: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  darkText: {
    color: "#fff",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  completeButton: {
    backgroundColor: "#E8F5E9",
  },
  deleteButton: {
    backgroundColor: "#FFEBEE",
  },
  completeText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "500",
  },
  deleteText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#f44336",
    fontWeight: "500",
  },
  incompleteButton: {
    backgroundColor: "#FFF3E0",
  },
  incompleteText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#FF9800",
    fontWeight: "500",
  },
});
