import { View, Button, Text } from "react-native";
import { useRegisterBackgroundNotificationTask } from "@/hooks/useBackgroundNotificationTask";
import { useState, useEffect } from "react";
import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";

export const DevBackgroundTaskScreen = () => {
  useRegisterBackgroundNotificationTask();
  const [result, setResult] = useState<string>("");
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);

  useEffect(() => {
    const checkRegistration = async () => {
      const registered = await TaskManager.isTaskRegisteredAsync("subscription-renewal-notification");
      setIsRegistered(registered);
    };
    checkRegistration();
  }, []);

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
      <Text style={{ marginTop: 16 }}>
        タスク登録状況: {isRegistered === null ? "確認中..." : isRegistered ? "登録済み" : "未登録"}
      </Text>
    </View>
  );
};

export default DevBackgroundTaskScreen;
