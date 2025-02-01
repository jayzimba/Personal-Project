import React, { useState, useEffect } from "react";
import { Modal, View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Project, getProjects } from "../services/database";
import DropDownPicker from "react-native-dropdown-picker";
import { router } from "expo-router";

interface SelectProjectModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SelectProjectModal({
  visible,
  onClose,
}: SelectProjectModalProps) {
  const { isDarkMode } = useTheme();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const projectsData = await getProjects();
      const formattedProjects = projectsData.map((project) => ({
        label: project.title,
        value: project.id,
        project: project,
      }));
      setProjects(formattedProjects);
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  const handleProjectSelect = (project: Project) => {
    onClose();
    router.push({
      pathname: "/project-details",
      params: { project: JSON.stringify(project) },
    });
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
            Select Project
          </Text>

          <DropDownPicker
            open={open}
            value={value}
            items={projects}
            setOpen={setOpen}
            setValue={setValue}
            setItems={setProjects}
            searchable={true}
            searchPlaceholder="Search projects..."
            placeholder="Select a project"
            searchTextInputProps={{
              maxLength: 40,
              style: [
                styles.searchInput,
                isDarkMode && styles.darkSearchInput,
              ],
            }}
            listMode="SCROLLVIEW"
            scrollViewProps={{
              nestedScrollEnabled: true,
            }}
            searchContainerStyle={[
              styles.searchContainer,
              isDarkMode && styles.darkSearchContainer,
            ]}
            style={[styles.dropdown, isDarkMode && styles.darkDropdown]}
            textStyle={[styles.dropdownText, isDarkMode && styles.darkText]}
            dropDownContainerStyle={[
              styles.dropdownContainer,
              isDarkMode && styles.darkDropdownContainer,
            ]}
            searchTextInputStyle={styles.searchTextInput}
            placeholderStyle={[
              styles.placeholder,
              isDarkMode && styles.darkPlaceholder,
            ]}
            selectedItemContainerStyle={styles.selectedItem}
            selectedItemLabelStyle={styles.selectedItemLabel}
            theme={isDarkMode ? "DARK" : "LIGHT"}
            onSelectItem={(item) => {
              handleProjectSelect(item.project);
            }}
          />

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
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
  dropdown: {
    borderColor: "#ddd",
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  darkDropdown: {
    backgroundColor: "#333",
    borderColor: "#444",
  },
  dropdownContainer: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  darkDropdownContainer: {
    backgroundColor: "#333",
    borderColor: "#444",
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  searchContainer: {
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    padding: 12,
  },
  darkSearchContainer: {
    borderBottomColor: "#444",
    backgroundColor: "#333",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: "#f5f5f5",
  },
  darkSearchInput: {
    backgroundColor: "#242424",
    borderColor: "#444",
    color: "#fff",
  },
  searchTextInput: {
    fontSize: 16,
  },
  placeholder: {
    color: "#999",
    fontSize: 16,
  },
  darkPlaceholder: {
    color: "#666",
  },
  selectedItem: {
    backgroundColor: "#f4511e15",
  },
  selectedItemLabel: {
    color: "#f4511e",
    fontWeight: "600",
  },
  cancelButton: {
    padding: 16,
    backgroundColor: "#666",
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
