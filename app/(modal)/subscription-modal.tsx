import { Colors } from "@/constants/Colors";
import { useSubscription } from "@/hooks/useSubscription";
import { useUser } from "@/hooks/useUser";
import { coupleIdAtom } from "@/state/couple.state";
import { userAtom } from "@/state/user.state";
import { defaultFontSize, defaultFontWeight, defaultShadowColor } from "@/style/defaultStyle";
import type { Subscription } from "@/types/Row";
import { pushNotificationClient } from "@/utils/pushNotificationClient";
import dayjs from "dayjs";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useAtom } from "jotai";
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

// 1ヶ月先の日付を取得するヘルパー関数
const getNextMonthDate = (): string => dayjs().add(1, "month").format("YYYY-MM-DD");

const SubscriptionFormScreen: FC = () => {
  const { back } = useRouter();
  const params = useLocalSearchParams<{
    mode?: FormMode;
    id?: string;
    serviceName?: string;
    monthlyAmount?: string;
    billingCycle?: string;
    nextBillingDate?: string;
  }>();

  const { addSubscriptionWithData, updateSubscription, isLoading, subscriptions } = useSubscription();
  const { fetchPartner } = useUser();
  const [couple_id] = useAtom(coupleIdAtom);
  const [user] = useAtom(userAtom);

  const [mode, setMode] = useState<FormMode>("add");
  const [subscriptionId, setSubscriptionId] = useState<number | null>(null);
  const { setOptions } = useNavigation();

  // フォーム専用のローカル状態
  const [formData, setFormData] = useState<{
    serviceName: Subscription["service_name"];
    monthlyAmount: Subscription["monthly_amount"] | null;
    billingCycle: Subscription["billing_cycle"];
    nextBillingDate: Subscription["next_billing_date"];
  }>({
    serviceName: "",
    monthlyAmount: null,
    billingCycle: "monthly",
    nextBillingDate: getNextMonthDate(),
  });

  // パラメータから初期値を設定（初回のみ）
  useEffect(() => {
    setOptions({
      headerTitle: mode === "edit" ? "サブスク編集" : "サブスク追加",
      headerTitleStyle: { fontSize: 22, color: Colors.white },
      headerStyle: { backgroundColor: Colors.primary },
    });
    if (params.mode === "edit" && params.id) {
      setMode("edit");
      setSubscriptionId(Number(params.id));
      setInitialDataLoaded(false); // 編集モードでリセット

      // 既存のサブスクリプションデータから初期値を設定
      const subscription = subscriptions.find(({ id }) => id === Number(params.id));
      if (subscription) {
        setFormData({
          serviceName: subscription.service_name,
          monthlyAmount: subscription.monthly_amount,
          billingCycle: subscription.billing_cycle,
          nextBillingDate: subscription.next_billing_date,
        });
        setInitialDataLoaded(true);
      }
    } else {
      setMode("add");
      setInitialDataLoaded(false); // 追加モードでリセット
      setFormData({
        serviceName: "",
        monthlyAmount: null,
        billingCycle: "monthly",
        nextBillingDate: getNextMonthDate(),
      });
    }
  }, [params.mode, params.id, subscriptions, mode, setOptions]);

  // 初期データ設定済みフラグ
  const [initialDataLoaded, setInitialDataLoaded] = useState<boolean>(false);

  // サブスクリプションデータが読み込まれた後に編集データを設定（初回のみ）
  useEffect(() => {
    if (mode === "edit" && subscriptionId && subscriptions.length > 0 && !initialDataLoaded) {
      const subscription = subscriptions.find(({ id }) => id === subscriptionId);
      if (subscription) {
        setFormData({
          serviceName: subscription.service_name,
          monthlyAmount: subscription.monthly_amount,
          billingCycle: subscription.billing_cycle,
          nextBillingDate: subscription.next_billing_date,
        });
        setInitialDataLoaded(true);
      }
    }
  }, [subscriptions, mode, subscriptionId, initialDataLoaded]);

  const handleSubmit = useCallback(async () => {
    if (!formData.serviceName || !formData.monthlyAmount || !formData.nextBillingDate) {
      Alert.alert("入力エラー", "すべての項目を入力してください");
      return;
    }

    if (couple_id === null || user === null) return;

    try {
      const partner = await fetchPartner(couple_id, user.user_id);
      if (partner === undefined) return;

      if (mode === "edit" && subscriptionId) {
        await updateSubscription(subscriptionId, {
          service_name: formData.serviceName,
          monthly_amount: formData.monthlyAmount,
          billing_cycle: formData.billingCycle,
          next_billing_date: formData.nextBillingDate,
        });

        await pushNotificationClient.sendSubscriptionNotification(
          partner.expo_push_token,
          user.name,
          formData.serviceName,
          "更新",
        );
      } else {
        await addSubscriptionWithData({
          service_name: formData.serviceName,
          monthly_amount: formData.monthlyAmount,
          billing_cycle: formData.billingCycle,
          next_billing_date: formData.nextBillingDate,
        });

        await pushNotificationClient.sendSubscriptionNotification(
          partner.expo_push_token,
          user.name,
          formData.serviceName,
          "追加",
        );
      }
      back();
    } catch (error) {
      console.error("Error submitting form:", error);
      Alert.alert("エラー", "処理中にエラーが発生しました。もう一度お試しください。");
    }
  }, [
    formData,
    mode,
    subscriptionId,
    updateSubscription,
    addSubscriptionWithData,
    back,
    couple_id,
    user,
    fetchPartner,
  ]);

  const handleCancel = useCallback(() => {
    back();
  }, [back]);

  const handleDateChange = useCallback((text: string) => {
    setFormData((prev) => ({ ...prev, nextBillingDate: text }));
  }, []);

  const isFormValid = formData.serviceName && formData.monthlyAmount && formData.nextBillingDate;

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
        contentInsetAdjustmentBehavior="automatic"
        automaticallyAdjustContentInsets={false}
        showsVerticalScrollIndicator={false}
      >
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

          {/* 保存ボタン */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.saveButton, !isFormValid && styles.saveButtonDisabled]}
            disabled={!isFormValid || isLoading}
          >
            <Text style={[styles.saveButtonText, !isFormValid && styles.saveButtonTextDisabled]}>
              {isLoading ? "保存中..." : "保存"}
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
    paddingBottom: 150, // キーボード用の追加スペースを増加
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 40, // マージンを増加
    marginBottom: 20, // 下部マージンを追加
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
  form: {
    padding: 20,
    paddingTop: 10, // 上部パディングを削減
    paddingBottom: 60, // キーボード用の余分なスペース増加
  },
  formGroup: {
    marginBottom: 32, // 間隔をさらに広げる
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
    paddingVertical: 14, // パディングを増加してタップしやすく
    fontSize: defaultFontSize,
    backgroundColor: Colors.white,
    color: Colors.light.text,
    minHeight: 48, // 最小高さを指定してタップターゲットを大きく
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
    paddingVertical: 14, // パディングを増加
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    alignItems: "center",
    minHeight: 48, // 最小高さを指定
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
