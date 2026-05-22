import { useEffect } from "react";

import {
  View,
  ActivityIndicator,
} from "react-native";

import {
  useRouter,
} from "expo-router";

import { useAuthStore }
from "../src/store/auth";

export default function Index() {

  const router = useRouter();

  const user =
    useAuthStore(
      (state) => state.user
    );

  const bootstrapped =
    useAuthStore(
      (state) => state.bootstrapped
    );

  useEffect(() => {

    useAuthStore
      .getState()
      .bootstrap();

  }, []);

  useEffect(() => {

    if (!bootstrapped) return;

    if (user) {

      router.replace("/explore");

    } else {

      router.replace("/login");
    }

  }, [bootstrapped, user]);

  return (

    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >

      <ActivityIndicator
        size="large"
      />

    </View>
  );
}