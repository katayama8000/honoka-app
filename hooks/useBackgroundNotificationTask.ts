import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import dayjs from "dayjs";
import { useEffect } from "react";
import { getDefaultStore } from "jotai";
import { subscriptionsAtom } from "@/state/subscription.state";
import type { Subscription } from "@/types/Row";

const BACKGROUND_TASK_IDENTIFIER = "subscription-renewal-notification";

TaskManager.defineTask(BACKGROUND_TASK_IDENTIFIER, async () => {
  try {
    const store = getDefaultStore();
    const subscriptions = store.get(subscriptionsAtom) as Subscription[];
    const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");
    for (const sub of subscriptions) {
      if (sub.next_billing_date === tomorrow) {
        // ここでpush通知などを発火する処理を追加する（未実装）
        console.log(`${sub.service_name}の更新日が明日です`);
      }
    }
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (error) {
    console.error("Failed to execute the background task:", error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export const useRegisterBackgroundNotificationTask = () => {
  useEffect(() => {
    BackgroundTask.registerTaskAsync(BACKGROUND_TASK_IDENTIFIER, {
      minimumInterval: 60 * 6, // 6時間ごとに実行
    });
    return () => {
      BackgroundTask.unregisterTaskAsync(BACKGROUND_TASK_IDENTIFIER);
    };
  }, []);
};
