import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";

import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../src/theme";

export default function QRScannerScreen() {

  const router = useRouter();

  const [permission, requestPermission] =
    useCameraPermissions();

  const [scanned, setScanned] =
    useState(false);

  useEffect(() => {

    if (!permission?.granted) {
      requestPermission();
    }

  }, []);

  // ======================================================
  // QR SCANNED
  // ======================================================

  const handleBarcodeScanned = ({ data }: any) => {

    if (scanned) return;

    setScanned(true);

    console.log("QR DATA:", data);

    // Example QR:
    // SMHC2508B00192

    router.replace({
      pathname: "/device/add-device",
      params: {
        serial: data,
      },
    });
  };

  // ======================================================
  // NO PERMISSION
  // ======================================================

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {

    return (
      <View style={styles.center}>

        <Text style={styles.permissionText}>
          Camera permission required
        </Text>

        <TouchableOpacity
          style={styles.permissionBtn}
          onPress={requestPermission}
        >
          <Text style={styles.permissionBtnText}>
            Grant Permission
          </Text>
        </TouchableOpacity>

      </View>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <View style={styles.container}>

      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={handleBarcodeScanned}
      />

      {/* DARK OVERLAY */}

      <View style={styles.overlay}>

        {/* TOP BAR */}

        <View style={styles.topBar}>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => router.back()}
          >
            <Ionicons
              name="close"
              size={26}
              color="white"
            />
          </TouchableOpacity>

        </View>

        {/* CENTER */}

        <View style={styles.scanArea}>

          <View style={styles.scanBox} />

          <Text style={styles.scanText}>
            Scan Device QR Code
          </Text>

          <Text style={styles.scanSub}>
            Point your camera at the device QR
          </Text>

        </View>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "black",
  },

  center: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  permissionText: {
    color: colors.textPrimary,
    fontSize: 18,
    marginBottom: 20,
  },

  permissionBtn: {
    backgroundColor: colors.lighting,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
  },

  permissionBtnText: {
    color: "black",
    fontWeight: "700",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  topBar: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  scanArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  scanBox: {
    width: 260,
    height: 260,
    borderWidth: 3,
    borderColor: colors.lighting,
    borderRadius: 20,
    backgroundColor: "transparent",
  },

  scanText: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 30,
  },

  scanSub: {
    color: "rgba(255,255,255,0.7)",
    marginTop: 8,
    fontSize: 14,
  },
});