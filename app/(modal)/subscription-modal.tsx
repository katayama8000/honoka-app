import { Colors } from "@/constants/Colors";
import { useSubscription } from "@/hooks/useSubscription";
import type { BillingCycle } from "@/types/Row";
import { defaultFontSize, defaultFontWeight, defaultShadowColor } from "@/style/defaultStyle";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import type React from "react";
import { type FC, useCallback, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type FormMode = "add" | "edit";

const SubscriptionFormScreen: FC = () => {
  const { back } = useRouter();
  const params = useLocalSearchParams<{
    mode?: string;
    id?: string;
    serviceName?: string;
    monthlyAmount?: string;
    billingCycle?: string;
    nextBillingDate?: string;
  }>();

  const { addSubscriptionWithData, updateSubscription, isLoading, subscriptions } = useSubscription();

  const [mode, setMode] = useState<FormMode>("add");
  const [subscriptionId, setSubscriptionId] = useState<number | null>(null);

  // フォーム専用のローカル状態
  const [formData, setFormData] = useState({
    serviceName: "",
    monthlyAmount: null as number | null,
    billingCycle: "monthly" as BillingCycle,
    nextBillingDate: "",
  });

  // パラメータから初期値を設定（初回のみ）
  useEffect(() => {
    if (params.mode === "edit" && params.id) {
      setMode("edit");
      setSubscriptionId(Number(params.id));

      // 既存のサブスクリプションデータから初期値を設定
      const subscription = subscriptions.find((sub) => sub.id === Number(params.id));
      if (subscription) {
        setFormData({
          serviceName: subscription.service_name,
          monthlyAmount: subscription.monthly_amount,
          billingCycle: subscription.billing_cycle,
          nextBillingDate: subscription.next_billing_date,
        });
      }
    } else {
      setMode("add");
      setFormData({
        serviceName: "",
        monthlyAmount: null,
        billingCycle: "monthly",
        nextBillingDate: "",
      });
    }
  }, [params.mode, params.id, subscriptions]); // subscriptionsを依存配列に追加

  // サブスクリプションデータが読み込まれた後に編集データを設定
  useEffect(() => {
    if (mode === "edit" && subscriptionId && subscriptions.length > 0) {
      const subscription = subscriptions.find((sub) => sub.id === subscriptionId);
      if (subscription && formData.serviceName === "") {
        setFormData({
          serviceName: subscription.service_name,
          monthlyAmount: subscription.monthly_amount,
          billingCycle: subscription.billing_cycle,
          nextBillingDate: subscription.next_billing_date,
        });
      }
    }
  }, [subscriptions, mode, subscriptionId, formData.serviceName]);

  const handleSubmit = useCallback(async () => {
    if (!formData.serviceName || !formData.monthlyAmount || !formData.nextBillingDate) {
      Alert.alert("入力エラー", "すべての項目を入力してください");
      return;
    }

    try {
      if (mode === "edit" && subscriptionId) {
        await updateSubscription(subscriptionId, {
          service_name: formData.serviceName,
          monthly_amount: formData.monthlyAmount,
          billing_cycle: formData.billingCycle,
          next_billing_date: formData.nextBillingDate,
        });
      } else {
        await addSubscriptionWithData({
          service_name: formData.serviceName,
          monthly_amount: formData.monthlyAmount,
          billing_cycle: formData.billingCycle,
          next_billing_date: formData.nextBillingDate,
        });
      }
      back();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  }, [formData, mode, subscriptionId, updateSubscription, addSubscriptionWithData, back]);

  const handleCancel = useCallback(() => {
    back();
  }, [back]);

  const handleDateChange = useCallback((text: string) => {
    setFormData((prev) => ({ ...prev, nextBillingDate: text }));
  }, []);

  const isFormValid = formData.serviceName && formData.monthlyAmount && formData.nextBillingDate;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Ionicons name="close" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.title}>{mode === "edit" ? "サブスク編集" : "サブスク追加"}</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.saveButton, !isFormValid && styles.saveButtonDisabled]}
            disabled={!isFormValid || isLoading}
          >
            <Text style={[styles.saveButtonText, !isFormValid && styles.saveButtonTextDisabled]}>保存</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              サービス名 <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={formData.serviceName}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, serviceName: text }))}
              placeholder="Netflix, Spotify など"
              placeholderTextColor={Colors.light.icon}
              maxLength={50}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              月額料金（円） <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={formData.monthlyAmount?.toString() || ""}
              onChangeText={(text) => {
                const numericValue = text.replace(/[^0-9]/g, "");
                setFormData((prev) => ({
                  ...prev,
                  monthlyAmount: numericValue ? Number(numericValue) : null,
                }));
              }}
              placeholder="1000"
              placeholderTextColor={Colors.light.icon}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>請求サイクル</Text>
            <View style={styles.billingCycleContainer}>
              <TouchableOpacity
                style={[
                  styles.billingCycleButton,
                  formData.billingCycle === "monthly" && styles.billingCycleButtonActive,
                ]}
                onPress={() => setFormData((prev) => ({ ...prev, billingCycle: "monthly" }))}
              >
                <Text
                  style={[
                    styles.billingCycleButtonText,
                    formData.billingCycle === "monthly" && styles.billingCycleButtonTextActive,
                  ]}
                >
                  月額
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.billingCycleButton,
                  formData.billingCycle === "yearly" && styles.billingCycleButtonActive,
                ]}
                onPress={() => setFormData((prev) => ({ ...prev, billingCycle: "yearly" }))}
              >
                <Text
                  style={[
                    styles.billingCycleButtonText,
                    formData.billingCycle === "yearly" && styles.billingCycleButtonTextActive,
                  ]}
                >
                  年額
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              次回請求日 <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={formData.nextBillingDate}
              onChangeText={handleDateChange}
              placeholder="2025-01-15"
              placeholderTextColor={Colors.light.icon}
              maxLength={10}
            />
            <Text style={styles.helpText}>形式: YYYY-MM-DD</Text>
          </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray,
    shadowColor: defaultShadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: defaultFontWeight,
    color: Colors.light.text,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.light.icon,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: defaultFontWeight,
  },
  saveButtonTextDisabled: {
    color: Colors.white,
  },
  form: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: defaultFontWeight,
    color: Colors.light.text,
    marginBottom: 8,
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
    backgroundColor: Colors.white,
    color: Colors.light.text,
  },
  helpText: {
    fontSize: 12,
    color: Colors.light.icon,
    marginTop: 4,
  },
  billingCycleContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 8,
    overflow: "hidden",
  },
  billingCycleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    alignItems: "center",
  },
  billingCycleButtonActive: {
    backgroundColor: Colors.primary,
  },
  billingCycleButtonText: {
    fontSize: defaultFontSize,
    color: Colors.light.text,
    fontWeight: defaultFontWeight,
  },
  billingCycleButtonTextActive: {
    color: Colors.white,
  },
});

export default SubscriptionFormScreen;
