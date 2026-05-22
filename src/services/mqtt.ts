import mqtt, { MqttClient } from "mqtt";
import "react-native-url-polyfill/auto";

global.Buffer =
  global.Buffer ||
  require("buffer").Buffer;

type RelayListener = (
  relayId: number,
  payload: any
) => void;

type ConnectionListener = (
  connected: boolean
) => void;

class MqttService {

  private client: MqttClient | null =
    null;

  private relayListeners =
    new Set<RelayListener>();

  private connectionListeners =
    new Set<ConnectionListener>();

  private connected = false;

  private relayStates: Record<
    number,
    boolean
  > = {};

  // =========================
  // DEVICE ID
  // =========================

  private deviceId =
    "SMDH2808B001192";

  // =========================
  // CONNECTION STATUS
  // =========================

  isConnected() {
    return this.connected;
  }

  // =========================
  // CONNECT MQTT
  // =========================

  connect() {

    if (this.client) {

      console.log(
        "MQTT ALREADY CONNECTED"
      );

      return;
    }

    try {

      const url =
        "ws://10.48.70.8:9001";

      console.log(
        "MQTT URL:",
        url
      );

      const clientId =
        `smarthome_${Math.random()
          .toString(16)
          .slice(2, 10)}`;

      console.log(
        "MQTT CLIENT ID:",
        clientId
      );

      const client = mqtt.connect(
        url,
        {
          clientId,

          keepalive: 30,

          reconnectPeriod: 4000,

          connectTimeout: 8000,

          clean: true,
        }
      );

      // =========================
      // CONNECT
      // =========================

      client.on("connect", () => {

        console.log(
          "MQTT CONNECTED SUCCESSFULLY"
        );

        this.connected = true;

        this.connectionListeners
          .forEach((l) => l(true));

        // =========================
        // SUBSCRIBE RELAY STATES
        // =========================

        for (
          let i = 1;
          i <= 10;
          i++
        ) {

          const topic =
            `home/${this.deviceId}/relay/${i}/state`;

          console.log(
            "MQTT SUBSCRIBING:",
            topic
          );

          client.subscribe(
            topic,
            (err) => {

              if (err) {

                console.log(
                  "SUBSCRIBE ERROR:",
                  err.message
                );

              } else {

                console.log(
                  "SUBSCRIBED:",
                  topic
                );
              }
            }
          );
        }
      });

      // =========================
      // RECONNECT
      // =========================

      client.on(
        "reconnect",
        () => {

          console.log(
            "MQTT RECONNECTING..."
          );

          this.connected = false;

          this.connectionListeners
            .forEach((l) => l(false));
        }
      );

      // =========================
      // CLOSE
      // =========================

      client.on("close", () => {

        console.log(
          "MQTT CONNECTION CLOSED"
        );

        this.connected = false;

        this.connectionListeners
          .forEach((l) => l(false));
      });

      // =========================
      // OFFLINE
      // =========================

      client.on("offline", () => {

        console.log(
          "MQTT OFFLINE"
        );
      });

      // =========================
      // ERROR
      // =========================

      client.on("error", (err) => {

        console.log(
          "MQTT ERROR:",
          err?.message
        );

        console.log(
          "FULL MQTT ERROR:",
          err
        );
      });

      // =========================
      // DEBUG PACKETS
      // =========================

      client.on(
        "packetsend",
        (packet: any) => {

          console.log(
            "PACKET SENT:",
            packet.cmd
          );
        }
      );

      client.on(
        "packetreceive",
        (packet: any) => {

          console.log(
            "PACKET RECEIVED:",
            packet.cmd
          );
        }
      );

      // =========================
      // RECEIVE MESSAGE
      // =========================

      client.on(
        "message",
        (topic, message) => {

          try {

            const payload =
              message.toString();

            console.log(
              "MQTT MESSAGE RECEIVED"
            );

            console.log(
              "TOPIC:",
              topic
            );

            console.log(
              "PAYLOAD:",
              payload
            );

            const parts =
              topic.split("/");

            // expected:
            // home/deviceid/relay/1/state

            if (
              parts.length >= 5 &&
              parts[0] === "home" &&
              parts[2] === "relay"
            ) {

              const relayId =
                Number(parts[3]);

              const state =
                payload === "ON";

              console.log(
                "RELAY UPDATE:",
                relayId,
                state
              );

              this.relayStates[
                relayId
              ] = state;

              this.relayListeners
                .forEach((l) =>
                  l(relayId, {
                    state,
                  })
                );
            }

          } catch (e) {

            console.log(
              "MQTT PARSE ERROR:",
              e
            );
          }
        }
      );

      this.client = client;

    } catch (e) {

      console.log(
        "MQTT CONNECT FAILED:",
        e
      );
    }
  }

  // =========================
  // DISCONNECT
  // =========================

  disconnect() {

    console.log(
      "MQTT MANUAL DISCONNECT"
    );

    this.client?.end(true);

    this.client = null;

    this.connected = false;
  }

  // =========================
  // PUBLISH RELAY
  // =========================

  publishRelay(
    relayId: number,
    state: boolean
  ) {

    const topic =
      `home/${this.deviceId}/relay/${relayId}/set`;

    const payload =
      state ? "ON" : "OFF";

    console.log(
      "MQTT PUBLISHING"
    );

    console.log(
      "TOPIC:",
      topic
    );

    console.log(
      "PAYLOAD:",
      payload
    );

    if (
      this.client &&
      this.connected
    ) {

      this.client.publish(
        topic,
        payload,
        (err) => {

          if (err) {

            console.log(
              "PUBLISH ERROR:",
              err.message
            );

          } else {

            console.log(
              "PUBLISH SUCCESS"
            );
          }
        }
      );

    } else {

      console.log(
        "MQTT NOT CONNECTED"
      );
    }

    // LOCAL UI UPDATE

    this.relayStates[relayId] =
      state;

    this.relayListeners
      .forEach((l) =>
        l(relayId, {
          state,
        })
      );
  }

  // =========================
  // RELAY LISTENER
  // =========================

  onRelayUpdate(
    listener: RelayListener
  ) {

    this.relayListeners.add(
      listener
    );

    return () =>
      this.relayListeners.delete(
        listener
      );
  }

  // =========================
  // CONNECTION LISTENER
  // =========================

  onConnection(
    listener: ConnectionListener
  ) {

    this.connectionListeners.add(
      listener
    );

    listener(this.connected);

    return () =>
      this.connectionListeners.delete(
        listener
      );
  }
}

export const mqttService =
  new MqttService();