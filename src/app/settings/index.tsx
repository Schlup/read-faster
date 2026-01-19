// Settings Screen

import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card, CardContent } from "../../../components/ui/card";
import { IconButton } from "../../../components/ui/icon-button";
import { Separator } from "../../../components/ui/separator";
import { H3, Muted, P, Small } from "../../../components/ui/text";
import "../../../global.css";
import {
    ACCENT_COLORS,
    AccentColor,
    useSettings,
} from "../../context/settings-context";
import { ThemeMode, useTheme } from "../../context/theme-context";

interface SettingRowProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  isDark: boolean;
}

function SettingRow({
  icon,
  label,
  value,
  onPress,
  showChevron = true,
  isDark,
}: SettingRowProps) {
  const iconColor = isDark ? "#a1a1a1" : "#737373";
  const chevronColor = isDark ? "#525252" : "#a3a3a3";
  const secondaryBg = isDark ? "#262626" : "#f5f5f5";

  return (
    <Pressable
      className="flex-row items-center py-3 active:opacity-60"
      onPress={onPress}
    >
      <View
        className="w-10 h-10 rounded-lg items-center justify-center mr-4"
        style={{ backgroundColor: secondaryBg }}
      >
        <Feather name={icon as any} size={20} color={iconColor} />
      </View>
      <View className="flex-1">
        <P style={{ color: isDark ? "#fafafa" : "#0a0a0a" }}>{label}</P>
        {value && (
          <Muted style={{ color: isDark ? "#a3a3a3" : "#737373", marginTop: 2 }}>
            {value}
          </Muted>
        )}
      </View>
      {showChevron && <Feather name="chevron-right" size={20} color={chevronColor} />}
    </Pressable>
  );
}

interface SettingsGroupProps {
  title: string;
  children: React.ReactNode;
  isDark: boolean;
}

function SettingsGroup({ title, children, isDark }: SettingsGroupProps) {
  const cardBg = isDark ? "#141414" : "#f5f5f5";
  const borderColor = isDark ? "#2e2e2e" : "#e5e5e5";

  return (
    <View className="mb-6">
      <Small
        className="mb-3 px-1"
        style={{ color: isDark ? "#a3a3a3" : "#737373" }}
      >
        {title}
      </Small>
      <Card
        style={{
          backgroundColor: cardBg,
          borderWidth: 1,
          borderColor: borderColor,
          borderRadius: 12,
        }}
      >
        <CardContent className="py-2">{children}</CardContent>
      </Card>
    </View>
  );
}

// Theme selector component
interface ThemeSelectorProps {
  isDark: boolean;
  themeMode: ThemeMode;
  onSelect: (mode: ThemeMode) => void;
}

function ThemeSelector({ isDark, themeMode, onSelect }: ThemeSelectorProps) {
  const options: { mode: ThemeMode; label: string; icon: string }[] = [
    { mode: "system", label: "System", icon: "smartphone" },
    { mode: "light", label: "Light", icon: "sun" },
    { mode: "dark", label: "Dark", icon: "moon" },
  ];

  const activeBg = isDark ? "#fafafa" : "#171717";
  const activeText = isDark ? "#0a0a0a" : "#fafafa";
  const inactiveBg = isDark ? "#262626" : "#e5e5e5";
  const inactiveText = isDark ? "#a3a3a3" : "#737373";

  return (
    <View className="flex-row gap-2 mt-3">
      {options.map((option) => {
        const isActive = themeMode === option.mode;
        return (
          <Pressable
            key={option.mode}
            className="flex-1 flex-row items-center justify-center py-3 rounded-lg"
            style={{
              backgroundColor: isActive ? activeBg : inactiveBg,
            }}
            onPress={() => onSelect(option.mode)}
          >
            <Feather
              name={option.icon as any}
              size={16}
              color={isActive ? activeText : inactiveText}
              style={{ marginRight: 6 }}
            />
            <Small style={{ color: isActive ? activeText : inactiveText }}>
              {option.label}
            </Small>
          </Pressable>
        );
      })}
    </View>
  );
}

// Accent color picker component
interface AccentColorPickerProps {
  isDark: boolean;
  currentColor: AccentColor;
  onSelect: (color: AccentColor) => void;
}

