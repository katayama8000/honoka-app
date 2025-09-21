import { useLocalSearchParams, useNavigation } from "expo-router";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { Platform, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { useUser } from "@/hooks/useUser";
import { coupleIdAtom } from "@/state/couple.state";
import { userAtom } from "@/state/user.state";
import { defaultFontSize, defaultFontWeight } from "@/style/defaultStyle";
import { pushNotificationClient } from "@/utils/pushNotificationClient";
import { usePayment } from "../../hooks/usePayment";
import { activeInvoiceAtom } from "../../state/invoice.state";

const PaymentModalScreen = () => {
  const {
    payments,
    addPayment,
    updatePayment,
    fetchPaymentsAllByMonthlyInvoiceId,
    setItem,
    setAmount,
    setMemo,
    item,
    amount,
    memo,
    isHalfPrice,
    setIsHalfPrice,
  } = usePayment();
  const { fetchPartner } = useUser();
  const { kind, id } = useLocalSearchParams();
  const { setOptions } = useNavigation();
  const [activeInvoice] = useAtom(activeInvoiceAtom);
  const [couple_id] = useAtom(coupleIdAtom);
  const [user] = useAtom(userAtom);

  useEffect(() => {
    setOptions({
      headerTitle: kind === "edit" ? "編集" : "支払い",
      headerTitleStyle: { fontSize: 22, color: Colors.white },
      headerStyle: { backgroundColor: Colors.primary },
    });

    if (kind === "edit" && typeof id === "string") {
      const payment = payments.find((p) => p.id === Number(id));
      if (payment) {
        setItem(payment.item);
        setAmount(Number(payment.amount));
        setMemo(payment.memo);
      } else {
        alert("payment not found");
      }
    }
  }, [kind, id, setItem, setAmount, setMemo, payments, setOptions]);

  const handlePayment = async () => {
    if (!item || !amount) {
      alert("Please enter both name and amount.");
      return;
    }
    if (couple_id === null || user === null) return;

    try {
      const partner = await fetchPartner(couple_id, user.user_id);
      if (partner === undefined) return;

      const finalAmount = isHalfPrice ? Math.round(amount / 2) : amount;
      const finalMemo = isHalfPrice ? `【半額】${memo ?? ""}` : memo;

      kind === "edit" && id
        ? await updatePayment(Number(id), { item, amount: finalAmount, memo: finalMemo })
        : await addPayment({ item, amount: finalAmount, memo: finalMemo });

      await pushNotificationClient.sendPaymentNotification(
        partner.expo_push_token,
        user.name,
        item,
        finalAmount,
        kind === "edit",
      );

      if (activeInvoice) {
        await fetchPaymentsAllByMonthlyInvoiceId(activeInvoice.id);
      }
    } catch (error) {
      console.error("An error occurred while handling the payment:", error);
      alert("An error occurred while processing the payment. Please try again later.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formWrapper}>
        <Text style={styles.inputLabel}>
          項目<Text style={styles.asterisk}> *</Text>
        </Text>
        <TextInput style={styles.input} value={item ?? ""} onChangeText={(text) => setItem(text)} />
      </View>
      <View style={styles.formWrapper}>
        <Text style={styles.inputLabel}>
          値段<Text style={styles.asterisk}> *</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={amount ? amount.toString() : ""}
          onChangeText={(text) => setAmount(Number(text.replace(/[^0-9]/g, "")))}
          keyboardType={Platform.select({ android: "numeric" })}
        />
      </View>
      <View style={styles.halfPriceWrapper}>
        <Text style={styles.inputLabel}>半額</Text>
        <Switch value={isHalfPrice} onValueChange={setIsHalfPrice} />
      </View>
      <View style={styles.formWrapper}>
        <Text style={styles.inputLabel}>メモ</Text>
        <TextInput
          style={[styles.input, { height: 60 }]}
          value={memo ?? ""}
          onChangeText={(text) => setMemo(text)}
          numberOfLines={2}
          multiline
        />
      </View>
      <View style={styles.submitWrapper}>
        <TouchableOpacity style={styles.submitButton} onPress={handlePayment} disabled={!item || !amount}>
          <Text style={styles.submitButtonText}>{kind === "edit" ? "更新" : "登録"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  formWrapper: {
    marginVertical: 12,
    width: "100%",
  },
  halfPriceWrapper: {
    marginVertical: 12,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputLabel: {
    fontSize: defaultFontSize,
    fontWeight: defaultFontWeight,
    marginBottom: 5,
  },
  asterisk: {
    color: Colors.required,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontWeight: defaultFontWeight,
  },
  submitWrapper: {
    width: "100%",
    alignItems: "center",
  },
  submitButton: {
    marginTop: 24,
    paddingVertical: 16,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  submitButtonText: {
    color: Colors.textOnPrimary,
    fontSize: defaultFontSize,
    fontWeight: defaultFontWeight,
  },
});

export default PaymentModalScreen;
