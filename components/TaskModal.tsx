import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import { addTask } from "../services/database";

interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
  projectId: number;
  onTaskAdded: () => void;
}

export default function TaskModal({
  visible,
  onClose,
  projectId,
  onTaskAdded,
}: TaskModalProps) {
  const { isDarkMode } = useTheme();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = async () => {
    try {
      await addTask({
        project_id: projectId,
        title,
        description,
        status: "pending",
        due_date: dueDate.toISOString(),
      });
      onTaskAdded();
      onClose();
      setTitle("");
      setDescription("");
      setDueDate(new Date());
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View
        style={[styles.modalContainer, isDarkMode && styles.darkModalContainer]}
      >
        <View
          style={[styles.modalContent, isDarkMode && styles.darkModalContent]}
        >
          <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
            Add New Task
          </Text>

          <TextInput
            style={[styles.input, isDarkMode && styles.darkInput]}
            placeholder="Task Title"
            placeholderTextColor={isDarkMode ? "#666" : "#999"}
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={[
              styles.input,
              styles.textArea,
              isDarkMode && styles.darkInput,
            ]}
            placeholder="Description"
            placeholderTextColor={isDarkMode ? "#666" : "#999"}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text
              style={[styles.dateButtonText, isDarkMode && styles.darkText]}
            >
              Due Date: {dueDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setDueDate(selectedDate);
                }
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
            >
              <Text style={styles.buttonText}>Add Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  darkModalContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkModalContent: {
    backgroundColor: "#1a1a1a",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  darkText: {
    color: "#fff",
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
    color: "#fff",
    backgroundColor: "#333",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  dateButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 16,
  },
  dateButtonText: {
    fontSize: 16,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: "#f4511e",
  },
  cancelButton: {
    backgroundColor: "#666",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
