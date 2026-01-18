// GALLERY, where all the PDFs are stored

import { Button } from "@react-navigation/elements";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import "../../global.css";

export default function Index() {
  const router = useRouter();

  return (
    <View
      style={{
        backgroundColor: "black",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text className="color-red-900 ">
        Edit app/index.tsx to edit this screen.
      </Text>
      <Button
        onPress={() => {
          router.navigate("/configurations");
        }}
      >
        Configurações
      </Button>
    </View>
  );
}
