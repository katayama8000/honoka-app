import { View, Button, Text } from "react-native";
import { useRegisterBackgroundNotificationTask } from "@/hooks/useBackgroundNotificationTask";
import { useState } from "react";
import * as BackgroundTask from "expo-background-task";

export const DevBackgroundTaskScreen = () => {
  useRegisterBackgroundNotificationTask();
  const [result, setResult] = useState<string>("");

  const handleTrigger = async () => {
    try {
      await BackgroundTask.triggerTaskWorkerForTestingAsync();
      setResult("バックグラウンドタスクを即時実行しました (devモードのみ)");
    } catch (e) {
      setResult("タスク実行に失敗しました");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="バックグラウンドタスクを即時実行" onPress={handleTrigger} />
      <Text style={{ marginTop: 16 }}>{result}</Text>
    </View>
  );
};

export default DevBackgroundTaskScreen;
