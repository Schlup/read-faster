import { Text } from "@react-navigation/elements";
import { View } from "react-native";
import SettingsIcon from "../settings/SettingsIcon";

export default function ShelfNavbar() {
  return (
    <View className="flex-row justify-between items-center">
      {/* Texto na Esquerda */}
      <Text className="text-white text-2xl font-bold">Shelf</Text>

      {/* Ícone na Direita */}
      <SettingsIcon />
    </View>
  );
}
