import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import type { FC } from "react";
import { useState } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";

const SpeechRecognitionScreen: FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<"ja-JP" | "en-US">("ja-JP");

  useSpeechRecognitionEvent("start", () => {
    setIsListening(true);
    setError(null);
    setTranscript("");
    setInterimTranscript("");
  });

  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
    setInterimTranscript("");
  });

  useSpeechRecognitionEvent("result", (e) => {
    const result = e.results[0];
    if (!result) return;
    if (e.isFinal) {
      setTranscript((prev) => (prev ? `${prev}\n${result.transcript}` : result.transcript));
      setInterimTranscript("");
    } else {
      setInterimTranscript(result.transcript);
    }
  });

  useSpeechRecognitionEvent("error", (e) => {
    setError(`エラー: ${e.error} — ${e.message}`);
    setIsListening(false);
  });

  const start = async () => {
    const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!granted) {
      setError("マイクの権限が許可されていません");
      return;
    }
    ExpoSpeechRecognitionModule.start({
      lang: language,
      interimResults: true,
      continuous: true,
    });
  };

  const stop = () => {
    ExpoSpeechRecognitionModule.stop();
  };

  const clear = () => {
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>expo-speech-recognition サンプル</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>言語</Text>
        <View style={styles.langButtons}>
          <View style={styles.langButton}>
            <Button
              title="日本語"
              color={language === "ja-JP" ? "#007AFF" : "#adb5bd"}
              onPress={() => setLanguage("ja-JP")}
            />
          </View>
          <View style={styles.langButton}>
            <Button
              title="English"
              color={language === "en-US" ? "#007AFF" : "#adb5bd"}
              onPress={() => setLanguage("en-US")}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ステータス</Text>
        <Text style={[styles.status, isListening ? styles.statusActive : styles.statusIdle]}>
          {isListening ? "録音中..." : "待機中"}
        </Text>
        {error && <Text style={styles.error}>{error}</Text>}
      </View>

      <View style={styles.controlRow}>
        <Button title="開始" onPress={start} disabled={isListening} />
        <Button title="停止" color="#e74c3c" onPress={stop} disabled={!isListening} />
        <Button title="クリア" color="#6c757d" onPress={clear} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>認識中 (途中結果)</Text>
        <Text style={styles.interimText}>{interimTranscript || "—"}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>確定テキスト</Text>
        <Text style={styles.transcriptText}>{transcript || "（まだ認識結果がありません）"}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  status: {
    fontSize: 16,
    textAlign: "center",
    paddingVertical: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  statusIdle: {
    color: "#6c757d",
    backgroundColor: "#e9ecef",
  },
  statusActive: {
    color: "#155724",
    backgroundColor: "#d4edda",
  },
  error: {
    color: "#721c24",
    backgroundColor: "#f8d7da",
    padding: 8,
    borderRadius: 4,
    fontSize: 14,
  },
  controlRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  langButtons: {
    flexDirection: "row",
    gap: 12,
  },
  langButton: {
    flex: 1,
  },
  interimText: {
    fontSize: 15,
    color: "#6c757d",
    fontStyle: "italic",
    minHeight: 24,
  },
  transcriptText: {
    fontSize: 15,
    color: "#212529",
    lineHeight: 24,
    minHeight: 60,
  },
});

export default SpeechRecognitionScreen;
