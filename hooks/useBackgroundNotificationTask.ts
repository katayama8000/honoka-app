import dayjs from "dayjs";
import * as BackgroundTask from "expo-background-task";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { getDefaultStore } from "jotai";
import { useEffect } from "react";
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
        console.log(`Sending notification for ${sub.service_name} renewal tomorrow`);
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "サブスク更新日が近づいています",
            body: `${sub.service_name}の更新日が明日です`,
          },
          trigger: null,
        });
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
      minimumInterval: 60 * 6, // execute every 6 minutes
    });
  }, []);
};
