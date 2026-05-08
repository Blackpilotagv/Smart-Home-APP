import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDevicesStore } from "../../src/store/devices";
import { colors, radii, spacing } from "../../src/theme";

// ======================================================
// DEVICE REGISTRY
// ======================================================

const DEVICE_TYPES: any = {
  SMHC: {
    name: "Smart Home Controller",
    icon: "home-automation",
    color: "#FFD54F",
    relayCount: 10,
  },

  SMDL: {
    name: "Smart Door Lock",
    icon: "lock-smart",
    color: "#64B5F6",
    relayCount: 0,
  },

  SMDB: {
    name: "Smart Door Bell",
    icon: "bell-ring",
    color: "#81C784",
    relayCount: 0,
  },
};

export default function AddDeviceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const createDevice = useDevicesStore(
    (s) => s.createDevice
  );

  const [serialNumber, setSerialNumber] =
    useState(
      (params.serial as string) || ""
    );

  const [deviceName, setDeviceName] =
    useState("");

  const [room, setRoom] =
    useState("");

  const [busy, setBusy] =
    useState(false);

  // ======================================================
  // DEVICE DETECTION
  // ======================================================

  const prefix =
    serialNumber.trim().slice(0, 4).toUpperCase();

  const deviceInfo = DEVICE_TYPES[prefix];

  // ======================================================
  // VALIDATE SERIAL NUMBER
  // ======================================================

  const validateSerialNumber = (sn: string) => {
    if (sn.length < 10) return false;

    const typeCode =
      sn.slice(0, 4).toUpperCase();

    return DEVICE_TYPES[typeCode];
  };

  // ======================================================
  // MQTT TOPIC GENERATOR
  // ======================================================

  const generateMqttTopics = (
    deviceId: string,
    relayCount: number
  ) => {
    const topics: any = {
      status: `home/${deviceId}/status`,
      relays: [],
    };

    for (let i = 1; i <= relayCount; i++) {
      topics.relays.push({
        relay: i,

        set: `home/${deviceId}/relay/${i}/set`,

        state: `home/${deviceId}/relay/${i}/state`,
      });
    }

    return topics;
  };

  // ======================================================
  // ADD DEVICE
  // ======================================================

  const handleAddDevice = async () => {
    if (busy) return;

    const sn =
      serialNumber.trim().toUpperCase();

    if (!validateSerialNumber(sn)) {
      return Alert.alert(
        "Invalid Serial Number",
        "Please enter a valid device serial number."
      );
    }

    if (!deviceName.trim()) {
      return Alert.alert(
        "Device Name Required",
        "Please enter a device name."
      );
    }

    setBusy(true);

    try {
      const mqttTopics =
        generateMqttTopics(
          sn,
          deviceInfo.relayCount
        );

      await createDevice({
        device_id: sn,

        serialNumber: sn,

        name: deviceName.trim(),

        room: room.trim() || "Home",

        type: prefix,

        deviceType: deviceInfo.name,

        icon: deviceInfo.icon,

        color: deviceInfo.color,

        mqtt: mqttTopics,

        online: false,

        created_at: new Date().toISOString(),
      });

      Alert.alert(
        "Success",
        "Device added successfully."
      );

      router.replace("/explore");

    } catch (e: any) {

      Alert.alert(
        "Error",
        e?.message || "Failed to add device."
      );

    } finally {

      setBusy(false);
    }
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >

          {/* HEADER */}

          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => router.back()}
            >
              <Ionicons
                name="close"
                size={24}
                color={colors.textPrimary}
              />
            </TouchableOpacity>

            <Text style={styles.title}>
              Add Device
            </Text>

            <View style={{ width: 40 }} />
          </View>

          {/* QR BUTTON */}

          <TouchableOpacity
            style={styles.qrButton}
            activeOpacity={0.85}
           onPress={() => {
  router.push("/device/qr-scanner");
}}
          >
            <MaterialCommunityIcons
              name="qrcode-scan"
              size={26}
              color={colors.bg}
            />

            <Text style={styles.qrButtonText}>
              Scan QR Code
            </Text>
          </TouchableOpacity>

          <Text style={styles.orText}>
            OR ENTER SERIAL NUMBER
          </Text>

          {/* SERIAL NUMBER */}

          <Text style={styles.label}>
            Serial Number
          </Text>

          <TextInput
            value={serialNumber}
            onChangeText={setSerialNumber}
            placeholder="e.g. SMHC2508B00192"
            placeholderTextColor={
              colors.textTertiary
            }
            autoCapitalize="characters"
            style={styles.input}
          />

          {/* DEVICE PREVIEW */}

          {deviceInfo && (
            <View
              style={[
                styles.previewCard,
                {
                  borderColor:
                    deviceInfo.color,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={deviceInfo.icon}
                size={34}
                color={deviceInfo.color}
              />

              <View style={{ flex: 1 }}>
                <Text style={styles.previewTitle}>
                  {deviceInfo.name}
                </Text>

                <Text style={styles.previewSub}>
                  Device detected automatically
                </Text>
              </View>
            </View>
          )}

          {/* DEVICE NAME */}

          <Text style={styles.label}>
            Device Name
          </Text>

          <TextInput
            value={deviceName}
            onChangeText={setDeviceName}
            placeholder="e.g. Living Room Controller"
            placeholderTextColor={
              colors.textTertiary
            }
            style={styles.input}
          />

          {/* ROOM */}

          <Text style={styles.label}>
            Room
          </Text>

          <TextInput
            value={room}
            onChangeText={setRoom}
            placeholder="e.g. Living Room"
            placeholderTextColor={
              colors.textTertiary
            }
            style={styles.input}
          />

          {/* ADD BUTTON */}

          <TouchableOpacity
            style={styles.addBtn}
            onPress={handleAddDevice}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator
                color={colors.textInverse}
              />
            ) : (
              <>
                <Ionicons
                  name="add-circle-outline"
                  size={22}
                  color={colors.textInverse}
                />

                <Text style={styles.addBtnText}>
                  Add Device
                </Text>
              </>
            )}
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  content: {
    padding: spacing.lg,
    paddingBottom: 60,
    gap: 18,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glassBase,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },

  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },

  qrButton: {
    height: 58,
    borderRadius: 30,
    backgroundColor: colors.lighting,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
  },

  qrButtonText: {
    color: colors.bg,
    fontSize: 16,
    fontWeight: "700",
  },

  orText: {
    color: colors.textTertiary,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },

  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },

  input: {
    height: 54,
    borderRadius: radii.md,
    backgroundColor: colors.glassBase,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    color: colors.textPrimary,
    fontSize: 15,
  },

  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: radii.lg,
    backgroundColor: colors.glassBase,
    borderWidth: 1,
  },

  previewTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },

  previewSub: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },

  addBtn: {
    marginTop: 20,
    height: 58,
    borderRadius: 30,
    backgroundColor: colors.textPrimary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  addBtnText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: "700",
  },
});