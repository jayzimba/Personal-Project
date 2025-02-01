import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

export default function LoadingScreen() {
  const { isDarkMode } = useTheme();

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.content}>
        <Ionicons
          name="rocket"
          size={64}
          color="#f4511e"
          style={styles.icon}
        />
        <Text style={[styles.title, isDarkMode && styles.darkText]}>
          Project Manager
        </Text>
        <ActivityIndicator
          size="large"
          color="#f4511e"
          style={styles.spinner}
        />
        <Text style={[styles.subtitle, isDarkMode && styles.darkSecondaryText]}>
          Setting things up...
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  darkContainer: {
    backgroundColor: "#121212",
  },
  content: {
    alignItems: "center",
    padding: 20,
  },
  icon: {
    marginBottom: 20,
    transform: [{ rotate: "45deg" }],
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#333",
  },
  darkText: {
    color: "#fff",
  },
  spinner: {
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  darkSecondaryText: {
    color: "#999",
  },
}); 