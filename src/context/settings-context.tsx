// Settings Context
// Manages user reading preferences including focus accent color

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

// Available accent colors with their names
export const ACCENT_COLORS = [
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Green", value: "#22c55e" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
] as const;

export type AccentColor = (typeof ACCENT_COLORS)[number]["value"];

interface SettingsContextType {
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

const SETTINGS_STORAGE_KEY = "@readfast/settings";

interface StoredSettings {
  accentColor?: AccentColor;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [accentColor, setAccentColorState] = useState<AccentColor>("#ef4444");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved settings
  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_STORAGE_KEY)
      .then((savedSettings) => {
        if (savedSettings) {
          try {
            const parsed: StoredSettings = JSON.parse(savedSettings);
            if (parsed.accentColor) {
              setAccentColorState(parsed.accentColor);
            }
          } catch (e) {
            console.warn("Failed to parse settings:", e);
          }
        }
      })
      .finally(() => setIsLoaded(true));
  }, []);

  // Save accent color preference
  const setAccentColor = async (color: AccentColor) => {
    setAccentColorState(color);
    const currentSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    const parsed: StoredSettings = currentSettings
      ? JSON.parse(currentSettings)
      : {};
    parsed.accentColor = color;
    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(parsed));
  };

  // Don't render until we've loaded the saved preference
  if (!isLoaded) {
    return null;
  }

  return (
    <SettingsContext.Provider value={{ accentColor, setAccentColor }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
