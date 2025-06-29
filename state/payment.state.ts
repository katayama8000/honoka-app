import { atom } from "jotai";
import type { Payment } from "@/types/Row";

export const paymentsAtom = atom<Payment[]>([]);
