import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../../global.css";
import { SettingsProvider } from "../context/settings-context";
import { ThemeProvider, useTheme } from "../context/theme-context";

function RootLayoutContent() {
  const { isDark } = useTheme();

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: isDark ? "#0a0a0a" : "#ffffff" }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: isDark ? "#0a0a0a" : "#ffffff" },
          animation: "slide_from_right",
        }}
      />
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <ThemeProvider>
          <RootLayoutContent />
        </ThemeProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
