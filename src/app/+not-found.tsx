// 404 Not Found Screen

import { Link, Stack } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../../components/ui/button";
import { H2, Muted } from "../../components/ui/text";

export default function NotFoundScreen() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View
        className="flex-1 bg-background items-center justify-center p-6"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <H2 className="mb-4">Page Not Found</H2>
        <Muted className="text-center mb-8">
          The page you're looking for doesn't exist.
        </Muted>
        <Link href="/" asChild>
          <Button>Go to Home</Button>
        </Link>
      </View>
    </>
  );
}
