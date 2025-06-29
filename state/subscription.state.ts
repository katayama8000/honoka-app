import { atom } from "jotai";
import type { Subscription } from "@/types/Row";

export const subscriptionsAtom = atom<Subscription[]>([]);
