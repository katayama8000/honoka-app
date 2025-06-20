# Push Notification Client 使用方法

## 概要
`pushNotificationClient`は、Expo Push Notificationを送信するための抽象化されたクライアントです。

## 基本的な使用方法

### 1. インポート
```typescript
import { pushNotificationClient } from "@/utils/pushNotificationClient";
```

### 2. 基本的な通知送信
```typescript
await pushNotificationClient.send({
  title: "通知タイトル",
  body: "通知内容",
  expoPushToken: "ExponentPushToken[xxx]",
});
```

### 3. 支払い通知（専用メソッド）
```typescript
// 新規支払い
await pushNotificationClient.sendPaymentNotification(
  expoPushToken,
  "田中太郎",
  "コーヒー",
  500,
  false // 編集ではない
);

// 支払い編集
await pushNotificationClient.sendPaymentNotification(
  expoPushToken,
  "田中太郎",
  "コーヒー",
  500,
  true // 編集
);
```

### 4. サブスクリプション通知（専用メソッド）
```typescript
// サブスクリプション追加
await pushNotificationClient.sendSubscriptionNotification(
  expoPushToken,
  "田中太郎",
  "Netflix",
  "追加"
);

// サブスクリプション更新
await pushNotificationClient.sendSubscriptionNotification(
  expoPushToken,
  "田中太郎",
  "Netflix",
  "更新"
);

// サブスクリプション削除
await pushNotificationClient.sendSubscriptionNotification(
  expoPushToken,
  "田中太郎",
  "Netflix",
  "削除"
);
```

## 実装例

### payment-modal.tsx での使用例
```typescript
// Before
const sendPushNotification = async (
  expoPushToken: string,
  name: string,
  item: string,
  amount: number,
  kind: string,
) => {
  const message = {
    title: `${name}が${kind === "edit" ? "項目を更新しました" : "支払いました"}`,
    body: `${item} ${amount}円`,
    expo_push_token: expoPushToken,
  };

  try {
    await fetch("https://expo-push-notification-api-rust.vercel.app/api/handler", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
  } catch (error) {
    console.error(error);
  }
};

// After
await pushNotificationClient.sendPaymentNotification(
  partner.expo_push_token,
  user.name,
  item,
  amount,
  kind === "edit"
);
```

### subscription-modal.tsx での使用例
```typescript
// ユーザー関連のhooksとatomsを追加
const { fetchPartner } = useUser();
const [couple_id] = useAtom(coupleIdAtom);
const [user] = useAtom(userAtom);

// handleSubmit関数内での通知送信
const handleSubmit = useCallback(async () => {
  // ...バリデーション処理...

  if (couple_id === null || user === null) return;

  try {
    const partner = await fetchPartner(couple_id, user.user_id);
    if (partner === undefined) return;

    if (mode === "edit" && subscriptionId) {
      await updateSubscription(subscriptionId, subscriptionData);
      
      // 更新通知を送信
      await pushNotificationClient.sendSubscriptionNotification(
        partner.expo_push_token,
        user.name,
        formData.serviceName,
        "更新"
      );
    } else {
      await addSubscriptionWithData(subscriptionData);
      
      // 追加通知を送信
      await pushNotificationClient.sendSubscriptionNotification(
        partner.expo_push_token,
        user.name,
        formData.serviceName,
        "追加"
      );
    }
    
    back();
  } catch (error) {
    console.error("Error submitting form:", error);
    Alert.alert("エラー", "処理中にエラーが発生しました。もう一度お試しください。");
  }
}, [formData, mode, subscriptionId, updateSubscription, addSubscriptionWithData, back, couple_id, user, fetchPartner]);
```

### subscriptions.tsx での削除通知例
```typescript
// 削除通知付きハンドラーを作成
const handleDeleteWithNotification = useCallback(
  async (subscriptionId: number) => {
    try {
      // 削除前にサブスクリプション情報を取得
      const subscription = subscriptions.find(sub => sub.id === subscriptionId);
      if (!subscription) return;

      // サブスクリプションを削除
      await deleteSubscription(subscriptionId);

      // パートナーに通知を送信
      if (partner?.expo_push_token && currentUser?.name) {
        await pushNotificationClient.sendSubscriptionNotification(
          partner.expo_push_token,
          currentUser.name,
          subscription.service_name,
          "削除"
        );
      }
    } catch (error) {
      console.error("Error deleting subscription:", error);
      Alert.alert("エラー", "削除中にエラーが発生しました。");
    }
  },
  [deleteSubscription, subscriptions, partner?.expo_push_token, currentUser?.name],
);
```

## エラーハンドリング
```typescript
try {
  await pushNotificationClient.send({
    title: "タイトル",
    body: "内容",
    expoPushToken: token,
  });
} catch (error) {
  console.error("Push notification failed:", error);
  // 必要に応じてユーザーにエラーを表示
}
```

## メリット
1. **再利用可能**: 複数の画面で同じ通知ロジックを使用可能
2. **一元管理**: APIエンドポイントやエラーハンドリングを一箇所で管理
3. **型安全**: TypeScriptで型定義されているため、型安全
4. **拡張性**: 新しい通知タイプを簡単に追加可能
5. **保守性**: 通知ロジックの変更時は一箇所の修正で済む
