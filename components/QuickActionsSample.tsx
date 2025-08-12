import * as QuickActions from "expo-quick-actions";
import { useQuickAction } from "expo-quick-actions/hooks";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

export const QuickActionsSample = () => {
  // 起動時にトリガーされたクイックアクションを取得するフック
  const action = useQuickAction();

  // アプリ内で状態を管理するためのState
  const [actionInfo, setActionInfo] = useState("No action triggered yet.");

  // アプリ起動時に一度だけクイックアクションのメニュー項目を設定
  useEffect(() => {
    const setupQuickActions = async () => {
      // この機能がサポートされているか確認
      const supported = await QuickActions.isSupported();
      if (!supported) {
        console.log("Quick Actions not supported on this device.");
        return;
      }

      console.log("Setting up quick actions...");
      // ホーム画面のメニュー項目を設定
      await QuickActions.setItems([
        {
          id: "1", // 必須: ユニークなID
          title: "新規作成", // 必須: 表示されるタイトル
          subtitle: "新しいメモを作成します", // 省略可
          icon: "add", // iOSのみ: SF Symbol名 (https://developer.apple.com/sf-symbols/)
          params: { message: "「新規作成」から起動しました！" }, // アプリに渡すデータ
        },
        {
          id: "2",
          title: "検索",
          subtitle: "メモを検索します",
          icon: "search",
          params: { message: "「検索」から起動しました！" },
        },
        {
          id: "3",
          title: "設定",
          icon: "symbol:gear", // SF Symbolsを使用
          params: { message: "「設定」から起動しました！" },
        },
      ]);
    };

    setupQuickActions();
  }, []);

  // `useQuickAction`で取得したactionオブジェクトが変化したときに実行
  useEffect(() => {
    if (action) {
      // actionオブジェクトには設定したidやparamsが含まれる
      console.log("Quick action triggered:", action);

      // 画面に情報を表示
      setActionInfo(`ID: ${action.id}\nMessage: ${action.params?.message}`);

      // アラートでユーザーに通知
      Alert.alert("Quick Action", `「${action.title}」が選択されました。\n(${action.params?.message})`);

      // ここで画面遷移などのロジックを実装する
      // e.g. if (action.id === '1') { navigation.navigate('CreateNote'); }
    }
  }, [action]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Quick Actions Demo</Text>
      <Text style={styles.infoText}>ホーム画面に戻り、アプリアイコンを長押ししてメニューを試してください。</Text>
      <View style={styles.statusBox}>
        <Text style={styles.statusTitle}>最後にトリガーされたアクション:</Text>
        <Text style={styles.statusContent}>{actionInfo}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#555",
  },
  statusBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    width: "100%",
    backgroundColor: "#f9f9f9",
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  statusContent: {
    fontSize: 14,
    color: "#333",
  },
});
