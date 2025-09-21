import { AntDesign, Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { type Href, useRouter } from "expo-router";
import { useAtom } from "jotai";
import { type FC, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { Colors } from "@/constants/Colors";
import { defaultFontSize, defaultFontWeight, defaultShadowColor } from "@/style/defaultStyle";
import type { Couple, Invoice, Payment, Payment as PaymentRow, User } from "@/types/Row";
import { useCouple } from "../../hooks/useCouple";
import { useInvoice } from "../../hooks/useInvoice";
import { usePayment } from "../../hooks/usePayment";
import { useUser } from "../../hooks/useUser";
import { version } from "../../package.json";
import { coupleIdAtom } from "../../state/couple.state";
import { activeInvoiceAtom } from "../../state/invoice.state";
import { userAtom } from "../../state/user.state";

const HomeScreen: FC = () => {
  const { payments, isRefreshing, deletePayment, isLoading } = usePayment();
  const { initInvoice, unActiveInvoicesAll, turnInvoicePaid, fetchActiveInvoiceByCoupleId } = useInvoice();
  const { fetchCoupleIdByUserId } = useCouple();
  const { fetchPaymentsAllByMonthlyInvoiceId, setupRecurringPayments } = usePayment();
  const { fetchPartner } = useUser();
  const [coupleId, setCoupleId] = useAtom(coupleIdAtom);
  const [activeInvoce, setActiveInvoice] = useAtom(activeInvoiceAtom);
  const [currentUser] = useAtom(userAtom);
  const { push } = useRouter();
  const showCloseMonthButton = process.env.EXPO_PUBLIC_APP_ENV === "development" ? true : dayjs().date() >= 20;
  const [userId, setUserId] = useState<string | null>(null);
  const [partner, setPartner] = useState<User | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!currentUser?.user_id) {
      return;
    }

    (async () => {
      const uid = currentUser.user_id;
      setUserId(uid);

      const coupleId = await fetchCoupleIdByUserId(uid);
      if (!coupleId) {
        throw new Error("coupleId is not found");
      }
      setCoupleId(coupleId);

      const partnerData = await fetchPartner(coupleId, uid);
      if (partnerData) {
        setPartner(partnerData);
      }

      const activeInvoiceData = await fetchActiveInvoiceByCoupleId(coupleId);
      setActiveInvoice(activeInvoiceData ?? null);
    })();
  }, [currentUser?.user_id]);

  const updateActiveInvoice = async () => {
    if (!coupleId) {
      alert("coupleId is not found");
      throw new Error("coupleId is not found");
    }
    const activeInvoiceData = await fetchActiveInvoiceByCoupleId(coupleId);
    setActiveInvoice(activeInvoiceData ?? null);
  };

  const handleCloseMonth = async (coupleId: Couple["id"]) => {
    Alert.alert("今月の精算を完了します", "よろしいですか？", [
      { text: "いいえ", style: "cancel" },
      {
        text: "はい",
        onPress: async () => {
          await unActiveInvoicesAll(coupleId);
          if (activeInvoce?.id) {
            await turnInvoicePaid(activeInvoce.id);
          }
          await initInvoice(coupleId);
          await setupRecurringPayments(coupleId);
          const activeInvoice = await fetchActiveInvoiceByCoupleId(coupleId);
          setActiveInvoice(activeInvoice ?? null);
          Alert.alert("精算が完了しました", "今月もパートナーを大事にね！");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {process.env.EXPO_PUBLIC_APP_ENV === "development" && (
        <TouchableOpacity
          onPress={() => push("/dev")}
          style={{
            backgroundColor: Colors.primary,
            padding: 8,
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 16,
            marginHorizontal: 20,
            shadowColor: defaultShadowColor,
            shadowOffset: { width: 0, height: 2 },
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="construct" size={24} color="white" />
          <Text
            style={{
              color: "white",
              fontSize: defaultFontSize,
              paddingLeft: 8,
              fontWeight: defaultFontWeight,
            }}
          >
            デバッグ
          </Text>
        </TouchableOpacity>
      )}

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={`${Colors.primary}`} />
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      ) : (
        <PaymentList
          activeInvoiceId={activeInvoce?.id ?? null}
          payments={payments}
          isRefreshing={isRefreshing}
          fetchAllPaymentsByMonthlyInvoiceId={fetchPaymentsAllByMonthlyInvoiceId}
          deletePayment={deletePayment}
          routerPush={push}
          updateActiveInvoice={updateActiveInvoice}
          userId={userId}
          currentUserName={currentUser?.name}
          partnerName={partner?.name}
        />
      )}

      <FloatingActionButton
        position="bottomRight"
        iconName="plus"
        onPress={() => push({ pathname: "/payment-modal", params: { kind: "add" } })}
      />

      {showCloseMonthButton && (
        <FloatingActionButton
          position="bottomLeft"
          iconName="check-circle"
          color={Colors.secondary}
          onPress={async () => {
            if (!coupleId) {
              alert("coupleId is not found");
              return;
            }
            handleCloseMonth(coupleId);
          }}
        />
      )}
    </View>
  );
};

type PaymentListProps = {
  activeInvoiceId: Invoice["id"] | null;
  payments: PaymentRow[];
  isRefreshing: boolean;
  fetchAllPaymentsByMonthlyInvoiceId: (id: Payment["monthly_invoice_id"]) => void;
  deletePayment: (id: PaymentRow["id"]) => Promise<void>;
  routerPush: (href: Href) => void;
  updateActiveInvoice: () => Promise<void>;
  userId: string | null;
  currentUserName?: string;
  partnerName?: string;
};

const PaymentList: FC<PaymentListProps> = ({
  activeInvoiceId,
  payments,
  isRefreshing,
  fetchAllPaymentsByMonthlyInvoiceId,
  deletePayment,
  routerPush,
  updateActiveInvoice,
  userId,
  currentUserName,
  partnerName,
}) => (
  <FlatList
    data={payments.sort((a, b) => b.id - a.id)}
    renderItem={({ item }) => (
      <PaymentItem
        payment={item}
        routerPush={routerPush}
        deletePayment={deletePayment}
        userId={userId}
        currentUserName={currentUserName}
        partnerName={partnerName}
      />
    )}
    keyExtractor={(item) => item.id.toString()}
    ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
    ListEmptyComponent={() => (
      <View style={styles.emptyContainer}>
        <AntDesign name="inbox" size={64} color={Colors.light.icon} />
        <Text style={styles.emptyText}>支払いがまだありません</Text>
        <Text style={styles.emptySubText}>右下の + ボタンから追加してください</Text>
      </View>
    )}
    contentContainerStyle={styles.listContainer}
    onRefresh={async () => {
      if (activeInvoiceId === null) return;
      await updateActiveInvoice();
      fetchAllPaymentsByMonthlyInvoiceId(activeInvoiceId);
    }}
    refreshing={isRefreshing}
    showsVerticalScrollIndicator={false}
    ListFooterComponent={<GithubIssueLink />}
  />
);

const GithubIssueLink: FC = () => {
  return (
    <View style={styles.linkContainer}>
      <TouchableOpacity onPress={() => Linking.openURL("https://github.com/katayama8000/honoka-app/issues")}>
        <Text style={styles.link}>バグ修正や改善要望はこちらから</Text>
      </TouchableOpacity>
      <Text style={styles.version}>v{version}</Text>
    </View>
  );
};

type PaymentItemProps = {
  deletePayment: (id: PaymentRow["id"]) => Promise<void>;
  routerPush: (href: Href) => void;
  payment: PaymentRow;
  userId: string | null;
  currentUserName?: string;
  partnerName?: string;
};

const PaymentItem: FC<PaymentItemProps> = ({
  deletePayment,
  routerPush,
  payment,
  userId,
  currentUserName,
  partnerName,
}) => {
  const { fetchPaymentsAllByMonthlyInvoiceId } = usePayment();
  const [activeInvoce] = useAtom(activeInvoiceAtom);
  const isOwner = payment.owner_id === userId;

  const handleDeletePayment = async () => {
    Alert.alert("削除確認", "この支払いを削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          await deletePayment(payment.id);
          if (activeInvoce === null) return;
          ToastAndroid.show("削除しました", ToastAndroid.SHORT);
          await fetchPaymentsAllByMonthlyInvoiceId(activeInvoce.id);
        },
      },
    ]);
  };

  const handleEditPayment = () => {
    routerPush({ pathname: "/payment-modal", params: { kind: "edit", id: payment.id } });
  };

  const CardContent = (
    <View style={styles.cardContent}>
      <Text style={styles.itemTitle}>{payment.item}</Text>
      <View style={styles.row}>
        <Text style={styles.value}>{payment.amount.toLocaleString()}円</Text>
      </View>
      {payment.memo && <Text style={styles.memo}>{payment.memo}</Text>}
    </View>
  );

  return (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        {CardContent}
        <View style={isOwner ? styles.ownerIndicator : styles.partnerIndicator}>
          <Text style={isOwner ? styles.ownerText : styles.partnerText}>
            {isOwner ? currentUserName || "あなた" : partnerName || "パートナー"}
          </Text>
        </View>

        {/* 自分の支払いの場合のみ編集・削除ボタンを表示 */}
        {isOwner && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.editButton} onPress={handleEditPayment} activeOpacity={0.7}>
              <Ionicons name="create" size={18} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePayment} activeOpacity={0.7}>
              <Ionicons name="trash" size={18} color={Colors.secondary} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

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
  loadingText: {
    fontSize: defaultFontSize,
    color: Colors.light.icon,
    marginTop: 12,
  },
  listContainer: {
    padding: 20,
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
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 4,
  },
  link: {
    color: Colors.primary,
  },
  version: {
    color: Colors.black,
    paddingLeft: 8,
  },
  cardContainer: {
    marginBottom: 8,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: Colors.light.card,
    shadowColor: defaultShadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
  },
  cardContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: defaultFontWeight,
    marginBottom: 8,
    color: Colors.light.text,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: defaultFontWeight,
    color: Colors.primary,
  },
  memo: {
    fontSize: 14,
    color: Colors.light.icon,
    marginTop: 4,
  },
  ownerIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  ownerText: {
    color: Colors.textOnPrimary,
    fontSize: 12,
    fontWeight: defaultFontWeight,
  },
  partnerIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: Colors.light.icon,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  partnerText: {
    color: Colors.textOnPrimary,
    fontSize: 12,
    fontWeight: defaultFontWeight,
  },
  actionButtons: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.card,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: defaultShadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.card,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: defaultShadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  addButton: {
    borderRadius: 50,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    width: 100,
    padding: 8,
    elevation: 4,
    shadowColor: defaultShadowColor,
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addButtonText: {
    color: Colors.textOnPrimary,
    fontSize: defaultFontSize,
    paddingLeft: 8,
    fontWeight: defaultFontWeight,
  },
  emptyListText: {
    color: "#888",
    fontSize: defaultFontSize,
    textAlign: "center",
  },
  horizontal: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },
});

export default HomeScreen;
