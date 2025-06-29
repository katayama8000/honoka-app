import { atom } from "jotai";
import type { User } from "@/types/Row";

export const userAtom = atom<User | null>(null);
