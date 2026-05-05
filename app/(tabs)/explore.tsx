import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

import { colors, radii, spacing, typography } from "../../src/theme";
import { useAuthStore } from "../../src/store/auth";
import { useDevicesStore } from "../../src/store/devices";
import { mqttService } from "../../src/services/mqtt";
import DeviceCard from "../../src/components/DeviceCard";

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { devices, loading, fetchDevices, bindMqtt } = useDevicesStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeRoom, setActiveRoom] = useState<string>("All");
  const [mqttConnected, setMqttConnected] = useState(mqttService.isConnected());

  useEffect(() => {
    fetchDevices();
    const unsubStatus = bindMqtt();
    const unsubConn = mqttService.onConnection(setMqttConnected);
    return () => {
      unsubStatus();
      unsubConn();
    };
  }, [fetchDevices, bindMqtt]);

  const rooms = useMemo(() => ["All", ...Array.from(new Set(devices.map((d) => d.room)))], [devices]);
  const filtered = activeRoom === "All" ? devices : devices.filter((d) => d.room === activeRoom);
  const onCount = devices.filter((d) => d.status).length;
  const totalEnergy = devices.reduce((acc, d) => acc + (d.status ? d.energy_watts || 0 : 0), 0);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDevices();
    setRefreshing(false);
  };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <View style={styles.container} testID="dashboard-screen">
      <LinearGradient colors={["#0d0d10", colors.bg]} style={styles.headerGradient} />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.lighting} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Top bar */}
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.topRow}>
            <View>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.name?.split(" ")[0] || "Welcome"}
              </Text>
            </View>
            <TouchableOpacity
              testID="notifications-btn"
              style={styles.iconBtn}
              onPress={() => router.push("/device/notifications")}
            >
              <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
              <View style={styles.dot} />
            </TouchableOpacity>
          </Animated.View>

          {/* Status hero */}
          <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.heroCard} testID="hero-card">
            <LinearGradient
              colors={["rgba(255,214,10,0.16)", "rgba(10,132,255,0.08)"]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.heroRow}>
              <View style={styles.heroBlock}>
                <Text style={styles.heroLabel}>Active devices</Text>
                <Text style={styles.heroValue}>
                  {onCount}
                  <Text style={styles.heroValueSmall}>/{devices.length}</Text>
                </Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroBlock}>
                <Text style={styles.heroLabel}>Live consumption</Text>
                <Text style={styles.heroValue}>
                  {(totalEnergy / 1000).toFixed(2)}
                  <Text style={styles.heroValueSmall}> kW</Text>
                </Text>
              </View>
            </View>
            <View style={styles.connRow} testID="mqtt-status">
              <View style={[styles.connPulse, { backgroundColor: mqttConnected ? colors.energy : colors.security }]} />
              <Text style={styles.connText}>
                MQTT {mqttConnected ? "connected" : "connecting…"} · broker.hivemq.com
              </Text>
            </View>
          </Animated.View>

          {/* Quick actions */}
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.quickRow}>
            <QuickAction
              icon="lock"
              label="Smart Lock"
              color={colors.security}
              onPress={() => router.push("/device/lock")}
              testID="quick-lock"
            />
            <QuickAction
              icon="doorbell-video"
              label="Doorbell"
              color={colors.security}
              onPress={() => router.push("/device/doorbell")}
              testID="quick-doorbell"
            />
            <QuickAction
              icon="plus"
              label="Add"
              color={colors.energy}
              onPress={() => router.push("/device/add-device")}
              testID="quick-add"
            />
          </Animated.View>

          {/* Room filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
            style={{ marginTop: spacing.md }}
          >
            {rooms.map((r) => (
              <TouchableOpacity
                testID={`chip-${r}`}
                key={r}
                onPress={() => setActiveRoom(r)}
                style={[styles.chip, activeRoom === r && styles.chipActive]}
              >
                <Text style={[styles.chipText, activeRoom === r && styles.chipTextActive]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Section header */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Your devices</Text>
            <Text style={styles.sectionCount}>{filtered.length}</Text>
          </View>

          {loading && devices.length === 0 ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.lighting} />
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.empty} testID="empty-devices">
              <MaterialCommunityIcons name="home-search-outline" size={42} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No devices yet</Text>
              <Text style={styles.emptySub}>Add your first device to start automating</Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => router.push("/device/add-device")}
                testID="empty-add-btn"
              >
                <Text style={styles.emptyBtnText}>Add Device</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.grid}>
              {filtered.map((d) => (
                <DeviceCard key={d.device_id} device={d} />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  color,
  onPress,
  testID,
}: {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <TouchableOpacity testID={testID} activeOpacity={0.85} style={styles.quick} onPress={onPress}>
      <View style={[styles.quickIcon, { backgroundColor: `${color}26` }]}>
        <MaterialCommunityIcons name={icon as any} size={22} color={color} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerGradient: { position: "absolute", top: 0, left: 0, right: 0, height: 280 },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: 130 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  greeting: { color: colors.textTertiary, fontSize: 14, fontWeight: "500" },
  userName: { color: colors.textPrimary, ...typography.h2, marginTop: 2 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.glassBase,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: { position: "absolute", top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.heat },

  heroCard: {
    marginTop: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderActive,
    padding: 20,
    overflow: "hidden",
    backgroundColor: colors.glassBase,
  },
  heroRow: { flexDirection: "row", alignItems: "center" },
  heroBlock: { flex: 1 },
  heroDivider: { width: 1, height: 40, backgroundColor: colors.border, marginHorizontal: 16 },
  heroLabel: { color: colors.textTertiary, fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.8 },
  heroValue: { color: colors.textPrimary, fontSize: 32, fontWeight: "800", marginTop: 4 },
  heroValueSmall: { color: colors.textTertiary, fontSize: 18, fontWeight: "600" },
  connRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 16 },
  connPulse: { width: 8, height: 8, borderRadius: 4 },
  connText: { color: colors.textSecondary, fontSize: 12, fontWeight: "500" },

  quickRow: { flexDirection: "row", gap: 12, marginTop: spacing.md },
  quick: {
    flex: 1,
    backgroundColor: colors.glassBase,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 14,
    alignItems: "center",
    gap: 8,
  },
  quickIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  quickLabel: { color: colors.textPrimary, fontSize: 13, fontWeight: "600" },

  chipRow: { gap: 8, paddingVertical: 4 },
  chip: {
    backgroundColor: colors.glassBase,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.pill,
  },
  chipActive: { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
  chipText: { color: colors.textSecondary, fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: colors.textInverse },

  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.md, marginBottom: spacing.md },
  sectionTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: "700" },
  sectionCount: { color: colors.textTertiary, fontSize: 14, fontWeight: "600" },

  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 14 },
  loading: { paddingVertical: 60, alignItems: "center" },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: "700" },
  emptySub: { color: colors.textTertiary, fontSize: 14 },
  emptyBtn: { backgroundColor: colors.textPrimary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: radii.pill, marginTop: 8 },
  emptyBtnText: { color: colors.textInverse, fontWeight: "700" },
});
