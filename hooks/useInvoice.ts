import { monthly_invoices_table } from "@/constants/Table";
import { supabase } from "@/lib/supabase";
import type { Invoice } from "@/types/Row";
import { useAtom } from "jotai";
import { useCallback, useState } from "react";
import { type InvoiceWithBalance, activeInvoiceAtom, invoicesAtom } from "../state/invoice.state";

export const useInvoice = () => {
  const [invoices, setInvoices] = useAtom(invoicesAtom);
  const [invoice] = useAtom(activeInvoiceAtom);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchActiveInvoiceByCoupleId = useCallback(async (coupleId: Invoice["couple_id"]) => {
    try {
      const { data, error } = await supabase
        .from(monthly_invoices_table)
        .select("*")
        .eq("couple_id", coupleId)
        .eq("active", true)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error fetching active invoice:", error);
      return undefined;
    }
  }, []);

  const fetchInvoicesWithBalancesByCoupleId = useCallback(
    async (id: Invoice["couple_id"]) => {
      setIsRefreshing(true);
      try {
        const session = await supabase.auth.getSession();
        const uid = session?.data.session?.user?.id;
        if (!uid) throw new Error("User ID not found. Please ensure you're authenticated.");

        const isProduction = process.env.EXPO_PUBLIC_APP_ENV === "production";
        const query = isProduction
          ? `
          id,
          month,
          year,
          is_paid,
          created_at,
          updated_at,
          active,
          couple_id,
          payments (
            amount,
            owner_id
          )`
          : `
          id,
          month,
          year,
          is_paid,
          created_at,
          updated_at,
          active,
          couple_id,
          dev_payments (
            amount,
            owner_id
          )`;

        const { data, error } = await supabase.from(monthly_invoices_table).select(query).eq("couple_id", id);

        if (error) throw error;
        if (!data) return null;

        type InvoiceForDev = {
          id: number;
          month: number;
          year: number;
          is_paid: boolean;
          created_at: string;
          updated_at: string;
          active: boolean;
          couple_id: number;
          dev_payments: { amount: number; owner_id: string }[];
        };

        type InvoiceForProd = {
          id: number;
          month: number;
          year: number;
          is_paid: boolean;
          created_at: string;
          updated_at: string;
          active: boolean;
          couple_id: number;
          payments: { amount: number; owner_id: string }[];
        };

        const calculateBalance = (payments: { amount: number; owner_id: string }[]) =>
          payments.reduce((acc, cur) => acc + (cur.owner_id === uid ? cur.amount : -cur.amount), 0);

        const invoicesWithTotals: InvoiceWithBalance[] = data.map((invoice) => {
          // Use a type predicate to check the structure
          const hasPayments = "payments" in invoice;

          if (hasPayments) {
            // Production environment
            const invoice_prod = invoice as {
              payments: { amount: number; owner_id: string }[];
              id: number;
              month: number;
              year: number;
              is_paid: boolean;
              created_at: string;
              updated_at: string;
              active: boolean;
              couple_id: number;
            };
            const { payments, ...rest } = invoice_prod;
            const balance = calculateBalance(payments);
            return { ...rest, balance };
          } else {
            // Development environment
            const invoice_dev = invoice as {
              dev_payments: { amount: number; owner_id: string }[];
              id: number;
              month: number;
              year: number;
              is_paid: boolean;
              created_at: string;
              updated_at: string;
              active: boolean;
              couple_id: number;
            };
            const { dev_payments, ...rest } = invoice_dev;
            const balance = calculateBalance(dev_payments);
            return { ...rest, balance };
          }
        });
        setInvoices(invoicesWithTotals);
        return invoicesWithTotals;
      } catch (error) {
        console.error("Error fetching invoices with balances:", error);
        return null;
      } finally {
        setIsRefreshing(false);
      }
    },
    [setInvoices],
  );

  const fetchMonthlyInvoiceIdByCoupleId = useCallback(async (coupleId: Invoice["couple_id"]) => {
    try {
      const { data, error } = await supabase
        .from(monthly_invoices_table)
        .select("id")
        .eq("couple_id", coupleId)
        .eq("active", true)
        .single();

      if (error) throw error;

      return data?.id;
    } catch (error) {
      console.error("Error fetching monthly invoice ID:", error);
      return undefined;
    }
  }, []);

  const initInvoice = async (couple_id: Invoice["couple_id"]) => {
    if (!invoice) return;
    try {
      const { error } = await supabase.from(monthly_invoices_table).insert([
        {
          couple_id,
          is_paid: false,
          active: true,
          month: invoice?.month === 12 ? 1 : invoice?.month + 1,
          year: invoice?.month === 12 ? invoice?.year + 1 : invoice?.year,
        },
      ]);
      if (error) throw error;
    } catch (error) {
      console.error("Error adding invoice:", error);
    }
  };

  const unActiveInvoicesAll = async (couple_id: Invoice["couple_id"]) => {
    try {
      const { error } = await supabase
        .from(monthly_invoices_table)
        .update({ active: false })
        .eq("couple_id", couple_id);
      if (error) throw error;
    } catch (error) {
      console.error("Error deactivating invoices:", error);
    }
  };

  const turnInvoicePaid = async (invoice_id: Invoice["id"]) => {
    try {
      const { error } = await supabase.from(monthly_invoices_table).update({ is_paid: true }).eq("id", invoice_id);
      if (error) throw error;
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
    }
  };

  return {
    invoices,
    isRefreshing,
    initInvoice,
    fetchActiveInvoiceByCoupleId,
    unActiveInvoicesAll,
    turnInvoicePaid,
    fetchInvoicesWithBalancesByCoupleId,
    fetchMonthlyInvoiceIdByCoupleId,
  };
};
