import { create } from "zustand";
import { api } from "../services/api";
import { mqttService } from "../services/mqtt";

// ======================================================
// TYPES
// ======================================================

export type SwitchItem = {
  id: number;
  name: string;
  status: boolean;
};

export type SwitchGroup = {
  id: string;
  name: string;
  switchIds: number[];
  status: boolean;
};

export type Device = {
  device_id: string;
  user_id: string;

  serialNumber?: string;

  mqtt_topics?: {
    switches: {
      set: string;
      state: string;
    }[];
  };

  switches?: SwitchItem[];

  groups?: SwitchGroup[];

  name: string;
  type: string;
  room: string;

  status: boolean;
  online: boolean;

  icon?: string | null;
  color?: string | null;

  mqtt_topic_prefix: string;

  created_at: string;
};

// ======================================================
// STORE TYPE
// ======================================================

type DevicesState = {
  devices: Device[];

  loading: boolean;

  error: string | null;

  fetchDevices: () => Promise<void>;

  deleteDevice: (
    deviceId: string
  ) => Promise<void>;

  createDevice: (
    data: any
  ) => Promise<void>;

  toggleSwitch: (
    deviceId: string,
    switchId: number
  ) => void;

  renameSwitch: (
    deviceId: string,
    switchId: number,
    newName: string
  ) => void;

  createGroup: (
    deviceId: string,
    groupName: string,
    switchIds: number[]
  ) => void;

  toggleGroup: (
    deviceId: string,
    groupId: string
  ) => void;

  bindMqtt: () => () => void;
};

// ======================================================
// STORE
// ======================================================

export const useDevicesStore =
create<DevicesState>((set, get) => ({

  devices: [],

  loading: false,

  error: null,

  // ======================================================
  // FETCH DEVICES
  // ======================================================

  fetchDevices: async () => {

    set({
      loading: true,
      error: null,
    });

    try {

      // NO BACKEND YET
      // LOCAL STATE ONLY

      set({
        loading: false,
      });

    } catch (e: any) {

      set({
        loading: false,
        error:
          e?.message ||
          "Failed to load devices",
      });
    }
  },

  // ======================================================
  // CREATE DEVICE
  // ======================================================

  createDevice: async (
    data
  ) => {

    const mqttTopics =
      Array.from(
        { length: 10 },
        (_, i) => ({
          set:
            `home/relay/${i + 1}/set`,

          state:
            `home/relay/${i + 1}/state`,
        })
      );

    const created: Device = {

      device_id:
        data.id ||
        `device_${Date.now()}`,

      user_id:
        "local_user",

      serialNumber:
        data.serialNumber,

      name:
        data.name,

      type:
        data.type,

      room:
        data.room,

      status: false,

      online: true,

      icon:
        data.icon || null,

      color:
        data.color || null,

      mqtt_topic_prefix:
        `home/${data.serialNumber}`,

      mqtt_topics: {
        switches:
          mqttTopics,
      },

      switches:
        Array.from(
          { length: 10 },
          (_, i) => ({
            id: i + 1,
            name:
              `Switch ${i + 1}`,
            status: false,
          })
        ),

      groups: [],

      created_at:
        new Date().toISOString(),
    };

    set((s) => ({
      devices: [
        ...s.devices,
        created,
      ],
    }));

    console.log(
      "DEVICE CREATED:",
      created
    );
  },

  // ======================================================
  // DELETE DEVICE
  // ======================================================

  deleteDevice: async (
    deviceId
  ) => {

    set((s) => ({
      devices:
        s.devices.filter(
          (x) =>
            x.device_id !==
            deviceId
        ),
    }));
  },

  // ======================================================
  // TOGGLE SWITCH
  // ======================================================

  toggleSwitch: (
    deviceId,
    switchId
  ) => {

    set((state) => ({

      devices:
        state.devices.map(
          (device) => {

        if (
          device.device_id !==
          deviceId
        ) {
          return device;
        }

        const updatedSwitches =
          (
            device.switches || []
          ).map((sw) => {

            if (
              sw.id === switchId
            ) {

              const newStatus =
                !sw.status;

              // MQTT SEND

              mqttService.publishRelay(
                switchId,
                newStatus
              );

              console.log(
                "MQTT SENT:",
                `home/relay/${switchId}/set`,
                newStatus
                  ? "ON"
                  : "OFF"
              );

              return {
                ...sw,
                status:
                  newStatus,
              };
            }

            return sw;
          });

        return {
          ...device,
          switches:
            updatedSwitches,
        };
      }),
    }));
  },

  // ======================================================
  // RENAME SWITCH
  // ======================================================

  renameSwitch: (
    deviceId,
    switchId,
    newName
  ) => {

    set((state) => ({

      devices:
        state.devices.map(
          (device) => {

        if (
          device.device_id !==
          deviceId
        ) {
          return device;
        }

        return {

          ...device,

          switches:
            (
              device.switches ||
              []
            ).map((sw) =>

              sw.id === switchId
                ? {
                    ...sw,
                    name:
                      newName,
                  }
                : sw
            ),
        };
      }),
    }));
  },

  // ======================================================
  // CREATE GROUP
  // ======================================================

  createGroup: (
    deviceId,
    groupName,
    switchIds
  ) => {

    set((state) => ({

      devices:
        state.devices.map(
          (device) => {

        if (
          device.device_id !==
          deviceId
        ) {
          return device;
        }

        const newGroup = {

          id:
            Date.now()
            .toString(),

          name:
            groupName,

          switchIds,

          status: false,
        };

        return {

          ...device,

          groups: [
            ...(device.groups || []),
            newGroup,
          ],
        };
      }),
    }));
  },

  // ======================================================
  // TOGGLE GROUP
  // ======================================================

  toggleGroup: (
    deviceId,
    groupId
  ) => {

    set((state) => ({

      devices:
        state.devices.map(
          (device) => {

        if (
          device.device_id !==
          deviceId
        ) {
          return device;
        }

        let targetGroup:
          SwitchGroup | null
          = null;

        const updatedGroups =
          (
            device.groups || []
          ).map((group) => {

            if (
              group.id !==
              groupId
            ) {
              return group;
            }

            targetGroup = {

              ...group,

              status:
                !group.status,
            };

            return targetGroup;
          });

        const updatedSwitches =
          (
            device.switches || []
          ).map((sw) => {

            if (
              targetGroup
              ?.switchIds
              .includes(sw.id)
            ) {

              mqttService.publishRelay(
                sw.id,
                targetGroup.status
              );

              return {

                ...sw,

                status:
                  targetGroup.status,
              };
            }

            return sw;
          });

        return {

          ...device,

          groups:
            updatedGroups,

          switches:
            updatedSwitches,
        };
      }),
    }));
  },

  // ======================================================
  // MQTT LISTENER
  // ======================================================

  bindMqtt: () => {

    return mqttService.onRelayUpdate(

      (
        relayId,
        payload
      ) => {

        console.log(
          "RELAY UPDATE:",
          relayId,
          payload
        );
      }
    );
  },
}));