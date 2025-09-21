import { MaterialIcons } from "@expo/vector-icons";
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
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={EmptyListMessage}
        contentContainerStyle={styles.listContent}
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
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.cardContainer}>
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
        <MaterialIcons name="arrow-forward-ios" size={24} />
      </View>
    </TouchableOpacity>
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
  <View style={styles.emptyListMessage}>
    <Text>過去の請求がありません</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  separator: {
    height: 4,
  },
  listContent: {
    paddingBottom: 100,
  },
  card: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    shadowColor: defaultShadowColor,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
    elevation: 4,
    backgroundColor: "white",
  },
  cardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  emptyListMessage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  thisMonth: {
    padding: 4,
    paddingHorizontal: 8,
    backgroundColor: "#FFD700",
    borderRadius: 16,
    color: "#fff",
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
