import { useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";

import { useRouter } from "expo-router";

import { LinearGradient } from "expo-linear-gradient";

import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import { SafeAreaView } from "react-native-safe-area-context";

import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";

import {
  colors,
  radii,
  spacing,
  typography,
} from "../src/theme";

import {
  useAuthStore,
} from "../src/store/auth";

export default function LoginScreen() {

  const router = useRouter();

  const {
    login,
    loading,
  } = useAuthStore();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  // =========================
  // LOGIN
  // =========================

  const handleLogin =
    async () => {

      try {

        await login(
          email,
          password
        );

        router.replace(
          "/explore"
        );

      } catch (e: any) {

        Alert.alert(
          "Login Failed",
          e?.message ||
          "Something went wrong"
        );
      }
    };

  return (

    <View
      style={styles.container}
    >

      <LinearGradient
        colors={[
          "#0a0a0a",
          "#050505",
          "#000000",
        ]}
        style={
          StyleSheet.absoluteFill
        }
      />

      <View
        style={styles.glowYellow}
      />

      <View
        style={styles.glowBlue}
      />

      <SafeAreaView
        style={{ flex: 1 }}
      >

        <View
          style={styles.content}
        >

          {/* ========================= */}
          {/* BRAND */}
          {/* ========================= */}

          <Animated.View
            entering={
              FadeInUp
                .delay(100)
                .springify()
            }
            style={styles.brand}
          >

            <View
              style={styles.brandIcon}
            >

              <MaterialCommunityIcons
                name="home-automation"
                size={36}
                color={colors.bg}
              />

            </View>

            <Text
              style={styles.brandName}
            >
              HomeOS
            </Text>

          </Animated.View>

          {/* ========================= */}
          {/* HERO */}
          {/* ========================= */}

          <Animated.View
            entering={
              FadeInDown
                .delay(200)
                .springify()
            }
            style={styles.heroBlock}
          >

            <Text
              style={styles.heroTitle}
            >
              Your home,
              {"\n"}
              intelligently controlled.
            </Text>

            <Text
              style={styles.heroSub}
            >
              Real-time MQTT control
              over lights, climate,
              locks and automation.
            </Text>

          </Animated.View>

          {/* ========================= */}
          {/* FEATURES */}
          {/* ========================= */}

          <Animated.View
            entering={
              FadeInDown
                .delay(400)
                .springify()
            }
            style={styles.featuresRow}
          >

            <FeaturePill
              icon="bolt"
              label="Realtime"
            />

            <FeaturePill
              icon="shield-check"
              label="Secure"
            />

            <FeaturePill
              icon="lightning-bolt"
              label="MQTT"
            />

          </Animated.View>

          {/* ========================= */}
          {/* LOGIN FORM */}
          {/* ========================= */}

          <Animated.View
            entering={
              FadeInDown
                .delay(600)
                .springify()
            }
            style={styles.actions}
          >

            <TextInput
              placeholder="Email"
              placeholderTextColor="#777"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />

            <TextInput
              placeholder="Password"
              placeholderTextColor="#777"
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.loginBtn}
              onPress={handleLogin}
              disabled={loading}
            >

              {loading ? (

                <ActivityIndicator
                  color={
                    colors.textInverse
                  }
                />

              ) : (

                <>
                  <Ionicons
                    name="log-in-outline"
                    size={20}
                    color={
                      colors.textInverse
                    }
                  />

                  <Text
                    style={
                      styles.loginBtnText
                    }
                  >
                    Login
                  </Text>
                </>
              )}

            </TouchableOpacity>

            {/* REGISTER */}

            <TouchableOpacity
              style={styles.registerBtn}
              onPress={() =>
                router.push(
                  "../register"
                )
              }
            >

              <Text
                style={
                  styles.registerText
                }
              >
                Create Account
              </Text>

            </TouchableOpacity>

          </Animated.View>

        </View>

      </SafeAreaView>

    </View>
  );
}

function FeaturePill({
  icon,
  label,
}: {
  icon: string;
  label: string;
}) {

  return (

    <View style={styles.pill}>

      <MaterialCommunityIcons
        name={icon as any}
        size={14}
        color={colors.textPrimary}
      />

      <Text style={styles.pillText}>
        {label}
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  glowYellow: {
    position: "absolute",
    top: -120,
    right: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor:
      colors.lighting,
    opacity: 0.18,
  },

  glowBlue: {
    position: "absolute",
    bottom: -160,
    left: -80,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor:
      colors.cool,
    opacity: 0.14,
  },

  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent:
      "space-between",
  },

  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: spacing.md,
  },

  brandIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor:
      colors.lighting,
    alignItems: "center",
    justifyContent: "center",
  },

  brandName: {
    color:
      colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  heroBlock: {
    marginTop: 60,
  },

  heroTitle: {
    color:
      colors.textPrimary,
    ...typography.h1,
    fontWeight: "800",
  },

  heroSub: {
    color:
      colors.textSecondary,
    ...typography.bodyLg,
    marginTop: 16,
    lineHeight: 26,
  },

  featuresRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor:
      colors.glassBase,
    borderColor:
      colors.border,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius:
      radii.pill,
  },

  pillText: {
    color:
      colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },

  actions: {
    gap: 14,
    marginBottom:
      spacing.lg,
  },

  input: {
    height: 56,
    borderRadius: 18,
    backgroundColor:
      colors.glassBase,
    borderWidth: 1,
    borderColor:
      colors.border,
    paddingHorizontal: 18,
    color:
      colors.textPrimary,
    fontSize: 16,
  },

  loginBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor:
      colors.textPrimary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  loginBtnText: {
    color:
      colors.textInverse,
    fontSize: 16,
    fontWeight: "700",
  },

  registerBtn: {
    alignItems: "center",
    marginTop: 8,
  },

  registerText: {
    color:
      colors.lighting,
    fontSize: 15,
    fontWeight: "600",
  },
});