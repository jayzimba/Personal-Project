import { Stack } from "expo-router";
import { useTheme } from "../../context/ThemeContext";

export default function TabLayout() {
  const { isDarkMode } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: isDarkMode ? "#1a1a1a" : "#f4511e",
        },
        headerTintColor: "#fff",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Project Details",
        }}
      />
      <Stack.Screen
        name="project-details"
        options={{
          title: "Project Details",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
