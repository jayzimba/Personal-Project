import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { initDatabase } from "../services/database";
import LoadingScreen from "../components/LoadingScreen";

function ThemeToggleButton() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 15 }}>
      <Ionicons name={isDarkMode ? "sunny" : "moon"} size={24} color="white" />
    </TouchableOpacity>
  );
}

function LayoutContent() {
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      try {
        console.log("Starting app initialization...");
        await initDatabase();
        console.log("Database initialized");

        // Show loading screen for at least 2 seconds
        await new Promise((resolve) => setTimeout(resolve, 3500));
        setIsLoading(false);
      } catch (error) {
        console.error("Error during initialization:", error);
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: isDarkMode ? "#1a1a1a" : "#f4511e",
          },
          headerTintColor: "#fff",
          headerRight: () => <ThemeToggleButton />,
          contentStyle: {
            backgroundColor: isDarkMode ? "#121212" : "#f5f5f5",
          },
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Dashboard",
          }}
        />
        <Stack.Screen
          name="projects"
          options={{
            title: "Projects",
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            title: "Details",
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

export default function Layout() {
  return (
    <ThemeProvider>
      <LayoutContent />
    </ThemeProvider>
  );
}
