import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors, radii, spacing, typography } from "../../src/theme";

const DOORBELL_IMG =
  "https://static.prod-images.emergentagent.com/jobs/b297647d-4ed2-4955-a42e-67a2e4b8b9fc/images/8e373aff00ddf1bb45bf2eb234938e0d47b90ea7d42a83deda0b01196244df07.png";

export default function DoorbellScreen() {
  const router = useRouter();
  const [audioOn, setAudioOn] = useState(false);
  const [muted, setMuted] = useState(true);

  // recording dot pulse
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(0.3, { duration: 900, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [pulse]);
  const dotStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <View style={styles.container} testID="doorbell-screen">
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} testID="doorbell-back">
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Smart Doorbell</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.content}>
          {/* Live feed */}
          <View style={styles.feedFrame}>
            <Image source={{ uri: DOORBELL_IMG }} style={styles.feed} />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.7)"]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 0, y: 1 }}
            />
            <View style={styles.recRow}>
              <Animated.View style={[styles.recDot, dotStyle]} />
              <Text style={styles.recText}>LIVE</Text>
              <Text style={styles.timeText}>{new Date().toLocaleTimeString()}</Text>
            </View>
            <View style={styles.alertBadge}>
              <MaterialCommunityIcons name="motion-sensor" size={16} color={colors.security} />
              <Text style={styles.alertText}>Motion detected · 2m ago</Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controlsRow}>
            <ControlBtn
              icon={muted ? "volume-mute" : "volume-high"}
              label={muted ? "Muted" : "Volume"}
              testID="doorbell-mute"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setMuted((m) => !m);
              }}
            />
            <TouchableOpacity
              testID="doorbell-talk"
              activeOpacity={0.85}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setAudioOn((a) => !a);
              }}
              style={[styles.talkBtn, audioOn && { backgroundColor: colors.heat }]}
            >
              <MaterialCommunityIcons
                name={audioOn ? "microphone" : "microphone-outline"}
                size={32}
                color={audioOn ? colors.textPrimary : colors.textInverse}
              />
              <Text style={[styles.talkLabel, audioOn && { color: colors.textPrimary }]}>
                {audioOn ? "Talking…" : "Hold to Talk"}
              </Text>
            </TouchableOpacity>
            <ControlBtn
              icon="camera-flip-outline"
              label="Snapshot"
              testID="doorbell-snapshot"
              onPress={() => Alert.alert("Snapshot", "Saved to your library")}
            />
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>Alerts today</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>1080p</Text>
              <Text style={styles.statLabel}>Stream quality</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: colors.energy }]}>●</Text>
              <Text style={styles.statLabel}>Online</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function ControlBtn({ icon, label, onPress, testID }: { icon: string; label: string; onPress: () => void; testID?: string }) {
  return (
    <TouchableOpacity testID={testID} activeOpacity={0.8} style={styles.cBtn} onPress={onPress}>
      <View style={styles.cIcon}>
        <Ionicons name={icon as any} size={22} color={colors.textPrimary} />
      </View>
      <Text style={styles.cLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: spacing.md },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.glassBase, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
  title: { color: colors.textPrimary, fontSize: 17, fontWeight: "700" },
  content: { flex: 1, padding: spacing.lg, gap: 24 },

  feedFrame: { borderRadius: radii.lg - 8, overflow: "hidden", aspectRatio: 4 / 5, backgroundColor: "#000", borderWidth: 1, borderColor: colors.border },
  feed: { width: "100%", height: "100%" },
  recRow: { position: "absolute", top: 16, left: 16, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.45)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: radii.pill },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.heat },
  recText: { color: colors.textPrimary, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  timeText: { color: colors.textPrimary, fontSize: 11, marginLeft: 8, opacity: 0.8 },
  alertBadge: { position: "absolute", bottom: 16, left: 16, right: 16, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(0,0,0,0.55)", padding: 10, borderRadius: radii.sm },
  alertText: { color: colors.textPrimary, fontSize: 13, fontWeight: "600" },

  controlsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around" },
  cBtn: { alignItems: "center", gap: 8 },
  cIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.glassBase, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  cLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: "600" },

  talkBtn: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.textPrimary, alignItems: "center", justifyContent: "center", gap: 4 },
  talkLabel: { color: colors.textInverse, fontSize: 11, fontWeight: "700" },

  statsRow: { flexDirection: "row", gap: 12 },
  statCard: { flex: 1, backgroundColor: colors.glassBase, borderColor: colors.border, borderWidth: 1, padding: 14, borderRadius: radii.md, alignItems: "center", gap: 4 },
  statValue: { color: colors.textPrimary, fontSize: 22, fontWeight: "800" },
  statLabel: { color: colors.textTertiary, fontSize: 11, fontWeight: "600" },
});
