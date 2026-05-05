import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../src/store/auth";

export default function Index() {
  const router = useRouter();
  const { user, bootstrap } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      await bootstrap();

      const currentUser = useAuthStore.getState().user;

      if (currentUser) {
        router.replace("/"); // goes to tabs
      } else {
        router.replace("/login");
      }
    };

    init();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator />
    </View>
  );
}
