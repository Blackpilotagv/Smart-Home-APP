import { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { colors, colorForType, iconForType, radii } from "../theme";
import { Device, useDevicesStore } from "../store/devices";

type Props = { device: Device; size?: "full" | "half" };

export default function DeviceCard({ device, size = "half" }: Props) {
  const router = useRouter();
  const toggleDevice = useDevicesStore((s) => s.toggleDevice);
  const accent = device.color || colorForType(device.type);
  const iconName = device.icon || iconForType(device.type);
  const isActive = device.status;

  const pulse = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      pulse.value = withRepeat(withTiming(0.55, { duration: 1300, easing: Easing.inOut(Easing.ease) }), -1, true);
    } else {
      pulse.value = withTiming(1);
    }
  }, [isActive, pulse]);

  const haloStyle = useAnimatedStyle(() => ({ opacity: pulse.value * (isActive ? 0.55 : 0) }));
  const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const onToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
    setTimeout(() => (scale.value = withSpring(1)), 80);
    if (device.type === "lock") router.push("/device/lock");
    else if (device.type === "doorbell") router.push("/device/doorbell");
    else toggleDevice(device.device_id);
  };

  const onLong = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/device/${device.device_id}`);
  };

  const subtitle =
    device.type === "ac" || device.type === "thermostat"
      ? `${device.temperature?.toFixed(1) || "--"}° → ${device.target_temperature?.toFixed(0) || "--"}°`
      : device.type === "light" && isActive
      ? `${device.brightness || 100}% brightness`
      : device.type === "fan" && isActive
      ? `Speed ${device.fan_speed || 0}/5`
      : isActive
      ? "On"
      : "Off";

  return (
    <Animated.View
      style={[styles.wrap, size === "full" && { width: "100%" }, cardStyle]}
      testID={`device-card-${device.device_id}`}
    >
      <TouchableOpacity activeOpacity={0.92} onPress={onToggle} onLongPress={onLong} delayLongPress={250}>
        <View style={[styles.card, isActive && { borderColor: colors.borderActive }]}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          {isActive && (
            <LinearGradient
              colors={[`${accent}33`, "transparent"]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          )}

          <View style={styles.headerRow}>
            <View style={[styles.iconCircle, { backgroundColor: isActive ? `${accent}26` : colors.glassBase }]}>
              <Animated.View style={[StyleSheet.absoluteFill, styles.iconCircle, haloStyle, { backgroundColor: accent }]} />
              <MaterialCommunityIcons
                name={iconName as any}
                size={22}
                color={isActive ? accent : colors.textSecondary}
              />
            </View>
            <View
              testID={`device-toggle-${device.device_id}`}
              style={[styles.statusDot, { backgroundColor: isActive ? colors.energy : colors.textTertiary }]}
            />
          </View>

          <Text style={styles.name} numberOfLines={1}>{device.name}</Text>
          <Text style={styles.room} numberOfLines={1}>{device.room}</Text>
          <Text
            style={[styles.subtitle, isActive && { color: accent }]}
            numberOfLines={1}
            testID={`device-status-${device.device_id}`}
          >
            {subtitle}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "48%" },
  card: {
    borderRadius: radii.lg - 8,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    backgroundColor: colors.glassBase,
    minHeight: 156,
    justifyContent: "space-between",
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  name: { color: colors.textPrimary, fontSize: 16, fontWeight: "700", marginTop: 16 },
  room: { color: colors.textTertiary, fontSize: 12, fontWeight: "500", marginTop: 2 },
  subtitle: { color: colors.textSecondary, fontSize: 13, fontWeight: "600", marginTop: 8 },
});
