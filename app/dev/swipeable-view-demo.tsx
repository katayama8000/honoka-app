import type { FC } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SwiperView } from "react-native-swipeable-view";

export const SwipeableViewDemo: FC = () => {
  const handleDelete = (id: number) => {
    Alert.alert("削除完了", `アイテム ${id} を削除しました`);
  };

  const handlePress = (id: number) => {
    Alert.alert("アイテムを選択", `アイテム ${id} が選択されました`);
  };

  const renderDeleteBackView = () => (
    <View style={styles.deleteBackView}>
      <Text style={styles.deleteText}>削除</Text>
    </View>
  );

  const renderCustomBackView = () => (
    <View style={styles.customBackView}>
      <View style={styles.archiveSection}>
        <Text style={styles.actionText}>アーカイブ</Text>
      </View>
      <View style={styles.deleteSection}>
        <Text style={styles.actionText}>削除</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>SwiperView Demo</Text>

      {/* 基本的な使用例 */}
      <Text style={styles.sectionTitle}>基本的な使用例</Text>
      <SwiperView
        onSwipeLeft={() => handleDelete(1)}
        onPress={() => handlePress(1)}
        backView={renderDeleteBackView()}
        style={styles.swipeItem}
      >
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>基本的なスワイプアイテム</Text>
          <Text style={styles.itemDescription}>左にスワイプして削除できます</Text>
        </View>
      </SwiperView>

      {/* カスタマイズされた例 */}
      <Text style={styles.sectionTitle}>カスタマイズ例</Text>
      <SwiperView
        onSwipeLeft={() => handleDelete(2)}
        onPress={() => handlePress(2)}
        backView={renderDeleteBackView()}
        style={styles.swipeItem}
        swipeThreshold={-100}
        maxSwipeDistance={-150}
        confirmationTitle="本当に削除しますか？"
        confirmationMessage="この操作は元に戻せません。"
        confirmButtonText="削除する"
        cancelButtonText="キャンセル"
        backgroundColor="#f8f9fa"
      >
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>カスタマイズされたスワイプ</Text>
          <Text style={styles.itemDescription}>カスタム確認ダイアログとスワイプ設定</Text>
        </View>
      </SwiperView>

      {/* 複数アクション風の例 */}
      <Text style={styles.sectionTitle}>複数アクション風</Text>
      <SwiperView
        onSwipeLeft={() => handleDelete(3)}
        onPress={() => handlePress(3)}
        backView={renderCustomBackView()}
        style={styles.swipeItem}
        swipeThreshold={-120}
        maxSwipeDistance={-200}
        backgroundColor="#ffffff"
      >
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>複数アクション例</Text>
          <Text style={styles.itemDescription}>背景に複数のアクションボタン風デザイン</Text>
        </View>
      </SwiperView>

      {/* リストアイテムのような例 */}
      <Text style={styles.sectionTitle}>リストアイテム例</Text>
      {Array.from({ length: 3 }, (_, index) => {
        const itemId = index + 4;
        return (
          <SwiperView
            key={`list-item-${itemId}`}
            onSwipeLeft={() => handleDelete(itemId)}
            onPress={() => handlePress(itemId)}
            backView={renderDeleteBackView()}
            style={styles.swipeItem}
          >
            <View style={styles.listItemContent}>
              <View style={styles.avatar} />
              <View style={styles.listItemText}>
                <Text style={styles.listItemTitle}>アイテム {itemId}</Text>
                <Text style={styles.listItemSubtitle}>説明テキスト：左にスワイプで削除</Text>
              </View>
              <Text style={styles.timestamp}>12:3{index}</Text>
            </View>
          </SwiperView>
        );
      })}

      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#333",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
    color: "#444",
  },
  swipeItem: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  itemContent: {
    padding: 16,
    backgroundColor: "#fff",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: "#666",
  },
  listItemContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ddd",
    marginRight: 12,
  },
  listItemText: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  listItemSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
  },
  deleteBackView: {
    backgroundColor: "#ff4444",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 20,
  },
  deleteText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  customBackView: {
    flexDirection: "row",
  },
  archiveSection: {
    flex: 1,
    backgroundColor: "#ff9500",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteSection: {
    flex: 1,
    backgroundColor: "#ff4444",
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  spacer: {
    height: 40,
  },
});
