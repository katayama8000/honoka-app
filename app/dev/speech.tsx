import * as Speech from "expo-speech";
import type { FC } from "react";
import { useState } from "react";
import { Button, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

const SAMPLE_TEXTS = [
  { label: "日本語 (挨拶)", text: "こんにちは！今日もよい一日を。", language: "ja-JP" },
  { label: "日本語 (数字)", text: "1, 2, 3, 4, 5, 6, 7, 8, 9, 10", language: "ja-JP" },
  { label: "English", text: "Hello! Have a great day.", language: "en-US" },
] as const;

const SpeechScreen: FC = () => {
  const [customText, setCustomText] = useState("読み上げたいテキストを入力してください");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [pitch, setPitch] = useState(1.0);
  const [rate, setRate] = useState(1.0);

  const speak = async (text: string, language: string) => {
    const speaking = await Speech.isSpeakingAsync();
    if (speaking) {
      await Speech.stop();
    }
    setIsSpeaking(true);
    Speech.speak(text, {
      language,
      pitch,
      rate,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const stop = async () => {
    await Speech.stop();
    setIsSpeaking(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>expo-speech サンプル</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ステータス</Text>
        <Text style={[styles.status, isSpeaking ? styles.statusActive : styles.statusIdle]}>
          {isSpeaking ? "読み上げ中..." : "待機中"}
        </Text>
        {isSpeaking && <Button title="停止" color="#e74c3c" onPress={stop} />}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>パラメータ</Text>
        <View style={styles.paramRow}>
          <Text style={styles.paramLabel}>ピッチ: {pitch.toFixed(1)}</Text>
          <View style={styles.paramButtons}>
            <Button title="-" onPress={() => setPitch((p) => Math.max(0.5, p - 0.1))} />
            <Button title="+" onPress={() => setPitch((p) => Math.min(2.0, p + 0.1))} />
          </View>
        </View>
        <View style={styles.paramRow}>
          <Text style={styles.paramLabel}>速度: {rate.toFixed(1)}</Text>
          <View style={styles.paramButtons}>
            <Button title="-" onPress={() => setRate((r) => Math.max(0.1, r - 0.1))} />
            <Button title="+" onPress={() => setRate((r) => Math.min(2.0, r + 0.1))} />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>サンプルテキスト</Text>
        {SAMPLE_TEXTS.map((sample) => (
          <View key={sample.label} style={styles.sampleRow}>
            <Text style={styles.sampleLabel}>{sample.label}</Text>
            <Text style={styles.sampleText}>{sample.text}</Text>
            <Button title="読み上げ" onPress={() => speak(sample.text, sample.language)} />
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>カスタムテキスト</Text>
        <TextInput style={styles.input} value={customText} onChangeText={setCustomText} multiline numberOfLines={3} />
        <Button title="読み上げ (日本語)" onPress={() => speak(customText, "ja-JP")} />
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
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
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
  paramRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paramLabel: {
    fontSize: 15,
    flex: 1,
  },
  paramButtons: {
    flexDirection: "row",
    gap: 8,
  },
  sampleRow: {
    marginBottom: 12,
    gap: 4,
  },
  sampleLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#495057",
  },
  sampleText: {
    fontSize: 14,
    color: "#212529",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 6,
    padding: 10,
    fontSize: 15,
    backgroundColor: "#fff",
    minHeight: 80,
    textAlignVertical: "top",
  },
});

export default SpeechScreen;
