import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";
import Animated, { FadeIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors, colorForType, iconForType, radii, spacing, typography } from "../../src/theme";
import { useDevicesStore, Device } from "../../src/store/devices";

export default function DeviceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { devices, toggleDevice, patchDevice, deleteDevice } = useDevicesStore();
  const device = devices.find((d) => d.device_id === id);

  if (!device) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={colors.lighting} />
      </View>
    );
  }
  const accent = device.color || colorForType(device.type);
  const icon = device.icon || iconForType(device.type);

  return (
    <View style={styles.container} testID={`device-detail-${device.device_id}`}>
      <LinearGradient colors={[`${accent}26`, colors.bg]} style={styles.headerGrad} />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} testID="device-back">
            <Ionicons name="chevron-down" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            testID="device-delete"
            onPress={() => {
              deleteDevice(device.device_id);
              router.back();
            }}
            style={styles.iconBtn}
          >
            <Ionicons name="trash-outline" size={20} color={colors.heat} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeIn} style={styles.heroRow}>
            <View style={[styles.heroIcon, { backgroundColor: `${accent}33` }]}>
              <MaterialCommunityIcons name={icon as any} size={48} color={accent} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.deviceName}>{device.name}</Text>
              <Text style={styles.deviceMeta}>{device.room} · {device.type.toUpperCase()}</Text>
              <View style={styles.statusBadgeRow}>
                <View style={[styles.statusDot, { backgroundColor: device.status ? colors.energy : colors.textTertiary }]} />
                <Text style={[styles.statusText, { color: device.status ? colors.energy : colors.textTertiary }]}>
                  {device.status ? "Active" : "Off"}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Power toggle */}
          <View style={styles.controlCard}>
            <Text style={styles.controlLabel}>Power</Text>
            <Switch
              testID="device-detail-toggle"
              value={device.status}
              onValueChange={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                toggleDevice(device.device_id);
              }}
              trackColor={{ true: accent, false: colors.glassActive }}
              thumbColor="#fff"
              style={{ transform: [{ scale: 1.2 }] }}
            />
          </View>

          {/* Brightness for lights */}
          {device.type === "light" && (
            <View style={styles.controlCard}>
              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>Brightness</Text>
                <Text style={[styles.controlValue, { color: accent }]}>{device.brightness ?? 0}%</Text>
              </View>
              <Slider
                testID="brightness-slider"
                value={device.brightness ?? 0}
                minimumValue={0}
                maximumValue={100}
                step={5}
                minimumTrackTintColor={accent}
                maximumTrackTintColor={colors.glassActive}
                thumbTintColor={accent}
                onSlidingComplete={(v) => patchDevice(device.device_id, { brightness: Math.round(v) })}
              />
            </View>
          )}

          {/* Fan speed */}
          {device.type === "fan" && (
            <View style={styles.controlCard}>
              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>Speed</Text>
                <Text style={[styles.controlValue, { color: accent }]}>{device.fan_speed ?? 0}/5</Text>
              </View>
              <View style={styles.speedRow}>
                {[0, 1, 2, 3, 4, 5].map((s) => (
                  <TouchableOpacity
                    key={s}
                    testID={`fan-speed-${s}`}
                    style={[styles.speedBtn, device.fan_speed === s && { backgroundColor: accent }]}
                    onPress={() => patchDevice(device.device_id, { fan_speed: s, status: s > 0 })}
                  >
                    <Text style={[styles.speedText, device.fan_speed === s && { color: colors.textInverse }]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Thermostat / AC temp */}
          {(device.type === "ac" || device.type === "thermostat") && (
            <View style={styles.controlCard}>
              <Text style={styles.controlLabel}>Target temperature</Text>
              <View style={styles.tempRow}>
                <TouchableOpacity
                  testID="temp-down"
                  style={styles.tempBtn}
                  onPress={() =>
                    patchDevice(device.device_id, { target_temperature: Math.max(16, (device.target_temperature || 22) - 1) })
                  }
                >
                  <Ionicons name="remove" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.tempValue, { color: accent }]}>{device.target_temperature?.toFixed(0)}°</Text>
                <TouchableOpacity
                  testID="temp-up"
                  style={styles.tempBtn}
                  onPress={() =>
                    patchDevice(device.device_id, { target_temperature: Math.min(30, (device.target_temperature || 22) + 1) })
                  }
                >
                  <Ionicons name="add" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.tempCurrent}>Current: {device.temperature?.toFixed(1)}°</Text>
            </View>
          )}

          {/* Energy */}
          {(device.energy_watts ?? 0) > 0 && (
            <View style={styles.controlCard}>
              <Text style={styles.controlLabel}>Live consumption</Text>
              <View style={styles.energyRow}>
                <Text style={styles.energyValue}>
                  {device.energy_watts?.toFixed(1)} <Text style={styles.energyUnit}>W</Text>
                </Text>
                <View style={styles.energyBadge}>
                  <MaterialCommunityIcons name="flash" size={14} color={colors.energy} />
                  <Text style={styles.energyBadgeText}>Live</Text>
                </View>
              </View>
            </View>
          )}

          {/* MQTT info */}
          <View style={styles.controlCard}>
            <Text style={styles.controlLabel}>MQTT topics</Text>
            <View style={styles.topic}>
              <Text style={styles.topicKey}>Subscribe</Text>
              <Text style={styles.topicVal}>{device.mqtt_topic_prefix}/status</Text>
            </View>
            <View style={styles.topic}>
              <Text style={styles.topicKey}>Publish</Text>
              <Text style={styles.topicVal}>{device.mqtt_topic_prefix}/control</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerGrad: { position: "absolute", top: 0, left: 0, right: 0, height: 320 },
  topBar: { flexDirection: "row", justifyContent: "space-between", padding: spacing.md },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.glassBase, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
  scroll: { padding: spacing.lg, paddingBottom: 60, gap: 14 },
  heroRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  heroIcon: { width: 96, height: 96, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  deviceName: { color: colors.textPrimary, fontSize: 24, fontWeight: "800", letterSpacing: -0.3 },
  deviceMeta: { color: colors.textSecondary, fontSize: 13, fontWeight: "500", marginTop: 4 },
  statusBadgeRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: "700" },

  controlCard: { backgroundColor: colors.glassBase, borderColor: colors.border, borderWidth: 1, borderRadius: radii.md, padding: 18 },
  controlRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  controlLabel: { color: colors.textSecondary, fontSize: 14, fontWeight: "600" },
  controlValue: { fontSize: 18, fontWeight: "800" },

  speedRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  speedBtn: { flex: 1, height: 44, borderRadius: 22, backgroundColor: colors.glassActive, alignItems: "center", justifyContent: "center" },
  speedText: { color: colors.textPrimary, fontSize: 15, fontWeight: "700" },

  tempRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", marginVertical: 16 },
  tempBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.glassActive, alignItems: "center", justifyContent: "center" },
  tempValue: { fontSize: 56, fontWeight: "800" },
  tempCurrent: { color: colors.textTertiary, textAlign: "center", fontSize: 13 },

  energyRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  energyValue: { color: colors.energy, fontSize: 32, fontWeight: "800" },
  energyUnit: { color: colors.textTertiary, fontSize: 16 },
  energyBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: `${colors.energy}26`, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radii.pill },
  energyBadgeText: { color: colors.energy, fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },

  topic: { marginTop: 8 },
  topicKey: { color: colors.textTertiary, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },
  topicVal: { color: colors.textPrimary, fontSize: 13, fontFamily: "Courier", marginTop: 2 },
});