function AccentColorPicker({
  isDark,
  currentColor,
  onSelect,
}: AccentColorPickerProps) {
  const borderColor = isDark ? "#404040" : "#d4d4d4";

  return (
    <View className="flex-row flex-wrap gap-3 mt-3">
      {ACCENT_COLORS.map((color) => {
        const isActive = currentColor === color.value;
        return (
          <Pressable
            key={color.value}
            className="items-center"
            onPress={() => onSelect(color.value)}
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{
                backgroundColor: color.value,
                borderWidth: isActive ? 3 : 0,
                borderColor: isDark ? "#fafafa" : "#0a0a0a",
              }}
            >
              {isActive && (
                <Feather name="check" size={18} color="#ffffff" />
              )}
            </View>
            <Small
              style={{
                color: isDark ? "#a3a3a3" : "#737373",
                marginTop: 4,
                fontSize: 10,
              }}
            >
              {color.name}
            </Small>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, themeMode, setThemeMode } = useTheme();
  const { accentColor, setAccentColor } = useSettings();

  // Theme-aware colors
  const bgColor = isDark ? "#0a0a0a" : "#ffffff";
  const borderColor = isDark ? "#2e2e2e" : "#e5e5e5";
  const iconColor = isDark ? "#fafafa" : "#0a0a0a";

  // Get display value for current theme
  const getThemeDisplayValue = () => {
    switch (themeMode) {
      case "system":
        return `System (${isDark ? "Dark" : "Light"})`;
      case "light":
        return "Light";
      case "dark":
        return "Dark";
    }
  };

  // Get accent color name
  const getAccentColorName = () => {
    return ACCENT_COLORS.find((c) => c.value === accentColor)?.name || "Red";
  };

  return (
    <View className="flex-1" style={{ backgroundColor: bgColor, paddingTop: insets.top }}>
      {/* Header */}
      <View
        className="flex-row items-center px-4 py-4"
        style={{ borderBottomWidth: 1, borderBottomColor: borderColor }}
      >
        <IconButton
          variant="ghost"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={22} color={iconColor} />
        </IconButton>
        <H3 className="ml-2" style={{ color: isDark ? "#fafafa" : "#0a0a0a" }}>
          Settings
        </H3>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Settings */}
        <SettingsGroup title="APPEARANCE" isDark={isDark}>
          <P style={{ color: isDark ? "#fafafa" : "#0a0a0a", marginBottom: 4 }}>
            Theme
          </P>
          <Muted style={{ color: isDark ? "#a3a3a3" : "#737373" }}>
            {getThemeDisplayValue()}
          </Muted>
          <ThemeSelector
            isDark={isDark}
            themeMode={themeMode}
            onSelect={setThemeMode}
          />
        </SettingsGroup>

        {/* Reading Settings */}
        <SettingsGroup title="READING" isDark={isDark}>
          <P style={{ color: isDark ? "#fafafa" : "#0a0a0a", marginBottom: 4 }}>
            Focus Character Color
          </P>
          <Muted style={{ color: isDark ? "#a3a3a3" : "#737373" }}>
            Highlights the optimal focus point: {getAccentColorName()}
          </Muted>
          <AccentColorPicker
            isDark={isDark}
            currentColor={accentColor}
            onSelect={setAccentColor}
          />
          <Separator style={{ backgroundColor: borderColor, marginVertical: 12 }} />
          <SettingRow
            icon="zap"
            label="Reading Speed"
            value="300 WPM"
            onPress={() => {}}
            isDark={isDark}
          />
          <Separator style={{ backgroundColor: borderColor }} />
          <SettingRow
            icon="type"
            label="Font & Size"
            value="System, 24pt"
            onPress={() => {}}
            isDark={isDark}
          />
        </SettingsGroup>

        {/* Display Settings */}
        <SettingsGroup title="DISPLAY" isDark={isDark}>
          <SettingRow
            icon="align-left"
            label="Show Context Line"
            value="Enabled"
            onPress={() => {}}
            isDark={isDark}
          />
        </SettingsGroup>

        {/* Touch Controls */}
        <SettingsGroup title="CONTROLS" isDark={isDark}>
          <SettingRow
            icon="navigation"
            label="Touch Navigation"
            value="Skip 10 words"
            onPress={() => {}}
            isDark={isDark}
          />
          <Separator style={{ backgroundColor: borderColor }} />
          <SettingRow
            icon="target"
            label="Tap to Pause"
            value="Center of screen"
            onPress={() => {}}
            isDark={isDark}
          />
        </SettingsGroup>

        {/* About */}
        <SettingsGroup title="ABOUT" isDark={isDark}>
          <SettingRow
            icon="info"
            label="About ReadFast"
            value="Version 1.0.0"
            onPress={() => {}}
            isDark={isDark}
          />
          <Separator style={{ backgroundColor: borderColor }} />
          <SettingRow
            icon="github"
            label="Source Code"
            onPress={() => {}}
            isDark={isDark}
          />
        </SettingsGroup>

        {/* Spacer for bottom */}
        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
    </View>
  );
}
