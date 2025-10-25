import dayjs from "dayjs";
import { useRouter } from "expo-router";
import { useAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";
import { ToastAndroid } from "react-native";
import { RecurringPayments } from "@/constants/RecurringPayments";
import { payments_table } from "@/constants/Table";
import { supabase } from "@/lib/supabase";
import type { Couple, Payment } from "@/types/Row";
import { coupleIdAtom } from "../state/couple.state";
import { activeInvoiceAtom } from "../state/invoice.state";
import { paymentsAtom } from "../state/payment.state";
import { useInvoice } from "./useInvoice";

export const usePayment = () => {
  const [payments, setPayments] = useAtom(paymentsAtom);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [item, setItem] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [memo, setMemo] = useState<string | null>(null);
  const [isHalfPrice, setIsHalfPrice] = useState<boolean>(false);
  const { fetchMonthlyInvoiceIdByCoupleId } = useInvoice();
  const [coupleId] = useAtom(coupleIdAtom);
  const { back } = useRouter();
  const [activeInvoice] = useAtom(activeInvoiceAtom);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    (async () => {
      if (activeInvoice === null) {
        return;
      }
      setIsLoading(true);
      await fetchPaymentsAllByMonthlyInvoiceId(activeInvoice.id);
      setIsLoading(false);
    })();
  }, [activeInvoice]);

  const resetForm = () => {
    setItem(null);
    setAmount(null);
    setMemo(null);
    setIsHalfPrice(false);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const addPayment = useCallback(
    async (payment: Pick<Payment, "item" | "amount" | "memo">): Promise<void> => {
      if (!payment.item || !payment.amount) {
        alert("Please enter both name and amount.");
        return;
      }

      if (!coupleId) {
        alert("coupleId is not found");
        return;
      }
      const monthly_invoice_id = await fetchMonthlyInvoiceIdByCoupleId(coupleId);

      if (monthly_invoice_id === undefined) {
        alert("monthly_invoice_id is not found");
        return;
      }

      const uid = (await supabase.auth.getSession())?.data.session?.user.id;
      if (uid === undefined) {
        alert("uid is not found");
        return;
      }
      try {
        const { error } = await supabase.from(payments_table).insert([
          {
            amount: payment.amount,
            monthly_invoice_id,
            item: payment.item,
            memo: payment.memo,
            updated_at: dayjs().toISOString(),
            created_at: dayjs().toISOString(),
            owner_id: uid,
            deleted_at: null,
          },
        ]);

        if (error) {
          console.error(error);
          alert("An error occurred. Please try again.");
          return;
        }

        ToastAndroid.show("投稿した", ToastAndroid.SHORT);
        resetForm();
        back();
      } catch (error) {
        console.error(error);
        alert("An error occurred. Please try again.");
      }
    },
    [back, fetchMonthlyInvoiceIdByCoupleId, coupleId],
  );

  const fetchPaymentsAllByMonthlyInvoiceId = useCallback(
    async (monthlyInvoiceId: Payment["monthly_invoice_id"]) => {
      setIsRefreshing(true);
      try {
        const { data, error } = await supabase
          .from(payments_table)
          .select("*")
          .eq("monthly_invoice_id", monthlyInvoiceId)
          .is("deleted_at", null);
        if (error) {
          console.error(error);
          alert("An error occurred. Please try again.");
          return;
        }
        if (data) {
          setPayments(data);
        }
        return data;
      } catch (error) {
        console.error(error);
        alert("An error occurred. Please try again.");
      } finally {
        setIsRefreshing(false);
      }
    },
    [setPayments],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const updatePayment = useCallback(
    async (id: Payment["id"], payment: Pick<Payment, "item" | "amount" | "memo">): Promise<void> => {
      try {
        const { error } = await supabase.from(payments_table).update(payment).match({ id });
        if (error) {
          console.error(error);
          alert("An error occurred. Please try again.");
          return;
        }
        ToastAndroid.show("更新した", ToastAndroid.SHORT);
        resetForm();
        back();
      } catch (error) {
        console.error(error);
        alert("An error occurred. Please try again.");
      }
    },
    [back],
  );

  const deletePayment = useCallback(async (id: Payment["id"]): Promise<void> => {
    try {
      const { error } = await supabase.from(payments_table).update({ deleted_at: dayjs().toISOString() }).match({ id });
      if (error) {
        console.error(error);
        alert("An error occurred. Please try again.");
        return;
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred. Please try again.");
    }
  }, []);

  const calculateInvoiceBalance = async (monthlyInvoiceId: Payment["monthly_invoice_id"]) => {
    const uid = (await supabase.auth.getSession())?.data.session?.user?.id;
    if (!uid) throw new Error("User ID not found. Please ensure you're authenticated.");
    try {
      const { data: invoices, error } = await supabase
        .from(payments_table)
        .select("amount, owner_id")
        .eq("monthly_invoice_id", monthlyInvoiceId)
        .is("deleted_at", null);

      if (error) {
        throw error;
      }

      const invoiceBalance = invoices.reduce((acc, cur) => acc + (cur.owner_id === uid ? cur.amount : -cur.amount), 0);

      return invoiceBalance;
    } catch (error) {
      console.error("Error fetching invoice balance:", error);
      return 0;
    }
  };

  const setupRecurringPayments = useCallback(
    async (coupleId: Couple["id"]) => {
      const monthlyInvoiceId = await fetchMonthlyInvoiceIdByCoupleId(coupleId);
      if (!monthlyInvoiceId) {
        alert("monthly_invoice_id is not found");
        return;
      }

      const uidHusband = "0f0ba5d1-9c4e-4d97-96f1-8e6645cb5497";
      const uidWife = "9b776e5e-0c4c-432b-beaa-b77f12e0e5f8";

      // user id should be a wife's id
      const uid = (await supabase.auth.getSession())?.data.session?.user.id;
      if (uid === undefined) {
        alert("uid is not found");
        return;
      }
      if (uid !== uidWife && uid !== uidHusband) {
        alert("uid is invalid");
        return;
      }

      const startOfNextMonth = dayjs().add(1, "month").startOf("month").add(9, "hours");

      const paymentsData = RecurringPayments().map((item) => ({
        ...item,
        monthly_invoice_id: monthlyInvoiceId,
        owner_id: item.item === "家賃" ? uidHusband : uidWife,
        updated_at: startOfNextMonth.toISOString(),
        created_at: startOfNextMonth.toISOString(),
        deleted_at: null,
      }));

      try {
        const { error } = await supabase.from(payments_table).insert(paymentsData);

        if (error) {
          console.error("Error inserting payments:", error);
          alert("An error occurred while adding payments. Please try again.");
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        alert("An unexpected error occurred. Please try again.");
      }
    },
    [fetchMonthlyInvoiceIdByCoupleId],
  );

  return {
    addPayment,
    amount,
    calculateInvoiceBalance,
    deletePayment,
    fetchPaymentsAllByMonthlyInvoiceId,
    isLoading,
    isRefreshing,
    item,
    memo,
    payments,
    setAmount,
    setItem,
    setMemo,
    setupRecurringPayments,
    updatePayment,
    isHalfPrice,
    setIsHalfPrice,
  };
};
