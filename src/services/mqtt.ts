/**
 * MQTT Service Singleton.
 * Connects to public MQTT broker over WebSocket (works in React Native/Expo).
 * Subscribes to home/+/status, publishes to home/{device_id}/control.
 *
 * Includes a built-in simulator that emulates ESP32 status responses
 * so the UI stays reactive even without real hardware.
 */
import mqtt, { MqttClient } from "mqtt";

type StatusListener = (deviceId: string, payload: any) => void;
type ConnectionListener = (connected: boolean) => void;

class MqttService {
  private client: MqttClient | null = null;
  private statusListeners = new Set<StatusListener>();
  private connectionListeners = new Set<ConnectionListener>();
  private connected = false;
  private simulatorEnabled = true;
  private deviceState: Record<string, any> = {};

  isConnected() {
    return this.connected;
  }

  setSimulator(enabled: boolean) {
    this.simulatorEnabled = enabled;
  }

  isSimulatorEnabled() {
    return this.simulatorEnabled;
  }

  registerDevice(deviceId: string, initial: any) {
    this.deviceState[deviceId] = { ...initial };
  }

  connect() {
    if (this.client) return;
    try {
      const url = "wss://broker.hivemq.com:8884/mqtt";
      const client = mqtt.connect(url, {
        clientId: `iothome_${Math.random().toString(16).slice(2, 10)}`,
        keepalive: 30,
        reconnectPeriod: 4000,
        connectTimeout: 8000,
        clean: true,
      });

      client.on("connect", () => {
        this.connected = true;
        this.connectionListeners.forEach((l) => l(true));
        client.subscribe("home/+/status");
      });

      client.on("reconnect", () => {
        this.connected = false;
        this.connectionListeners.forEach((l) => l(false));
      });

      client.on("close", () => {
        this.connected = false;
        this.connectionListeners.forEach((l) => l(false));
      });

      client.on("error", (err) => {
        console.warn("[MQTT] error", err?.message);
      });

      client.on("message", (topic, message) => {
        // topic: home/{device_id}/status
        const parts = topic.split("/");
        if (parts.length >= 3 && parts[2] === "status") {
          const deviceId = parts[1];
          try {
            const payload = JSON.parse(message.toString());
            this.deviceState[deviceId] = { ...this.deviceState[deviceId], ...payload };
            this.statusListeners.forEach((l) => l(deviceId, payload));
          } catch {
            // ignore non-JSON
          }
        }
      });

      this.client = client;
    } catch (e) {
      console.warn("[MQTT] connect failed", e);
    }
  }

  disconnect() {
    this.client?.end(true);
    this.client = null;
    this.connected = false;
  }

  publish(deviceId: string, command: any) {
    const topic = `home/${deviceId}/control`;
    const payload = JSON.stringify(command);
    if (this.client && this.connected) {
      this.client.publish(topic, payload);
    }
    if (this.simulatorEnabled) {
      // Simulate ESP32 echoing back the new status after a short delay
      setTimeout(() => {
        const merged = { ...(this.deviceState[deviceId] || {}), ...command };
        this.deviceState[deviceId] = merged;
        this.statusListeners.forEach((l) => l(deviceId, merged));
        // Also publish to broker so other listeners see it
        if (this.client && this.connected) {
          this.client.publish(`home/${deviceId}/status`, JSON.stringify(merged));
        }
      }, 220);
    }
  }

  onStatus(l: StatusListener) {
    this.statusListeners.add(l);
    return () => this.statusListeners.delete(l);
  }

  onConnection(l: ConnectionListener) {
    this.connectionListeners.add(l);
    l(this.connected);
    return () => this.connectionListeners.delete(l);
  }
}

export const mqttService = new MqttService();
