import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { type Href, useFocusEffect, useRouter } from "expo-router";
import { useAtom } from "jotai";
import { type FC, memo, useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "@/constants/Colors";
import { useInvoice } from "@/hooks/useInvoice";
import { usePayment } from "@/hooks/usePayment";
import { coupleIdAtom } from "@/state/couple.state";
import type { InvoiceWithBalance } from "@/state/invoice.state";
import { defaultFontSize, defaultFontWeight, defaultShadowColor } from "@/style/defaultStyle";

const PastInvoicesScreen: FC = () => {
  const { invoices, isRefreshing, fetchInvoicesWithBalancesByCoupleId } = useInvoice();
  const { push } = useRouter();
  const [coupleId] = useAtom(coupleIdAtom);

  useEffect(() => {
    if (coupleId) {
      fetchInvoicesWithBalancesByCoupleId(coupleId);
    }
  }, [coupleId, fetchInvoicesWithBalancesByCoupleId]);

  const handleRefresh = useCallback(() => {
    if (coupleId) {
      fetchInvoicesWithBalancesByCoupleId(coupleId);
    }
  }, [coupleId, fetchInvoicesWithBalancesByCoupleId]);

  const renderInvoice = useCallback(
    ({ item }: { item: InvoiceWithBalance }) => <MonthlyInvoice invoiceWithBalance={item} routerPush={push} />,
    [push],
  );

  const keyExtractor = useCallback((item: InvoiceWithBalance) => item.id.toString(), []);

  const sortedInvoices = useMemo(
    () =>
      [...invoices].sort((a, b) => {
        if (a.year === b.year) {
          return b.month - a.month;
        }
        return b.year - a.year;
      }),
    [invoices],
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedInvoices}
        renderItem={renderInvoice}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={EmptyListMessage}
        contentContainerStyle={styles.listContainer}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
      />
    </View>
  );
};

type MonthlyInvoiceProps = {
  invoiceWithBalance: InvoiceWithBalance;
  routerPush: (href: Href) => void;
};

const MonthlyInvoice: FC<MonthlyInvoiceProps> = memo(({ invoiceWithBalance, routerPush }) => {
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const { calculateInvoiceBalance } = usePayment();

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      (async () => {
        try {
          if (!invoiceWithBalance.active) return;
          const amount = await calculateInvoiceBalance(invoiceWithBalance.id);
          if (isMounted) setTotalAmount(amount);
        } catch (error) {
          console.error("Error calculating invoice balance:", error);
          if (isMounted) setTotalAmount(null);
        }
      })();

      return () => {
        isMounted = false;
      };
    }, [invoiceWithBalance.id, invoiceWithBalance.active, calculateInvoiceBalance]),
  );

  const handlePress = useCallback(() => {
    routerPush({
      pathname: "/past-invoice-details",
      params: { id: invoiceWithBalance.id, date: `${invoiceWithBalance.year}年 ${invoiceWithBalance.month}月` },
    });
  }, [invoiceWithBalance.id, invoiceWithBalance.year, invoiceWithBalance.month, routerPush]);

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity onPress={handlePress} style={{ flex: 1 }}>
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <View>
              <View style={styles.dateContainer}>
                <Text style={styles.date}>{`${invoiceWithBalance.year}年 ${invoiceWithBalance.month}月`}</Text>
                {invoiceWithBalance.active && <Text style={styles.thisMonth}>今月</Text>}
              </View>
              <AmountDisplay
                active={invoiceWithBalance.active}
                totalAmount={totalAmount}
                balance={invoiceWithBalance.balance ?? null}
              />
            </View>
            <MaterialIcons name="arrow-forward-ios" size={24} color={Colors.light.icon} />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
});

const AmountDisplay: FC<{ active: boolean; totalAmount: number | null; balance: number | null }> = ({
  active,
  totalAmount,
  balance,
}) => {
  if (active) {
    return totalAmount != null ? (
      <Text style={styles.amount}>
        {totalAmount > 0
          ? `${totalAmount.toLocaleString()}円の受け取り`
          : `${Math.abs(totalAmount).toLocaleString()}円の支払い`}
      </Text>
    ) : (
      <ActivityIndicator color={Colors.primary} />
    );
  }

  return balance != null ? (
    <Text style={styles.amount}>
      {balance > 0 ? `${balance.toLocaleString()}円の受け取り` : `${Math.abs(balance).toLocaleString()}円の支払い`}
    </Text>
  ) : (
    <ActivityIndicator color={Colors.primary} />
  );
};

const EmptyListMessage: FC = () => (
  <View style={styles.emptyContainer}>
    <AntDesign name="inbox" size={64} color={Colors.light.icon} />
    <Text style={styles.emptyText}>過去の請求がありません</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100, // フローティングボタンの領域を確保
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
  thisMonth: {
    padding: 4,
    paddingHorizontal: 8,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    color: Colors.white,
    fontSize: 12,
    fontWeight: "light",
  },
  date: {
    fontSize: defaultFontSize,
    fontWeight: defaultFontWeight,
    marginBottom: 4,
  },
  amount: {
    fontSize: defaultFontSize,
    fontWeight: defaultFontWeight,
  },
});

export default memo(PastInvoicesScreen);
