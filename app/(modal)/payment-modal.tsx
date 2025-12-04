import { useLocalSearchParams, useNavigation } from "expo-router";
import { useAtom } from "jotai";
import { useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { useUser } from "@/hooks/useUser";
import { coupleIdAtom } from "@/state/couple.state";
import { userAtom } from "@/state/user.state";
import { defaultFontSize, defaultFontWeight, defaultShadowColor } from "@/style/defaultStyle";
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

  const isEditMode = kind === "edit";

  const calculatedAmount = !isEditMode && amount !== null && isHalfPrice ? Math.round(amount / 2) : amount;
  const calculatedMemo = !isEditMode && isHalfPrice ? `【半額】${memo ?? ""}` : (memo ?? null);

  useEffect(() => {
    setOptions({
      headerTitle: isEditMode ? "編集" : "支払い",
      headerTitleStyle: { fontSize: 22, color: Colors.white },
      headerStyle: { backgroundColor: Colors.primary },
    });

    if (isEditMode && typeof id === "string") {
      const payment = payments.find((p) => p.id === Number(id));
      if (payment) {
        setItem(payment.item);
        setAmount(Number(payment.amount));
        setMemo(payment.memo);
      } else {
        alert("payment not found");
      }
    }
  }, [id, setItem, setAmount, setMemo, payments, setOptions, isEditMode]);

  const handlePayment = async () => {
    if (!item || !amount) {
      alert("Please enter both name and amount.");
      return;
    }
    if (couple_id === null || user === null) return;
    if (calculatedAmount === null) return;

    try {
      const partner = await fetchPartner(couple_id, user.user_id);
      if (partner === undefined) return;

      isEditMode && id
        ? await updatePayment(Number(id), { item, amount: calculatedAmount, memo: calculatedMemo })
        : await addPayment({ item, amount: calculatedAmount, memo: calculatedMemo });

      await pushNotificationClient.sendPaymentNotification(
        partner.expo_push_token,
        user.name,
        item,
        calculatedAmount,
        isEditMode,
      );

      if (activeInvoice) {
        await fetchPaymentsAllByMonthlyInvoiceId(activeInvoice.id);
      }
    } catch (error) {
      console.error("An error occurred while handling the payment:", error);
      alert("An error occurred while processing the payment. Please try again later.");
    }
  };

  const isFormValid = item && amount !== null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <View style={styles.priceRow}>
            <View style={styles.priceInputWrapper}>
              <Text style={styles.label}>
                値段 <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={calculatedAmount !== null ? calculatedAmount.toString() : ""}
                onChangeText={(text) => {
                  const newAmount = Number(text.replace(/[^0-9]/g, ""));
                  setAmount(!isEditMode && isHalfPrice ? newAmount * 2 : newAmount);
                }}
                keyboardType="numeric"
                placeholder="1000"
                placeholderTextColor={Colors.light.icon}
              />
            </View>
            {!isEditMode && (
              <View style={styles.halfPriceContentWrapper}>
                <Text style={styles.label}>半額</Text>
                <Switch value={isHalfPrice} onValueChange={setIsHalfPrice} />
              </View>
            )}
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              項目 <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={item ?? ""}
              onChangeText={(text) => setItem(text)}
              placeholder="食費、日用品など"
              placeholderTextColor={Colors.light.icon}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>メモ</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              value={calculatedMemo ?? ""}
              onChangeText={(text) => {
                setMemo(!isEditMode && isHalfPrice ? text.replace(/^【半額】/, "") : text);
              }}
              numberOfLines={3}
              multiline
              placeholder="詳細（任意）"
              placeholderTextColor={Colors.light.icon}
            />
          </View>

          <TouchableOpacity
            onPress={handlePayment}
            style={[styles.saveButton, !isFormValid && styles.saveButtonDisabled]}
            disabled={!isFormValid}
          >
            <Text style={[styles.saveButtonText, !isFormValid && styles.saveButtonTextDisabled]}>
              {isEditMode ? "更新" : "登録"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 150,
  },
  form: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 60,
  },
  formGroup: {
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  priceInputWrapper: {
    flex: 1,
  },
  halfPriceContentWrapper: {
    marginLeft: 16,
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    fontWeight: defaultFontWeight,
    color: Colors.light.text,
    marginBottom: 4,
  },
  required: {
    color: Colors.required,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: defaultFontSize,
    backgroundColor: Colors.light.card,
    color: Colors.light.text,
    minHeight: 48,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 32,
    shadowColor: defaultShadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.light.icon,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: defaultFontWeight,
    textAlign: "center",
  },
  saveButtonTextDisabled: {
    color: Colors.white,
  },
});

export default PaymentModalScreen;
