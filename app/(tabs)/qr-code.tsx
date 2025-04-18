import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TouchableOpacity, Alert, Linking } from "react-native";
import { Camera, CameraType, CameraView, BarcodeScanningResult } from "expo-camera";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { openBrowserAsync } from "expo-web-browser";

export default function QRSCodeScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState<boolean>(false);
  const [cameraType, setCameraType] = useState<CameraType>("back");

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  // URLかどうかをチェックする関数
  const isValidUrl = (text: string): boolean => {
    try {
      new URL(text);
      return true;
    } catch (err) {
      return false;
    }
  };

  // URLを開く関数
  const openUrl = async (url: string) => {
    try {
      await openBrowserAsync(url);
    } catch (error) {
      console.error("URLを開けませんでした:", error);
      Alert.alert("エラー", "URLを開けませんでした");
    }
  };

  const handleBarCodeScanned = ({ type, data }: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);

    // URLかどうかをチェック
    const isUrl = isValidUrl(data);

    Alert.alert("QRコード検出", `タイプ: ${type}\nデータ: ${data}${isUrl ? "\n\nこのURLを開きますか？" : ""}`, [
      {
        text: "キャンセル",
        style: "cancel",
        onPress: () => setScanned(false),
      },
      // URLの場合は「開く」ボタンを表示
      ...(isUrl
        ? [
            {
              text: "開く",
              onPress: () => {
                openUrl(data);
                setScanned(false);
              },
            },
          ]
        : []),
      {
        text: "OK",
        onPress: () => {
          console.log("QR Code data:", data);
          setScanned(false);
        },
      },
    ]);
  };

  const toggleCameraType = () => {
    setCameraType((current) => (current === "back" ? "front" : "back"));
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>カメラの権限を確認中...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>カメラへのアクセスが許可されていません。</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <CameraView
        style={styles.camera}
        facing={cameraType}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
          </View>
          <Text style={styles.instructionText}>QRコードをフレーム内に配置してください</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={30} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setScanned(false)}>
            <Text style={styles.buttonText}>再スキャン</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraType}>
            <Ionicons name="camera-reverse" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  cornerTL: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: Colors.light.tint,
  },
  cornerTR: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: Colors.light.tint,
  },
  cornerBL: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: Colors.light.tint,
  },
  cornerBR: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: Colors.light.tint,
  },
  instructionText: {
    color: "white",
    fontSize: 16,
    marginTop: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  backButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: 150,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: Colors.light.tint,
  },
  buttonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  flipButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
});
