import { atom } from "jotai";
import type { Couple } from "@/types/Row";

export const coupleIdAtom = atom<Couple["id"] | null>(null);
