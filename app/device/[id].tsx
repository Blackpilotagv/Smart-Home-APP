import { useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  FlatList,
  TextInput,
} from "react-native";

import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import {
  colors,
  spacing,
  radii,
} from "../../src/theme";

import { useDevicesStore } from "../../src/store/devices";

// ======================================================
// SWITCH TYPE
// ======================================================

type RelayType = {
  id: number;
  name: string;
  state: boolean;
};

// ======================================================
// SCREEN
// ======================================================

export default function DeviceControlScreen() {

  const router = useRouter();

  const { id } =
    useLocalSearchParams();

  const devices =
    useDevicesStore(
      (s) => s.devices
    );

  const device =
    devices.find(
      (d) => d.device_id === id
    );

  // ======================================================
  // DEFAULT 10 SWITCHES
  // ======================================================

  const [relays, setRelays] =
    useState<RelayType[]>(

      Array.from(
        { length: 10 },
        (_, i) => ({
          id: i + 1,
          name: `Switch ${i + 1}`,
          state: false,
        })
      )
    );

  // ======================================================
  // TOGGLE
  // ======================================================

  const toggleRelay = (
    relayId: number
  ) => {

    setRelays((prev) =>
      prev.map((r) =>
        r.id === relayId
          ? {
              ...r,
              state: !r.state,
            }
          : r
      )
    );

    // MQTT publish later
    console.log(
      "MQTT:",
      `relay/${relayId}/set`
    );
  };

  // ======================================================
  // RENAME
  // ======================================================

  const renameRelay = (
    relayId: number,
    value: string
  ) => {

    setRelays((prev) =>
      prev.map((r) =>
        r.id === relayId
          ? {
              ...r,
              name: value,
            }
          : r
      )
    );
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <View style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() =>
            router.back()
          }
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={
              colors.textPrimary
            }
          />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>

          <Text style={styles.title}>
            {device?.name ||
              "Device"}
          </Text>

          <Text style={styles.subtitle}>
            {
              device?.serialNumber
            }
          </Text>

        </View>

      </View>

      {/* RELAY LIST */}

      <FlatList
        data={relays}

        keyExtractor={(item) =>
          item.id.toString()
        }

        contentContainerStyle={{
          paddingBottom: 40,
        }}

        renderItem={({ item }) => (

          <View
            style={styles.switchCard}
          >

            {/* ICON */}

            <View
              style={styles.iconBox}
            >

              <MaterialCommunityIcons
                name={
                  item.state
                    ? "lightbulb-on"
                    : "lightbulb-outline"
                }
                size={26}
                color={
                  item.state
                    ? colors.lighting
                    : colors.textSecondary
                }
              />

            </View>

            {/* NAME */}

            <View
              style={{
                flex: 1,
              }}
            >

              <TextInput
                value={item.name}

                onChangeText={(
                  text
                ) =>
                  renameRelay(
                    item.id,
                    text
                  )
                }

                style={
                  styles.switchInput
                }

                placeholder={`Switch ${item.id}`}

                placeholderTextColor={
                  colors.textTertiary
                }
              />

              <Text
                style={
                  styles.switchSub
                }
              >
                Relay {item.id}
              </Text>

            </View>

            {/* TOGGLE */}

            <Switch
              value={item.state}

              onValueChange={() =>
                toggleRelay(
                  item.id
                )
              }

              trackColor={{
                false:
                  "#444",
                true:
                  colors.lighting,
              }}
            />

          </View>
        )}
      />

      {/* GROUP BUTTON */}

      <TouchableOpacity
        style={styles.groupBtn}
      >

        <Ionicons
          name="layers-outline"
          size={22}
          color="black"
        />

        <Text
          style={
            styles.groupBtnText
          }
        >
          Create Group
        </Text>

      </TouchableOpacity>

    </View>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        colors.bg,
      padding:
        spacing.lg,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
      gap: 14,
    },

    backBtn: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor:
        colors.glassBase,
      alignItems: "center",
      justifyContent: "center",
    },

    title: {
      color:
        colors.textPrimary,
      fontSize: 24,
      fontWeight: "800",
    },

    subtitle: {
      color:
        colors.textSecondary,
      marginTop: 4,
    },

    switchCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,

      backgroundColor:
        colors.glassBase,

      borderWidth: 1,

      borderColor:
        colors.border,

      padding: 16,

      borderRadius:
        radii.lg,

      marginBottom: 14,
    },

    iconBox: {
      width: 52,
      height: 52,
      borderRadius: 16,

      backgroundColor:
        "rgba(255,255,255,0.05)",

      alignItems: "center",
      justifyContent: "center",
    },

    switchInput: {
      color:
        colors.textPrimary,
      fontSize: 16,
      fontWeight: "700",
    },

    switchSub: {
      color:
        colors.textSecondary,
      marginTop: 4,
    },

    groupBtn: {
      height: 58,

      borderRadius: 30,

      backgroundColor:
        colors.lighting,

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",

      gap: 10,
    },

    groupBtnText: {
      color: "black",
      fontSize: 16,
      fontWeight: "700",
    },
});