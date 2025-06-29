import { atom } from "jotai";
import type { Invoice } from "@/types/Row";

export type InvoiceWithBalance = Invoice & { balance?: number };
export const invoicesAtom = atom<InvoiceWithBalance[]>([]);

export const activeInvoiceAtom = atom<Invoice | null>(null);
