import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Task, updateTask } from "../services/database";
import DateTimePicker from "@react-native-community/datetimepicker";

interface TaskEditModalProps {
  task: Task;
  visible: boolean;
  onClose: () => void;
  onTaskUpdated: () => void;
}

export default function TaskEditModal({
  task,
  visible,
  onClose,
  onTaskUpdated,
}: TaskEditModalProps) {
  const { isDarkMode } = useTheme();
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [dueDate, setDueDate] = useState(
    task?.due_date ? new Date(task.due_date) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setDueDate(new Date(task.due_date || Date.now()));
    }
  }, [task]);

  if (!task) {
    return null;
  }

  const handleSubmit = async () => {
    if (!title) {
      Alert.alert("Error", "Title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateTask(task.id!, {
        project_id: task.project_id,
        title,
        description,
        due_date: dueDate.toISOString(),
      });
      onTaskUpdated();
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Error", "Failed to update task");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible && !!task} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContent, isDarkMode && styles.darkModalContent]}
        >
          <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
            Edit Task
          </Text>

          <Text style={[styles.label, isDarkMode && styles.darkText]}>
            Title
          </Text>
          <TextInput
            style={[styles.input, isDarkMode && styles.darkInput]}
            value={title}
            onChangeText={setTitle}
            placeholder="Task title"
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
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Task description"
            placeholderTextColor={isDarkMode ? "#666" : "#999"}
            multiline
            numberOfLines={4}
          />

          <Text style={[styles.label, isDarkMode && styles.darkText]}>
            Due Date
          </Text>
          <TouchableOpacity
            style={[styles.input, isDarkMode && styles.darkInput]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={isDarkMode && styles.darkText}>
              {dueDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              onChange={(_, date) => {
                setShowDatePicker(false);
                if (date) setDueDate(date);
              }}
            />
          )}

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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>Update Task</Text>
              )}
            </TouchableOpacity>
          </View>
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
  },
  darkModalContent: {
    backgroundColor: "#1a1a1a",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  darkText: {
    color: "#fff",
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
  },
  darkInput: {
    borderColor: "#333",
    backgroundColor: "#242424",
    color: "#fff",
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
    backgroundColor: "#2196F3",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
