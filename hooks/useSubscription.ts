import { couple_subscriptions_table } from "@/constants/Table";
import { supabase } from "@/lib/supabase";
import type { Subscription, BillingCycle } from "@/types/Row";
import { useAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";
import { ToastAndroid } from "react-native";
import { coupleIdAtom } from "../state/couple.state";
import { subscriptionsAtom } from "../state/subscription.state";

export const useSubscription = () => {
  const [subscriptions, setSubscriptions] = useAtom(subscriptionsAtom);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [coupleId] = useAtom(coupleIdAtom);

  // フォーム用の状態
  const [serviceName, setServiceName] = useState<string | null>(null);
  const [monthlyAmount, setMonthlyAmount] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [nextBillingDate, setNextBillingDate] = useState<string | null>(null);

  // フォームをリセット
  const resetForm = useCallback(() => {
    setServiceName(null);
    setMonthlyAmount(null);
    setBillingCycle("monthly");
    setNextBillingDate(null);
  }, []);

  // カップルIDが変更されたらサブスクリプション一覧を取得
  useEffect(() => {
    if (coupleId) {
      fetchSubscriptions();
    }
  }, [coupleId]);

  // サブスクリプション一覧を取得
  const fetchSubscriptions = useCallback(async (): Promise<void> => {
    if (!coupleId) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from(couple_subscriptions_table)
        .select("*")
        .eq("couple_id", coupleId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching subscriptions:", error);
        ToastAndroid.show("サブスクリプションの取得に失敗しました", ToastAndroid.SHORT);
        return;
      }

      setSubscriptions(data || []);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      ToastAndroid.show("サブスクリプションの取得に失敗しました", ToastAndroid.SHORT);
    } finally {
      setIsLoading(false);
    }
  }, [coupleId, setSubscriptions]);

  // サブスクリプションを追加
  const addSubscription = useCallback(async (): Promise<void> => {
    if (!coupleId) {
      ToastAndroid.show("カップルIDが見つかりません", ToastAndroid.SHORT);
      return;
    }

    if (!serviceName || !monthlyAmount || !nextBillingDate) {
      ToastAndroid.show("すべての項目を入力してください", ToastAndroid.SHORT);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from(couple_subscriptions_table)
        .insert({
          couple_id: coupleId,
          service_name: serviceName,
          monthly_amount: monthlyAmount,
          billing_cycle: billingCycle,
          next_billing_date: nextBillingDate,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding subscription:", error);
        ToastAndroid.show("サブスクリプションの追加に失敗しました", ToastAndroid.SHORT);
        return;
      }

      setSubscriptions((prev) => [data, ...prev]);
      resetForm();
      ToastAndroid.show("サブスクリプションを追加しました", ToastAndroid.SHORT);
    } catch (error) {
      console.error("Error adding subscription:", error);
      ToastAndroid.show("サブスクリプションの追加に失敗しました", ToastAndroid.SHORT);
    } finally {
      setIsLoading(false);
    }
  }, [coupleId, serviceName, monthlyAmount, billingCycle, nextBillingDate, resetForm, setSubscriptions]);

  // サブスクリプションを更新
  const updateSubscription = useCallback(
    async (
      id: number,
      updates: Partial<Pick<Subscription, "service_name" | "monthly_amount" | "billing_cycle" | "next_billing_date">>,
    ): Promise<void> => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from(couple_subscriptions_table)
          .update(updates)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          console.error("Error updating subscription:", error);
          ToastAndroid.show("サブスクリプションの更新に失敗しました", ToastAndroid.SHORT);
          return;
        }

        setSubscriptions((prev) => prev.map((sub) => (sub.id === id ? data : sub)));
        ToastAndroid.show("サブスクリプションを更新しました", ToastAndroid.SHORT);
      } catch (error) {
        console.error("Error updating subscription:", error);
        ToastAndroid.show("サブスクリプションの更新に失敗しました", ToastAndroid.SHORT);
      } finally {
        setIsLoading(false);
      }
    },
    [setSubscriptions],
  );

  // サブスクリプションを削除（論理削除）
  const deleteSubscription = useCallback(
    async (id: number): Promise<void> => {
      try {
        setIsLoading(true);
        const { error } = await supabase.from(couple_subscriptions_table).update({ is_active: false }).eq("id", id);

        if (error) {
          console.error("Error deleting subscription:", error);
          ToastAndroid.show("サブスクリプションの削除に失敗しました", ToastAndroid.SHORT);
          return;
        }

        setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
        ToastAndroid.show("サブスクリプションを削除しました", ToastAndroid.SHORT);
      } catch (error) {
        console.error("Error deleting subscription:", error);
        ToastAndroid.show("サブスクリプションの削除に失敗しました", ToastAndroid.SHORT);
      } finally {
        setIsLoading(false);
      }
    },
    [setSubscriptions],
  );

  // リフレッシュ処理
  const refreshSubscriptions = useCallback(async (): Promise<void> => {
    setIsRefreshing(true);
    await fetchSubscriptions();
    setIsRefreshing(false);
  }, [fetchSubscriptions]);

  // サブスクリプションの月額合計を計算
  const getTotalMonthlyAmount = useCallback((): number => {
    return subscriptions.reduce((total, sub) => {
      // 年額の場合は12で割って月額換算
      const monthlyAmount = sub.billing_cycle === "yearly" ? Math.round(sub.monthly_amount / 12) : sub.monthly_amount;
      return total + monthlyAmount;
    }, 0);
  }, [subscriptions]);

  return {
    // 状態
    subscriptions,
    isLoading,
    isRefreshing,

    // フォーム状態
    serviceName,
    setServiceName,
    monthlyAmount,
    setMonthlyAmount,
    billingCycle,
    setBillingCycle,
    nextBillingDate,
    setNextBillingDate,

    // 操作
    fetchSubscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    refreshSubscriptions,
    resetForm,

    // 計算
    getTotalMonthlyAmount,
  };
};
