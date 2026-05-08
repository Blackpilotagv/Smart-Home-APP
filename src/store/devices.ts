import { create } from "zustand";
import { api } from "../services/api";
import { mqttService } from "../services/mqtt";

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

  switches?: {
    id: number;
    name: string;
    status: boolean;
  }[];

  name: string;
  type: string;
  room: string;
  status: boolean;
  online: boolean;
  brightness?: number;
  fan_speed?: number;
  temperature?: number;
  target_temperature?: number;
  energy_watts?: number;
  icon?: string | null;
  color?: string | null;
  mqtt_topic_prefix: string;
  created_at: string;
};

type DevicesState = {
  devices: Device[];
  loading: boolean;
  error: string | null;
  fetchDevices: () => Promise<void>;
  applyMqttStatus: (deviceId: string, payload: any) => void;
  toggleDevice: (deviceId: string) => Promise<void>;
  patchDevice: (deviceId: string, patch: Partial<Device>) => Promise<void>;
  deleteDevice: (deviceId: string) => Promise<void>;
  createDevice: (data: any) => Promise<void>;
  bindMqtt: () => () => void;
};

export const useDevicesStore = create<DevicesState>((set, get) => ({
  devices: [],
  loading: false,
  error: null,
  fetchDevices: async () => {
    set({ loading: true, error: null });
    try {
      const list: Device[] = await api.listDevices();
      set({ devices: list, loading: false });
      list.forEach((d) =>
        mqttService.registerDevice(d.device_id, {
          status: d.status,
          brightness: d.brightness,
          fan_speed: d.fan_speed,
          temperature: d.temperature,
          target_temperature: d.target_temperature,
          energy_watts: d.energy_watts,
        }),
      );
    } catch (e: any) {
      set({ loading: false, error: e?.message || "Failed to load devices" });
    }
  },
  applyMqttStatus: (deviceId, payload) => {
    set((s) => ({
      devices: s.devices.map((d) => (d.device_id === deviceId ? { ...d, ...payload } : d)),
    }));
  },
  toggleDevice: async (deviceId) => {
    const d = get().devices.find((x) => x.device_id === deviceId);
    if (!d) return;
    const next = !d.status;
    // optimistic
    set((s) => ({ devices: s.devices.map((x) => (x.device_id === deviceId ? { ...x, status: next } : x)) }));
    mqttService.publish(deviceId, { status: next });
    try {
      await api.updateDevice(deviceId, { status: next });
    } catch {
      // rollback
      set((s) => ({ devices: s.devices.map((x) => (x.device_id === deviceId ? { ...x, status: !next } : x)) }));
    }
  },
  patchDevice: async (deviceId, patch) => {
    set((s) => ({ devices: s.devices.map((x) => (x.device_id === deviceId ? { ...x, ...patch } : x)) }));
    mqttService.publish(deviceId, patch);
    try {
      await api.updateDevice(deviceId, patch);
    } catch {}
  },
  deleteDevice: async (deviceId) => {
    set((s) => ({ devices: s.devices.filter((x) => x.device_id !== deviceId) }));
    try {
      await api.deleteDevice(deviceId);
    } catch {}
  },

 createDevice: async (data) => {

  // LOCAL OFFLINE DEVICE CREATION

  const created: Device = {

    device_id:
      data.id ||
      `device_${Date.now()}`,

    user_id: "local_user",

    name: data.name,

    type: data.type,

    room: data.room,

    status: false,

    online: false,

    brightness: 100,

    fan_speed: 1,

    temperature: 24,

    target_temperature: 24,

    energy_watts: 0,

    icon: data.icon || null,

    color: data.color || null,

    mqtt_topic_prefix:
      `home/${data.serialNumber}`,

    created_at:
      new Date().toISOString(),
  };

  // SAVE LOCALLY

  set((s) => ({
    devices: [
      ...s.devices,
      created,
    ],
  }));

  console.log(
    "LOCAL DEVICE CREATED:",
    created
  );

  // REGISTER MQTT DEVICE

  mqttService.registerDevice(
    created.device_id,
    {
      status: created.status,
      brightness:
        created.brightness,

      fan_speed:
        created.fan_speed,

      temperature:
        created.temperature,

      target_temperature:
        created.target_temperature,

      energy_watts:
        created.energy_watts,
    }
  );
},
  bindMqtt: () => {
    return mqttService.onStatus((deviceId, payload) => {
      get().applyMqttStatus(deviceId, payload);
    });
  },
}));
