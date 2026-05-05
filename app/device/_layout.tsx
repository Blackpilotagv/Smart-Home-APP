import { Stack } from "expo-router";
import { useAuthStore } from "../../src/store/auth";
import { useEffect } from "react";

export default function RootLayout() {
  const bootstrap = useAuthStore((state) => state.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
