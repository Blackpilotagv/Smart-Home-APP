import { useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  FlatList,
  TextInput,
  Modal,
  Alert,
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

import {
  useDevicesStore,
} from "../../src/store/devices";

// ======================================================
// SCREEN
// ======================================================

export default function DeviceControlScreen() {

  const router = useRouter();

  const { id } =
    useLocalSearchParams();

  // ======================================================
  // STORE
  // ======================================================

  const devices =
    useDevicesStore(
      (s) => s.devices
    );

  const toggleSwitch =
    useDevicesStore(
      (s) => s.toggleSwitch
    );

  const renameSwitch =
    useDevicesStore(
      (s) => s.renameSwitch
    );

  const createGroupStore =
    useDevicesStore(
      (s) => s.createGroup
    );

  const toggleGroupStore =
    useDevicesStore(
      (s) => s.toggleGroup
    );

  const device =
    devices.find(
      (d) => d.device_id === id
    );

  // ======================================================
  // MODAL
  // ======================================================

  const [groupModal,
    setGroupModal] =
    useState(false);

  const [groupName,
    setGroupName] =
    useState("");

  const [selectedSwitches,
    setSelectedSwitches] =
    useState<number[]>([]);

  // ======================================================
  // SELECT SWITCH
  // ======================================================

  const selectRelay = (
    relayId: number
  ) => {

    setSelectedSwitches((prev) => {

      if (prev.includes(relayId)) {
        return prev.filter(
          (id) => id !== relayId
        );
      }

      return [...prev, relayId];
    });
  };

  // ======================================================
  // CREATE GROUP
  // ======================================================

  const createGroup = () => {

    if (
      selectedSwitches.length < 2
    ) {

      Alert.alert(
        "Select switches",
        "Select at least 2 switches"
      );

      return;
    }

    setGroupModal(true);
  };

  // ======================================================
  // SAVE GROUP
  // ======================================================

  const saveGroup = () => {

    if (!groupName.trim()) {

      Alert.alert(
        "Group name required"
      );

      return;
    }

    createGroupStore(
      String(id),
      groupName,
      selectedSwitches
    );

    setGroupName("");

    setSelectedSwitches([]);

    setGroupModal(false);
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

      {/* GROUPS */}

      {(device?.groups || []).length > 0 && (

        <>
          <Text
            style={
              styles.sectionTitle
            }
          >
            Groups
          </Text>

          <FlatList
            horizontal
            data={
              device?.groups || []
            }
            keyExtractor={(i) =>
              i.id
            }
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={{
              gap: 12,
              marginBottom: 22,
            }}
            renderItem={({ item }) => (

              <TouchableOpacity
                style={
                  styles.groupCard
                }
                onPress={() =>
                  toggleGroupStore(
                    String(id),
                    item.id
                  )
                }
              >

                <Ionicons
                  name="layers"
                  size={22}
                  color={
                    colors.lighting
                  }
                />

                <Text
                  style={
                    styles.groupName
                  }
                >
                  {item.name}
                </Text>

                <Text
                  style={
                    styles.groupCount
                  }
                >
                  {
                    item.switchIds
                      .length
                  } switches
                </Text>

              </TouchableOpacity>
            )}
          />
        </>
      )}

      {/* SWITCHES */}

      <FlatList
        data={
          device?.switches || []
        }

        keyExtractor={(item) =>
          item.id.toString()
        }

        contentContainerStyle={{
          paddingBottom: 140,
        }}

        renderItem={({ item }) => (

          <TouchableOpacity

            activeOpacity={0.9}

            onLongPress={() =>
              selectRelay(
                item.id
              )
            }

            style={[
              styles.switchCard,

              selectedSwitches.includes(
                item.id
              ) && {
                borderColor:
                  colors.lighting,

                borderWidth: 2,
              },
            ]}
          >

            {/* ICON */}

            <View
              style={styles.iconBox}
            >

              <MaterialCommunityIcons
                name={
                  item.status
                    ? "lightbulb-on"
                    : "lightbulb-outline"
                }

                size={26}

                color={
                  item.status
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
                  renameSwitch(
                    String(id),
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
              value={item.status}

              onValueChange={() =>
                toggleSwitch(
                  String(id),
                  item.id
                )
              }

              trackColor={{
                false: "#444",
                true:
                  colors.lighting,
              }}
            />

          </TouchableOpacity>
        )}
      />

      {/* CREATE GROUP BUTTON */}

      <TouchableOpacity
        style={styles.groupBtn}
        onPress={
          createGroup
        }
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

      {/* MODAL */}

      <Modal
        visible={groupModal}
        transparent
        animationType="slide"
      >

        <View
          style={
            styles.modalOverlay
          }
        >

          <View
            style={
              styles.modalCard
            }
          >

            <Text
              style={
                styles.modalTitle
              }
            >
              Create Group
            </Text>

            <TextInput
              value={groupName}

              onChangeText={
                setGroupName
              }

              placeholder="Group name"

              placeholderTextColor={
                colors.textTertiary
              }

              style={
                styles.modalInput
              }
            />

            <TouchableOpacity
              style={
                styles.saveGroupBtn
              }

              onPress={
                saveGroup
              }
            >

              <Text
                style={
                  styles.saveGroupText
                }
              >
                Save Group
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={{
                marginTop: 14,
              }}

              onPress={() =>
                setGroupModal(
                  false
                )
              }
            >

              <Text
                style={{
                  color:
                    colors.textSecondary,
                }}
              >
                Cancel
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </Modal>

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

    sectionTitle: {
      color:
        colors.textPrimary,
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 12,
    },

    groupCard: {
      width: 150,
      backgroundColor:
        colors.glassBase,
      borderRadius:
        radii.lg,
      borderWidth: 1,
      borderColor:
        colors.border,
      padding: 16,
    },

    groupName: {
      color:
        colors.textPrimary,
      fontSize: 16,
      fontWeight: "700",
      marginTop: 10,
    },

    groupCount: {
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
      position: "absolute",
      bottom: 24,
      left: 24,
      right: 24,

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

    modalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(0,0,0,0.7)",
      justifyContent:
        "center",
      padding: 24,
    },

    modalCard: {
      backgroundColor:
        colors.bg,
      borderRadius:
        radii.lg,
      padding: 24,
      borderWidth: 1,
      borderColor:
        colors.border,
    },

    modalTitle: {
      color:
        colors.textPrimary,
      fontSize: 22,
      fontWeight: "800",
      marginBottom: 18,
    },

    modalInput: {
      backgroundColor:
        colors.glassBase,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radii.md,
      paddingHorizontal: 16,
      height: 54,
      color:
        colors.textPrimary,
    },

    saveGroupBtn: {
      marginTop: 18,
      backgroundColor:
        colors.lighting,
      height: 54,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
    },

    saveGroupText: {
      color: "black",
      fontWeight: "800",
      fontSize: 16,
    },
  });