import { couples_table, users_table } from "@/constants/Table";
import { supabase } from "@/lib/supabase";
import type { Couple, User as TUser } from "@/types/Row";

export const useUser = () => {
  const fetchUser = async (user_id: TUser["user_id"]) => {
    const { data, error } = await supabase.from(users_table).select("*").eq("user_id", user_id).single();
    if (error) {
      console.error("error", error);
      return;
    }
    if (!data) {
      console.error("no data");
      return;
    }
    return data;
  };

  const updateExpoPushToken = async (user_id: TUser["user_id"], expoPushToken: string) => {
    const { error } = await supabase
      .from(users_table)
      .update({ expo_push_token: expoPushToken })
      .eq("user_id", user_id);
    if (error) {
      console.error("error", error);
      return;
    }
  };

  const fetchPartner = async (couple_id: Couple["id"], user_id: TUser["user_id"]) => {
    const { data, error } = await supabase.from(couples_table).select("*").eq("id", couple_id).single();
    if (error) {
      console.error("error", error);
      return;
    }
    if (!data) {
      console.error("no data");
      return;
    }
    const partner_id = data.user1_id === user_id ? data.user2_id : data.user1_id;

    const { data: partner, error: partnerError } = await supabase
      .from(users_table)
      .select("*")
      .eq("user_id", partner_id)
      .single();

    if (partnerError) {
      console.error("error", partnerError);
      return;
    }

    if (!partner) {
      console.error("no partner");
      return;
    }

    return partner;
  };

  return { fetchUser, fetchPartner, updateExpoPushToken };
};
