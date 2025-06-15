import "react-native-url-polyfill/auto";
import type { Database } from "@/types/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const supabaseUrl = "https://jqovxmsueffhddmyqcew.supabase.co";
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseKey) {
  alert("Missing Supabase Key");
  throw new Error("Missing Supabase Key");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
