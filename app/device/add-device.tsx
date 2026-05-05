import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, radii, spacing, typography, colorForType, iconForType } from "../../src/theme";
import { useDevicesStore } from "../../src/store/devices";

const TYPES = [
  { key: "light", label: "Light" },
  { key: "fan", label: "Fan" },
  { key: "ac", label: "AC" },
  { key: "thermostat", label: "Thermostat" },
  { key: "lock", label: "Lock" },
  { key: "doorbell", label: "Doorbell" },
  { key: "outlet", label: "Outlet" },
  { key: "sensor", label: "Sensor" },
];

export default function AddDevice() {
  const router = useRouter();
  const createDevice = useDevicesStore((s) => s.createDevice);
  const [name, setName] = useState("");
  const [room, setRoom] = useState("Living Room");
  const [type, setType] = useState("light");
  const [busy, setBusy] = useState(false);

  const onSave = async () => {
    if (!name.trim()) return Alert.alert("Name required", "Please enter a device name");
    setBusy(true);
    try {
      await createDevice({
        name: name.trim(),
        room: room.trim() || "Home",
        type,
        icon: iconForType(type),
        color: colorForType(type),
      });
      router.back();
    } catch (e: any) {
      Alert.alert("Failed", e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.container} testID="add-device-screen">
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>Add Device</Text>
            <View style={{ width: 44 }} />
          </View>

          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Device name</Text>
            <TextInput
              testID="input-name"
              placeholder="e.g. Bedroom Lamp"
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            <Text style={styles.label}>Room</Text>
            <TextInput
              testID="input-room"
              placeholder="e.g. Living Room"
              placeholderTextColor={colors.textTertiary}
              value={room}
              onChangeText={setRoom}
              style={styles.input}
            />

            <Text style={styles.label}>Type</Text>
            <View style={styles.typeGrid}>
              {TYPES.map((t) => {
                const active = t.key === type;
                const accent = colorForType(t.key);
                return (
                  <TouchableOpacity
                    key={t.key}
                    testID={`type-${t.key}`}
                    style={[styles.typeBtn, active && { borderColor: accent, backgroundColor: `${accent}1a` }]}
                    onPress={() => setType(t.key)}
                  >
                    <MaterialCommunityIcons
                      name={iconForType(t.key) as any}
                      size={22}
                      color={active ? accent : colors.textSecondary}
                    />
                    <Text style={[styles.typeLabel, active && { color: accent }]}>{t.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity testID="save-device-btn" style={styles.saveBtn} onPress={onSave} disabled={busy}>
              <Text style={styles.saveText}>{busy ? "Adding…" : "Add Device"}</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: spacing.md },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.glassBase, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
  title: { color: colors.textPrimary, fontSize: 17, fontWeight: "700" },
  scroll: { padding: spacing.lg, paddingBottom: 60 },
  label: { color: colors.textTertiary, fontSize: 12, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginTop: 16, marginBottom: 8 },
  input: { backgroundColor: colors.glassBase, borderColor: colors.border, borderWidth: 1, color: colors.textPrimary, paddingHorizontal: 16, height: 52, borderRadius: radii.sm, fontSize: 15 },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  typeBtn: { width: "31%", padding: 14, borderRadius: radii.sm, alignItems: "center", gap: 6, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glassBase },
  typeLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: "600" },
  saveBtn: { backgroundColor: colors.textPrimary, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", marginTop: 32 },
  saveText: { color: colors.textInverse, fontSize: 16, fontWeight: "700" },
});
