import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Project, addProject } from "../services/database";

interface NewProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onProjectAdded: () => void;
}

export default function NewProjectModal({
  visible,
  onClose,
  onProjectAdded,
}: NewProjectModalProps) {
  const { isDarkMode } = useTheme();
  const [project, setProject] = useState<Partial<Project>>({
    title: "",
    description: "",
    status: "planned",
    progress: 0,
    team: 1,
  });

  const handleSubmit = async () => {
    try {
      if (!project.title) {
        alert("Please enter a project title");
        return;
      }
      await addProject(project as Project);
      onProjectAdded();
      onClose();
      setProject({
        title: "",
        description: "",
        status: "planned",
        progress: 0,
        team: 1,
      });
    } catch (error) {
      console.error("Error adding project:", error);
      alert("Failed to add project");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContent, isDarkMode && styles.darkModalContent]}
        >
          <ScrollView>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
              New Project
            </Text>

            <Text style={[styles.label, isDarkMode && styles.darkText]}>
              Title
            </Text>
            <TextInput
              style={[
                styles.input,
                isDarkMode && styles.darkInput,
                isDarkMode && styles.darkText,
              ]}
              value={project.title}
              onChangeText={(text) =>
                setProject((prev) => ({ ...prev, title: text }))
              }
              placeholder="Project Title"
              placeholderTextColor={isDarkMode ? "#666" : "#999"}
            />

            <Text style={[styles.label, isDarkMode && styles.darkText]}>
              Description
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                isDarkMode && styles.darkInput,
                isDarkMode && styles.darkText,
              ]}
              value={project.description}
              onChangeText={(text) =>
                setProject((prev) => ({ ...prev, description: text }))
              }
              placeholder="Project Description"
              placeholderTextColor={isDarkMode ? "#666" : "#999"}
              multiline
              numberOfLines={4}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.buttonText}>Create Project</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  darkModalContent: {
    backgroundColor: "#1a1a1a",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  darkInput: {
    borderColor: "#333",
    backgroundColor: "#242424",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#666",
  },
  submitButton: {
    backgroundColor: "#f4511e",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  darkText: {
    color: "#fff",
  },
});
