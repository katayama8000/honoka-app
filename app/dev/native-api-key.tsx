import { type FC, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getApiKey } from "../../modules/expo-native-configuration";

const DebugScreen: FC = () => {
  const [apiKeyResult, setApiKeyResult] = useState<string | null>(null);

  const testApiKey = () => {
    try {
      const key = getApiKey();
      setApiKeyResult(key || "No API key found");
      Alert.alert("API Key Retrieved", key || "No API key found");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setApiKeyResult(`Error: ${errorMessage}`);
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 Dev Debug Panel</Text>
      <Text style={styles.subtitle}>Native Module Test</Text>

      <View style={styles.section}>
        <TouchableOpacity style={styles.button} onPress={testApiKey}>
          <Text style={styles.buttonText}>Test Native API Key</Text>
        </TouchableOpacity>

        {apiKeyResult && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>Result:</Text>
            <Text style={styles.resultText}>{apiKeyResult}</Text>
          </View>
        )}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>ℹ️ Module Information</Text>
        <Text style={styles.infoText}>
          • This panel is only available in dev environment{"\n"}• Tests the expo-native-configuration module{"\n"}• API
          Key is injected via config plugin{"\n"}• Values are read from native AndroidManifest.xml and Info.plist
        </Text>
      </View>
    </View>
  );
};

export default DebugScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
  },
  section: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  resultContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  resultText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "monospace",
  },
  infoSection: {
    backgroundColor: "#e3f2fd",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2196f3",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1976d2",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#1976d2",
    lineHeight: 20,
  },
});
