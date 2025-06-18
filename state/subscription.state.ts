import type { Subscription } from "@/types/Row";
import { atom } from "jotai";

export const subscriptionsAtom = atom<Subscription[]>([]);
