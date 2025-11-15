import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { PaymentCard } from "@/components/PaymentCard";
import { Colors } from "@/constants/Colors";
import { supabase } from "@/lib/supabase";
import { defaultFontWeight } from "@/style/defaultStyle";
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: id changes trigger payment fetch
  useEffect(() => {
    (async () => {
      if (typeof id === "string") {
        const payment = await fetchPaymentsAllByMonthlyInvoiceId(Number(id));
        if (payment) setMonthlyPayments(payment);
      }
    })();
  }, [id]);

  const renderItem = ({ item }: { item: Payment }) => {
    const isOwner = item.owner_id === userId;
    return (
      <PaymentCard payment={item} isOwner={isOwner} ownerLabel="あなた" partnerLabel="パートナー" showDate={true} />
    );
  };
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
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  noData: {
    fontSize: 18,
    fontWeight: defaultFontWeight,
    color: Colors.light.text,
    textAlign: "center",
    marginTop: 40,
  },
  listContent: {
    padding: 20,
    paddingBottom: 20,
  },
});
