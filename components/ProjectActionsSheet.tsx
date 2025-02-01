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
import { Project, deleteProject } from "../services/database";

interface ProjectActionsSheetProps {
  project: Project;
  isVisible: boolean;
  onClose: () => void;
  onProjectDeleted: () => void;
}

export default function ProjectActionsSheet({
  project,
  isVisible,
  onClose,
  onProjectDeleted,
}: ProjectActionsSheetProps) {
  const { isDarkMode } = useTheme();

  const handleDelete = async () => {
    Alert.alert(
      "Delete Project",
      "Are you sure you want to delete this project? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const success = await deleteProject(project.id!);
              if (success) {
                onProjectDeleted();
                onClose();
              } else {
                Alert.alert("Error", "Failed to delete project");
              }
            } catch (error) {
              console.error("Error deleting project:", error);
              Alert.alert("Error", "Failed to delete project");
            }
          },
        },
      ]
    );
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
              Project Actions
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons
                name="close"
                size={24}
                color={isDarkMode ? "#fff" : "#000"}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
            <Ionicons name="trash" size={24} color="#f44336" />
            <Text style={styles.deleteText}>Delete Project</Text>
          </TouchableOpacity>
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
    minHeight: 200,
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
    backgroundColor: "#ffebee",
  },
  deleteText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#f44336",
    fontWeight: "500",
  },
});
