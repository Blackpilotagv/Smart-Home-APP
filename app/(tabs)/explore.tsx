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

import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import { LinearGradient } from "expo-linear-gradient";

import { useRouter } from "expo-router";

import Animated, {
  FadeInDown,
} from "react-native-reanimated";

import {
  colors,
  radii,
  spacing,
  typography,
} from "../../src/theme";

import { useAuthStore }
from "../../src/store/auth";

import { useDevicesStore }
from "../../src/store/devices";

import { mqttService }
from "../../src/services/mqtt";

// ======================================================
// DASHBOARD
// ======================================================

export default function Dashboard() {

  const router = useRouter();

  const { user } =
    useAuthStore();

  const {
    devices,
    loading,
    fetchDevices,
    bindMqtt,
  } = useDevicesStore();

  const [refreshing,
    setRefreshing] =
    useState(false);

  const [activeRoom,
    setActiveRoom] =
    useState<string>("All");

  const [mqttConnected,
    setMqttConnected] =
    useState(
      mqttService.isConnected()
    );

  // ======================================================
  // EFFECTS
  // ======================================================

  useEffect(() => {

    fetchDevices();

    const unsubStatus =
      bindMqtt();

    const unsubConn =
      mqttService.onConnection(
        setMqttConnected
      );

    return () => {

      unsubStatus();

      unsubConn();
    };

  }, []);

  // ======================================================
  // FILTERS
  // ======================================================

  const rooms = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(
          devices.map(
            (d) => d.room
          )
        )
      ),
    ],
    [devices]
  );

  const filtered =
    activeRoom === "All"
      ? devices
      : devices.filter(
          (d) =>
            d.room ===
            activeRoom
        );

  const onCount =
    devices.filter(
      (d) => d.status
    ).length;

  const totalEnergy =
    devices.reduce(
      (acc, d) =>
        acc +
        (
          d.status
            ? d.energy_watts || 0
            : 0
        ),
      0
    );

  // ======================================================
  // REFRESH
  // ======================================================

  const onRefresh =
    async () => {

      setRefreshing(true);

      await fetchDevices();

      setRefreshing(false);
    };

  // ======================================================
  // GREETING
  // ======================================================

  const greeting = (() => {

    const h =
      new Date().getHours();

    if (h < 12)
      return "Good morning";

    if (h < 18)
      return "Good afternoon";

    return "Good evening";

  })();

  // ======================================================
  // UI
  // ======================================================

  return (

    <View
      style={styles.container}
    >

      <LinearGradient
        colors={[
          "#0d0d10",
          colors.bg,
        ]}
        style={
          styles.headerGradient
        }
      />

      <SafeAreaView
        edges={["top"]}
        style={{ flex: 1 }}
      >

        <ScrollView

          contentContainerStyle={
            styles.scroll
          }

          refreshControl={
            <RefreshControl
              refreshing={
                refreshing
              }
              onRefresh={
                onRefresh
              }
              tintColor={
                colors.lighting
              }
            />
          }

          showsVerticalScrollIndicator={
            false
          }
        >

          {/* TOP BAR */}

          <Animated.View

            entering={
              FadeInDown
                .delay(100)
                .springify()
            }

            style={styles.topRow}
          >

            <View>

              <Text
                style={
                  styles.greeting
                }
              >
                {greeting}
              </Text>

              <Text
                style={
                  styles.userName
                }
              >
                {
                  user?.name?.split(
                    " "
                  )[0] || "Welcome"
                }
              </Text>

            </View>

            <TouchableOpacity

              style={
                styles.iconBtn
              }

              onPress={() =>
                router.push(
                  "/device/notifications"
                )
              }
            >

              <Ionicons
                name="notifications-outline"
                size={22}
                color={
                  colors.textPrimary
                }
              />

              <View
                style={
                  styles.dot
                }
              />

            </TouchableOpacity>

          </Animated.View>

          {/* HERO */}

          <Animated.View

            entering={
              FadeInDown
                .delay(150)
                .springify()
            }

            style={
              styles.heroCard
            }
          >

            <LinearGradient

              colors={[
                "rgba(255,214,10,0.16)",
                "rgba(10,132,255,0.08)",
              ]}

              style={
                StyleSheet.absoluteFill
              }

              start={{
                x: 0,
                y: 0,
              }}

              end={{
                x: 1,
                y: 1,
              }}
            />

            <View
              style={
                styles.heroRow
              }
            >

              <View
                style={
                  styles.heroBlock
                }
              >

                <Text
                  style={
                    styles.heroLabel
                  }
                >
                  Active devices
                </Text>

                <Text
                  style={
                    styles.heroValue
                  }
                >

                  {onCount}

                  <Text
                    style={
                      styles.heroValueSmall
                    }
                  >
                    /{devices.length}
                  </Text>

                </Text>

              </View>

              <View
                style={
                  styles.heroDivider
                }
              />

              <View
                style={
                  styles.heroBlock
                }
              >

                <Text
                  style={
                    styles.heroLabel
                  }
                >
                  Live consumption
                </Text>

                <Text
                  style={
                    styles.heroValue
                  }
                >

                  {(
                    totalEnergy / 1000
                  ).toFixed(2)}

                  <Text
                    style={
                      styles.heroValueSmall
                    }
                  >
                    {" "}kW
                  </Text>

                </Text>

              </View>

            </View>

            <View
              style={
                styles.connRow
              }
            >

              <View
                style={[
                  styles.connPulse,
                  {
                    backgroundColor:
                      mqttConnected
                        ? colors.energy
                        : colors.security,
                  },
                ]}
              />

              <Text
                style={
                  styles.connText
                }
              >
                MQTT{" "}
                {
                  mqttConnected
                    ? "connected"
                    : "connecting..."
                }
              </Text>

            </View>

          </Animated.View>

          {/* QUICK ACTIONS */}

          <Animated.View

            entering={
              FadeInDown
                .delay(200)
                .springify()
            }

            style={
              styles.quickRow
            }
          >

            <QuickAction
              icon="lock"
              label="Smart Lock"
              color={
                colors.security
              }
              onPress={() =>
                router.push(
                  "/device/lock"
                )
              }
            />

            <QuickAction
              icon="doorbell-video"
              label="Doorbell"
              color={
                colors.security
              }
              onPress={() =>
                router.push(
                  "/device/doorbell"
                )
              }
            />

            <QuickAction
              icon="plus"
              label="Add"
              color={
                colors.energy
              }
              onPress={() =>
                router.push(
                  "/device/add-device"
                )
              }
            />

          </Animated.View>

          {/* ROOM FILTER */}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.chipRow
            }
          >

            {rooms.map((r) => (

              <TouchableOpacity

                key={r}

                onPress={() =>
                  setActiveRoom(r)
                }

                style={[
                  styles.chip,

                  activeRoom === r &&
                    styles.chipActive,
                ]}
              >

                <Text
                  style={[
                    styles.chipText,

                    activeRoom === r &&
                      styles.chipTextActive,
                  ]}
                >
                  {r}
                </Text>

              </TouchableOpacity>
            ))}

          </ScrollView>

          {/* SECTION */}

          <View
            style={
              styles.sectionRow
            }
          >

            <Text
              style={
                styles.sectionTitle
              }
            >
              Your devices
            </Text>

            <Text
              style={
                styles.sectionCount
              }
            >
              {filtered.length}
            </Text>

          </View>

          {/* DEVICE LIST */}

          {loading &&
          devices.length === 0 ? (

            <View
              style={
                styles.loading
              }
            >

              <ActivityIndicator
                color={
                  colors.lighting
                }
              />

            </View>

          ) : filtered.length === 0 ? (

            <View
              style={
                styles.empty
              }
            >

              <MaterialCommunityIcons
                name="home-search-outline"
                size={42}
                color={
                  colors.textTertiary
                }
              />

              <Text
                style={
                  styles.emptyTitle
                }
              >
                No devices yet
              </Text>

            </View>

          ) : (

            <View
              style={
                styles.grid
              }
            >

              {filtered.map((d) => (

                <TouchableOpacity

                  key={d.device_id}

                  activeOpacity={
                    0.85
                  }

                  onPress={() =>
                    router.push({
                      pathname:
                        "/device/[id]",

                      params: {
                        id:
                          d.device_id,
                      },
                    })
                  }

                  style={
                    styles.deviceCard
                  }
                >

                  <View
                    style={
                      styles.deviceTop
                    }
                  >

                    <MaterialCommunityIcons
                      name={
                        d.status
                          ? "lightbulb-on"
                          : "lightbulb-outline"
                      }
                      size={30}
                      color={
                        d.status
                          ? colors.lighting
                          : colors.textSecondary
                      }
                    />

                    <View
                      style={[
                        styles.onlineDot,
                        {
                          backgroundColor:
                            d.online
                              ? "#00ff99"
                              : "#666",
                        },
                      ]}
                    />

                  </View>

                  <Text
                    style={
                      styles.deviceName
                    }
                    numberOfLines={1}
                  >
                    {d.name}
                  </Text>

                  <Text
                    style={
                      styles.deviceRoom
                    }
                  >
                    {d.room}
                  </Text>

                </TouchableOpacity>
              ))}

            </View>
          )}

        </ScrollView>

      </SafeAreaView>

    </View>
  );
}

