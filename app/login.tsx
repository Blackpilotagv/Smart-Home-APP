import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { colors, radii, spacing, typography } from "../src/theme";
import { useAuthStore } from "../src/store/auth";
import { api, setToken } from "../src/services/api";

export default function LoginScreen() {
  const router = useRouter();
  const { user, guestLogin, loading, bootstrapped, setSession } = useAuthStore();
  const [busyGoogle, setBusyGoogle] = useState(false);
  const [busyGuest, setBusyGuest] = useState(false);



  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  const handleGoogle = async () => {
    setBusyGoogle(true);
    try {
      const backendBase = process.env.EXPO_PUBLIC_BACKEND_URL;
      // Bridge page on backend forwards session_id to deep link iothome://auth-callback
      const redirectUrl = `${backendBase}/api/auth/bridge`;
      const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
      const appReturn = Linking.createURL("auth-callback");

      const result = await WebBrowser.openAuthSessionAsync(authUrl, appReturn);
      if (result.type === "success" && result.url) {
        const m = result.url.match(/session_id=([^&#]+)/);
        if (m) {
          const sessionId = decodeURIComponent(m[1]);
          const res: any = await api.exchangeSession(sessionId);
          await setToken(res.session_token);
          await setSession(res.session_token, res.user);
          return;
        }
      }
      if (result.type !== "cancel" && result.type !== "dismiss") {
        Alert.alert("Sign-in incomplete", "We could not retrieve your session. Please try again.");
      }
    } catch (e: any) {
      Alert.alert("Sign-in failed", e?.message || "Unknown error");
    } finally {
      setBusyGoogle(false);
    }
  };

  const handleGuest = async () => {
    setBusyGuest(true);
    try {
      console.log("Before login");
      await guestLogin();
      router.replace("/explore");
      

      console.log("After login");
    } catch (e: any) {
      Alert.alert("Demo login failed", e?.message || "Unknown error");
    } finally {
      setBusyGuest(false);
    }
  };

  return (
    <View style={styles.container} testID="login-screen">
      <LinearGradient
        colors={["#0a0a0a", "#050505", "#000000"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glowYellow} />
      <View style={styles.glowBlue} />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.content}>
          <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.brand}>
            <View style={styles.brandIcon}>
              <MaterialCommunityIcons name="home-automation" size={36} color={colors.bg} />
            </View>
            <Text style={styles.brandName}>HomeOS</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.heroBlock}>
            <Text style={styles.heroTitle}>Your home,{"\n"}intelligently controlled.</Text>
            <Text style={styles.heroSub}>
              Real-time MQTT control over lights, climate, locks, and energy — from anywhere.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.featuresRow}>
            <FeaturePill icon="bolt" label="Realtime" />
            <FeaturePill icon="shield-check" label="Secure" />
            <FeaturePill icon="lightning-bolt" label="MQTT" />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.actions}>
            <TouchableOpacity
              testID="google-login-btn"
              activeOpacity={0.85}
              style={styles.googleBtn}
              onPress={handleGoogle}
              disabled={busyGoogle || loading}
            >
              {busyGoogle ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <>
                  <Ionicons name="logo-google" size={20} color={colors.textInverse} />
                  <Text style={styles.googleBtnText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              testID="guest-login-btn"
              activeOpacity={0.85}
              style={styles.guestBtn}
              onPress={handleGuest}
              disabled={busyGuest || loading}
            >
              {busyGuest ? (
                <ActivityIndicator color={colors.textPrimary} />
              ) : (
                <>
                  <MaterialCommunityIcons name="rocket-launch-outline" size={20} color={colors.textPrimary} />
                  <Text style={styles.guestBtnText}>Try the Demo</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.legal}>
              By continuing, you agree to our Terms & Privacy Policy.
            </Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function FeaturePill({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.pill}>
      <MaterialCommunityIcons name={icon as any} size={14} color={colors.textPrimary} />
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  glowYellow: {
    position: "absolute",
    top: -120,
    right: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: colors.lighting,
    opacity: 0.18,
  },
  glowBlue: {
    position: "absolute",
    bottom: -160,
    left: -80,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: colors.cool,
    opacity: 0.14,
  },
  content: { flex: 1, padding: spacing.lg, justifyContent: "space-between" },
  brand: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: spacing.md },
  brandIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.lighting,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: { color: colors.textPrimary, fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
  heroBlock: { marginTop: 60 },
  heroTitle: { color: colors.textPrimary, ...typography.h1, fontWeight: "800" },
  heroSub: { color: colors.textSecondary, ...typography.bodyLg, marginTop: 16, lineHeight: 26 },
  featuresRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.glassBase,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
  },
  pillText: { color: colors.textPrimary, fontSize: 13, fontWeight: "600" },
  actions: { gap: 14, marginBottom: spacing.lg },
  googleBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.textPrimary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  googleBtnText: { color: colors.textInverse, fontSize: 16, fontWeight: "700" },
  guestBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.glassBase,
    borderColor: colors.borderActive,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  guestBtnText: { color: colors.textPrimary, fontSize: 16, fontWeight: "600" },
  legal: { color: colors.textTertiary, fontSize: 12, textAlign: "center", marginTop: 4 },
});
