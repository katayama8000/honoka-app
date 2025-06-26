import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";

const debugPages = [
  {
    name: "バックグラウンドタスク検証",
    path: "/dev/background-task-test",
  },
  {
    name: "ネイティブAPIキー検証",
    path: "/dev/native-api-key",
  },
] as const;

const DevIndexScreen = () => {
  const { push } = useRouter();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20, marginBottom: 24 }}>デバッグ用ページ一覧</Text>
      {debugPages.map((page) => (
        <Button key={page.path} title={page.name} onPress={() => push(page.path)} />
      ))}
    </View>
  );
};

export default DevIndexScreen;
