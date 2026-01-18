// GALLERY, where all the PDFs are stored

import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { Button } from "../../components/ui/button";
import "../../global.css";

export default function Index() {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center items-center bg-background">
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Button variant={"default"} onPress={() => router.push("/settings")}>
        Configurações
      </Button>
    </View>
  );
}