// ======================================================
// QUICK ACTION
// ======================================================

function QuickAction({
  icon,
  label,
  color,
  onPress,
}: any) {

  return (

    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.quick}
      onPress={onPress}
    >

      <View
        style={[
          styles.quickIcon,
          {
            backgroundColor:
              `${color}26`,
          },
        ]}
      >

        <MaterialCommunityIcons
          name={icon}
          size={22}
          color={color}
        />

      </View>

      <Text
        style={
          styles.quickLabel
        }
      >
        {label}
      </Text>

    </TouchableOpacity>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor:
      colors.bg,
  },

  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 280,
  },

  scroll: {
    paddingHorizontal:
      spacing.lg,
    paddingBottom: 120,
  },

  topRow: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginTop: 4,
  },

  greeting: {
    color:
      colors.textTertiary,
    fontSize: 14,
  },

  userName: {
    color:
      colors.textPrimary,
    ...typography.h2,
  },

  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor:
      colors.glassBase,
    alignItems: "center",
    justifyContent: "center",
  },

  dot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor:
      colors.heat,
  },

  heroCard: {
    marginTop: spacing.lg,
    borderRadius:
      radii.md,
    padding: 20,
    overflow: "hidden",
    backgroundColor:
      colors.glassBase,
  },

  heroRow: {
    flexDirection: "row",
  },

  heroBlock: {
    flex: 1,
  },

  heroDivider: {
    width: 1,
    backgroundColor:
      colors.border,
    marginHorizontal: 16,
  },

  heroLabel: {
    color:
      colors.textTertiary,
    fontSize: 12,
  },

  heroValue: {
    color:
      colors.textPrimary,
    fontSize: 32,
    fontWeight: "800",
  },

  heroValueSmall: {
    color:
      colors.textTertiary,
    fontSize: 18,
  },

  connRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },

  connPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  connText: {
    color:
      colors.textSecondary,
  },

  quickRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: spacing.md,
  },

  quick: {
    flex: 1,
    backgroundColor:
      colors.glassBase,
    borderRadius:
      radii.md,
    padding: 14,
    alignItems: "center",
    gap: 8,
  },

  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  quickLabel: {
    color:
      colors.textPrimary,
    fontSize: 13,
  },

  chipRow: {
    gap: 8,
    paddingVertical: 14,
  },

  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius:
      radii.pill,
    backgroundColor:
      colors.glassBase,
  },

  chipActive: {
    backgroundColor:
      colors.textPrimary,
  },

  chipText: {
    color:
      colors.textSecondary,
  },

  chipTextActive: {
    color:
      colors.textInverse,
  },

  sectionRow: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  sectionTitle: {
    color:
      colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },

  sectionCount: {
    color:
      colors.textTertiary,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent:
      "space-between",
    gap: 14,
  },

  loading: {
    paddingVertical: 60,
    alignItems: "center",
  },

  empty: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },

  emptyTitle: {
    color:
      colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },

  deviceCard: {
    width: "47%",

    backgroundColor:
      colors.glassBase,

    borderRadius:
      radii.lg,

    padding: 16,

    borderWidth: 1,

    borderColor:
      colors.border,
  },

  deviceTop: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  deviceName: {
    color:
      colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 16,
  },

  deviceRoom: {
    color:
      colors.textSecondary,
    marginTop: 4,
  },
});