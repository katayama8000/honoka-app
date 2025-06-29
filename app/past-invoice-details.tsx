import dayjs from "dayjs";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/Colors";
import { supabase } from "@/lib/supabase";
import { defaultFontSize, defaultFontWeight, defaultShadowColor } from "@/style/defaultStyle";
import type { Payment } from "@/types/Row";
import { usePayment } from "../hooks/usePayment";

export default function PastInvoiceDetailsScreen() {
  const [monthlyPayments, setMonthlyPayments] = useState<Payment[]>([]);
  const { id, date } = useLocalSearchParams();
  const { fetchPaymentsAllByMonthlyInvoiceId, isRefreshing } = usePayment();
  const { setOptions } = useNavigation();
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      const uid = (await supabase.auth.getSession())?.data.session?.user?.id;
      if (!uid) return;
      setUserId(uid);
    })();
    if (typeof date === "string") {
      setOptions({
        headerTitle: date,
        headerTitleStyle: { fontSize: 22, color: Colors.white },
        headerStyle: { backgroundColor: Colors.primary },
      });
    }
  }, [date, setOptions]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    (async () => {
      if (typeof id === "string") {
        const payment = await fetchPaymentsAllByMonthlyInvoiceId(Number(id));
        if (payment) setMonthlyPayments(payment);
      }
    })();
  }, [id]);

  const renderItem = ({ item }: { item: Payment }) => (
    <View
      style={[
        styles.card,
        {
          borderLeftColor: item.owner_id === userId ? Colors.primary : Colors.gray,
        },
      ]}
    >
      <Text style={styles.cardText}>入力日：{dayjs(item.updated_at).format("YYYY年MM月DD日")}</Text>
      <Text style={styles.cardText}>項目：{item.item}</Text>
      <Text style={styles.cardText}>金額：{item.amount.toLocaleString()}円</Text>
      {item.memo && <Text style={styles.memoText}>{item.memo}</Text>}
    </View>
  );
  if (isRefreshing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {monthlyPayments.length === 0 ? (
        <Text style={styles.noData}>支払い情報がありません。</Text>
      ) : (
        <FlatList
          data={monthlyPayments}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  noData: {
    fontSize: defaultFontSize,
    color: "#999",
    textAlign: "center",
    marginTop: 32,
  },
  listContent: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginVertical: 10,
    shadowColor: defaultShadowColor,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
    elevation: 4,
    borderLeftWidth: 6,
    borderLeftColor: Colors.primary,
    gap: 4,
  },
  cardText: {
    fontSize: defaultFontSize,
    fontWeight: defaultFontWeight,
    color: "#444",
  },
  memoText: {
    color: "#666",
    marginTop: 4,
    fontFamily: "sans-serif",
    fontSize: 12,
  },
});
