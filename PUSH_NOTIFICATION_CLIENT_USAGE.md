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
// サブスクリプション保存後の通知
try {
  if (mode === "edit" && subscriptionId) {
    await updateSubscription(subscriptionId, subscriptionData);
    await pushNotificationClient.sendSubscriptionNotification(
      partnerToken,
      userName,
      formData.serviceName,
      "更新"
    );
  } else {
    await addSubscriptionWithData(subscriptionData);
    await pushNotificationClient.sendSubscriptionNotification(
      partnerToken,
      userName,
      formData.serviceName,
      "追加"
    );
  }
} catch (error) {
  console.error("Error:", error);
}
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
