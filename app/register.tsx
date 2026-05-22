import { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import { useRouter } from "expo-router";

import {
  useAuthStore,
} from "../src/store/auth";

export default function RegisterScreen() {

  const router = useRouter();

  const {
    register,
    loading,
  } = useAuthStore();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const handleRegister =
    async () => {

      try {

        await register(
          name,
          email,
          password
        );

        Alert.alert(
          "Success",
          "Account created"
        );

        router.replace(
          "/explore"
        );

      } catch (e: any) {

        Alert.alert(
          "Register Failed",
          e?.message
        );
      }
    };

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Create Account
      </Text>

      <TextInput
        placeholder="Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
      >

        <Text style={styles.btnText}>
          Register
        </Text>

      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#000",
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 30,
  },

  input: {
    height: 55,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 14,
    paddingHorizontal: 16,
    color: "#fff",
    marginBottom: 16,
    backgroundColor: "#111",
  },

  button: {
    height: 55,
    borderRadius: 14,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  btnText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 16,
  },
});