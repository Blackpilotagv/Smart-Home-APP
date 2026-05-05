import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { Slot } from "expo-router";
import { useAuthStore } from "../src/store/auth";
import { colors } from "../src/theme";

export default function RootLayout() {
  const { bootstrapped, bootstrap } = useAuthStore();

  useEffect(() => {
    bootstrap();
  }, []);

  if (!bootstrapped) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.bg,
        }}
      >
        <ActivityIndicator size="large" color={colors.lighting} />
      </View>
    );
  }

  return <Slot />;
}
