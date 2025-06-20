type PushNotificationMessage = {
  title: string;
  body: string;
  expo_push_token: string;
};

type PushNotificationOptions = {
  title: string;
  body: string;
  expoPushToken: string;
};

const PUSH_NOTIFICATION_API_URL = "https://expo-push-notification-api-rust.vercel.app/api/handler";

export const pushNotificationClient = {
  /**
   * プッシュ通知を送信する
   * @param options - 通知のオプション
   */
  send: async (options: PushNotificationOptions): Promise<void> => {
    const message: PushNotificationMessage = {
      title: options.title,
      body: options.body,
      expo_push_token: options.expoPushToken,
    };

    try {
      const response = await fetch(PUSH_NOTIFICATION_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`Push notification failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Push notification error:", error);
      throw error;
    }
  },

  /**
   * 支払い通知を送信する
   * @param expoPushToken - 送信先のExpo Push Token
   * @param userName - ユーザー名
   * @param item - 支払い項目
   * @param amount - 金額
   * @param isEdit - 編集かどうか
   */
  sendPaymentNotification: async (
    expoPushToken: string,
    userName: string,
    item: string,
    amount: number,
    isEdit = false,
  ): Promise<void> => {
    const title = `${userName}が${isEdit ? "項目を更新しました" : "支払いました"}`;
    const body = `${item} ${amount}円`;

    await pushNotificationClient.send({
      title,
      body,
      expoPushToken,
    });
  },

  /**
   * サブスクリプション通知を送信する
   * @param expoPushToken - 送信先のExpo Push Token
   * @param userName - ユーザー名
   * @param serviceName - サービス名
   * @param action - アクション（追加/更新/削除など）
   */
  sendSubscriptionNotification: async (
    expoPushToken: string,
    userName: string,
    serviceName: string,
    action: "追加" | "更新" | "削除",
  ): Promise<void> => {
    const title = `${userName}がサブスクリプションを${action}しました`;
    const body = serviceName;

    await pushNotificationClient.send({
      title,
      body,
      expoPushToken,
    });
  },
};
