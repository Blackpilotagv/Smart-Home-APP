import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, radii, spacing, typography } from "../../src/theme";
import { api } from "../../src/services/api";

type Notif = {
  notif_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
};

const TYPE_ICON: Record<string, { name: string; color: string }> = {
  motion: { name: "motion-sensor", color: "#FF9F0A" },
  doorbell: { name: "doorbell-video", color: "#FF9F0A" },
  offline: { name: "wifi-off", color: "#FF453A" },
  security: { name: "shield-alert-outline", color: "#FF453A" },
  info: { name: "information-outline", color: "#0A84FF" },
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await api.listNotifications();
        setItems(list);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const markRead = async (n: Notif) => {
    if (n.read) return;
    setItems((it) => it.map((x) => (x.notif_id === n.notif_id ? { ...x, read: true } : x)));
    try {
      await api.markNotificationRead(n.notif_id);
    } catch {}
  };

  return (
    <View style={styles.container} testID="notifications-screen">
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} testID="notif-back">
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator color={colors.lighting} style={{ marginTop: 60 }} />
          ) : items.length === 0 ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="bell-off-outline" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>All caught up</Text>
              <Text style={styles.emptySub}>No new alerts</Text>
            </View>
          ) : (
            items.map((n) => {
              const meta = TYPE_ICON[n.type] || TYPE_ICON.info;
              return (
                <TouchableOpacity
                  key={n.notif_id}
                  onPress={() => markRead(n)}
                  style={[styles.row, !n.read && styles.rowUnread]}
                  testID={`notif-${n.notif_id}`}
                >
                  <View style={[styles.icon, { backgroundColor: `${meta.color}26` }]}>
                    <MaterialCommunityIcons name={meta.name as any} size={22} color={meta.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{n.title}</Text>
                    <Text style={styles.rowMsg}>{n.message}</Text>
                    <Text style={styles.rowTime}>{relTime(n.timestamp)}</Text>
                  </View>
                  {!n.read && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function relTime(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: spacing.md },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.glassBase, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
  title: { color: colors.textPrimary, fontSize: 17, fontWeight: "700" },
  scroll: { padding: spacing.lg, paddingBottom: 60, gap: 10 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14, borderRadius: radii.md, backgroundColor: colors.glassBase, borderColor: colors.border, borderWidth: 1 },
  rowUnread: { borderColor: colors.borderActive },
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  rowTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: "700" },
  rowMsg: { color: colors.textSecondary, fontSize: 13, marginTop: 2, lineHeight: 18 },
  rowTime: { color: colors.textTertiary, fontSize: 11, marginTop: 6 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.lighting, marginTop: 6 },
  empty: { alignItems: "center", paddingVertical: 80, gap: 8 },
  emptyTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: "700" },
  emptySub: { color: colors.textTertiary, fontSize: 14 },
});
