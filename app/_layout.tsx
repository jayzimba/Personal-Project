import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
