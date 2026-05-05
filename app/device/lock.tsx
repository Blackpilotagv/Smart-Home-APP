import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withRepeat,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors, radii, spacing, typography } from "../../src/theme";
import { useDevicesStore } from "../../src/store/devices";
import { api } from "../../src/services/api";
import { useAuthStore } from "../../src/store/auth";

type Log = {
  log_id: string;
  device_id: string;
  action: string;
  actor_name: string;
  timestamp: string;
};

export default function LockScreen() {
  const router = useRouter();
  const { devices, toggleDevice } = useDevicesStore();
  const user = useAuthStore((s) => s.user);
  const lock = devices.find((d) => d.type === "lock");
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.4);

  useEffect(() => {
    ringScale.value = withRepeat(withTiming(1.4, { duration: 1800 }), -1, false);
    ringOpacity.value = withRepeat(withTiming(0, { duration: 1800 }), -1, false);
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const loadLogs = async () => {
    if (!lock) return;
    setLoading(true);
    try {
      const list = await api.listAccessLogs(lock.device_id);
      setLogs(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [lock?.device_id]);

  if (!lock) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.textSecondary }}>No smart lock added</Text>
        </SafeAreaView>
      </View>
    );
  }

  const isLocked = lock.status;
  const accent = isLocked ? colors.energy : colors.heat;

  const onToggle = async () => {
    Haptics.notificationAsync(
      isLocked ? Haptics.NotificationFeedbackType.Warning : Haptics.NotificationFeedbackType.Success,
    );
    await toggleDevice(lock.device_id);
    await api.createAccessLog({
      device_id: lock.device_id,
      action: isLocked ? "unlock" : "lock",
      actor_name: user?.name || "You",
    });
    loadLogs();
  };

  return (
    <View style={styles.container} testID="lock-screen">
      <LinearGradient colors={[`${accent}33`, colors.bg]} style={styles.headerGrad} />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} testID="lock-back">
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Smart Lock</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeIn} style={styles.lockHero}>
            <View style={styles.ringWrap}>
              <Animated.View style={[styles.ring, { borderColor: accent }, ringStyle]} />
              <View style={[styles.ring2, { borderColor: `${accent}55` }]} />
              <TouchableOpacity
                testID="lock-toggle-btn"
                onPress={onToggle}
                activeOpacity={0.85}
                style={[styles.lockBtn, { backgroundColor: accent }]}
              >
                <MaterialCommunityIcons name={isLocked ? "lock" : "lock-open-variant"} size={64} color={colors.textInverse} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.lockStatus, { color: accent }]}>
              {isLocked ? "LOCKED" : "UNLOCKED"}
            </Text>
            <Text style={styles.lockHint}>{lock.name} · {lock.room}</Text>
            <Text style={styles.tapHint}>Tap to {isLocked ? "unlock" : "lock"}</Text>
          </Animated.View>

          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Access logs</Text>
              <Text style={styles.sectionCount}>{logs.length}</Text>
            </View>
            {loading ? (
              <ActivityIndicator color={colors.lighting} style={{ marginTop: 20 }} />
            ) : logs.length === 0 ? (
              <Text style={styles.empty}>No access logs yet</Text>
            ) : (
              logs.map((l) => (
                <View key={l.log_id} style={styles.logRow} testID={`log-${l.log_id}`}>
                  <View
                    style={[
                      styles.logDot,
                      { backgroundColor: l.action === "unlock" ? colors.heat : colors.energy },
                    ]}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.logAction}>
                      {l.action === "unlock" ? "Unlocked" : l.action === "lock" ? "Locked" : "Access denied"}
                      <Text style={styles.logBy}> by {l.actor_name}</Text>
                    </Text>
                    <Text style={styles.logTime}>{relativeTime(l.timestamp)}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  const diff = (Date.now() - t) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerGrad: { position: "absolute", top: 0, left: 0, right: 0, height: 360 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: spacing.md },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.glassBase, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
  title: { color: colors.textPrimary, fontSize: 17, fontWeight: "700" },
  scroll: { padding: spacing.lg, paddingBottom: 60 },

  lockHero: { alignItems: "center", paddingVertical: 24, gap: 8 },
  ringWrap: { width: 220, height: 220, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  ring: { position: "absolute", width: 200, height: 200, borderRadius: 100, borderWidth: 2 },
  ring2: { position: "absolute", width: 170, height: 170, borderRadius: 85, borderWidth: 1 },
  lockBtn: { width: 140, height: 140, borderRadius: 70, alignItems: "center", justifyContent: "center" },
  lockStatus: { fontSize: 32, fontWeight: "800", letterSpacing: 4, marginTop: 8 },
  lockHint: { color: colors.textSecondary, fontSize: 14, marginTop: 4 },
  tapHint: { color: colors.textTertiary, fontSize: 13, marginTop: 4 },

  section: { marginTop: 28 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: "700" },
  sectionCount: { color: colors.textTertiary, fontSize: 14, fontWeight: "600" },
  logRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
  logDot: { width: 10, height: 10, borderRadius: 5 },
  logAction: { color: colors.textPrimary, fontSize: 15, fontWeight: "600" },
  logBy: { color: colors.textTertiary, fontWeight: "500" },
  logTime: { color: colors.textTertiary, fontSize: 12, marginTop: 2 },
  empty: { color: colors.textTertiary, textAlign: "center", paddingVertical: 24 },
});
