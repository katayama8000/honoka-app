import { Colors } from "@/constants/Colors";
import { useSubscription } from "@/hooks/useSubscription";
import { coupleIdAtom } from "@/state/couple.state";
import type { Subscription } from "@/types/Row";
import { defaultFontSize, defaultFontWeight, defaultShadowColor } from "@/style/defaultStyle";
import { Ionicons } from "@expo/vector-icons";
import { type Href, useRouter } from "expo-router";
import { useAtom } from "jotai";
import type React from "react";
import { type FC, memo, useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { userAtom } from "@/state/user.state";

const SubscriptionsScreen: FC = () => {
  const {
    subscriptions,
    isLoading,
    isRefreshing,
    refreshSubscriptions,
    deleteSubscription,
    getMonthlyAmountBreakdown,
  } = useSubscription();
  const { push } = useRouter();
  const [coupleId] = useAtom(coupleIdAtom);
  const [currentUser] = useAtom(userAtom);

  const renderSubscription = useCallback(
    ({ item }: { item: Subscription }) => (
      <SubscriptionItem
        subscription={item}
        onDelete={deleteSubscription}
        onEdit={() => {
          push(`/(modal)/subscription-form?mode=edit&id=${item.id}` as Href);
        }}
        currentUserId={currentUser?.user_id}
      />
    ),
    [deleteSubscription, push, currentUser?.user_id],
  );

  const keyExtractor = useCallback((item: Subscription) => item.id.toString(), []);

  const sortedSubscriptions = useMemo(
    () => [...subscriptions].sort((a, b) => a.service_name.localeCompare(b.service_name)),
    [subscriptions],
  );

  const monthlyBreakdown = useMemo(() => getMonthlyAmountBreakdown(), [getMonthlyAmountBreakdown]);

  if (!coupleId) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>カップル情報が見つかりません</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryMainLabel}>月額サブスクリプション料金</Text>

        <View style={styles.breakdownContainer}>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>あなた</Text>
            <Text style={styles.breakdownAmount}>¥{monthlyBreakdown.myAmount.toLocaleString()}</Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>パートナー</Text>
            <Text style={styles.breakdownAmount}>¥{monthlyBreakdown.partnerAmount.toLocaleString()}</Text>
          </View>

          <View style={[styles.breakdownRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>合計</Text>
            <Text style={styles.totalAmount}>¥{monthlyBreakdown.total.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {isLoading && subscriptions.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      ) : (
        <FlatList
          data={sortedSubscriptions}
          renderItem={renderSubscription}
          keyExtractor={keyExtractor}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refreshSubscriptions} colors={[Colors.primary]} />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="card" size={64} color={Colors.light.icon} />
              <Text style={styles.emptyText}>サブスクリプションがありません</Text>
              <Text style={styles.emptySubText}>右下の + ボタンから追加してください</Text>
            </View>
          }
        />
      )}

      {/* フローティング追加ボタン */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => {
          push("/(modal)/subscription-form?mode=add" as Href);
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
};

type SubscriptionItemProps = {
  subscription: Subscription;
  onDelete: (id: number) => Promise<void>;
  onEdit: () => void;
  currentUserId?: string;
};

const SubscriptionItem: FC<SubscriptionItemProps> = memo(({ subscription, onDelete, onEdit, currentUserId }) => {
  const handleDelete = useCallback(() => {
    Alert.alert("削除確認", `${subscription.service_name}を削除しますか？`, [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: () => onDelete(subscription.id),
      },
    ]);
  }, [subscription.id, subscription.service_name, onDelete]);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
  }, []);

  const getBillingCycleText = useCallback((cycle: string) => {
    return cycle === "monthly" ? "月額" : "年額";
  }, []);

  const getCreatorText = useCallback(() => {
    if (subscription.user_id) {
      return subscription.user_id === currentUserId ? "あなた" : "パートナー";
    }
    return "あなた"; // user_idが設定されていない場合のデフォルト
  }, [subscription.user_id, currentUserId]);

  return (
    <View style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <Text style={styles.serviceName}>{subscription.service_name}</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={onEdit} style={styles.editButton}>
            <Ionicons name="create" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Ionicons name="trash" size={20} color={Colors.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.itemDetails}>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>¥{subscription.monthly_amount.toLocaleString()}</Text>
          <Text style={styles.billingCycle}>({getBillingCycleText(subscription.billing_cycle)})</Text>
        </View>

        <View style={styles.metaInfoContainer}>
          <View style={styles.nextBillingContainer}>
            <Ionicons name="calendar" size={16} color={Colors.light.icon} />
            <Text style={styles.nextBillingDate}>次回: {formatDate(subscription.next_billing_date)}</Text>
          </View>

          <View style={styles.creatorContainer}>
            <Ionicons name="person" size={16} color={Colors.light.icon} />
            <Text style={styles.creatorText}>作成者: {getCreatorText()}</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: defaultFontWeight,
    color: Colors.light.text,
  },
  summaryContainer: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    shadowColor: defaultShadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryMainLabel: {
    fontSize: 14,
    color: Colors.light.icon,
    marginBottom: 8,
    textAlign: "center",
  },
  summaryLabel: {
    fontSize: defaultFontSize,
    color: Colors.light.icon,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: defaultFontWeight,
    color: Colors.primary,
  },
  breakdownContainer: {
    gap: 6,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2,
  },
  breakdownLabel: {
    fontSize: 14,
    color: Colors.light.text,
  },
  breakdownAmount: {
    fontSize: 14,
    fontWeight: defaultFontWeight,
    color: Colors.light.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray,
    paddingTop: 6,
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: defaultFontWeight,
    color: Colors.light.text,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: defaultFontWeight,
    color: Colors.primary,
  },
  listContainer: {
    padding: 20,
    paddingTop: 12,
    paddingBottom: 100, // フローティングボタンの領域を確保
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: defaultFontWeight,
    color: Colors.light.text,
    marginTop: 16,
  },
  emptySubText: {
    fontSize: defaultFontSize,
    color: Colors.light.icon,
    marginTop: 8,
    textAlign: "center",
  },
  errorText: {
    fontSize: defaultFontSize,
    color: Colors.secondary,
    textAlign: "center",
  },
  loadingText: {
    fontSize: defaultFontSize,
    color: Colors.light.icon,
    marginTop: 12,
  },
  itemContainer: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: defaultShadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: defaultFontWeight,
    color: Colors.light.text,
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  itemDetails: {
    gap: 8,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  amount: {
    fontSize: 20,
    fontWeight: defaultFontWeight,
    color: Colors.primary,
  },
  billingCycle: {
    fontSize: 14,
    color: Colors.light.icon,
  },
  metaInfoContainer: {
    gap: 8,
  },
  nextBillingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  nextBillingDate: {
    fontSize: 14,
    color: Colors.light.icon,
  },
  creatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  creatorText: {
    fontSize: 14,
    color: Colors.light.icon,
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: defaultShadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default SubscriptionsScreen;
