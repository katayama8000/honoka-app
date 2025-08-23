export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      couple_subscriptions: {
        Row: {
          billing_cycle: Database["public"]["Enums"]["billing_cycle_type"]
          couple_id: number
          created_at: string
          id: number
          is_active: boolean
          monthly_amount: number
          next_billing_date: string
          service_name: string
          user_id: string
        }
        Insert: {
          billing_cycle: Database["public"]["Enums"]["billing_cycle_type"]
          couple_id: number
          created_at?: string
          id?: number
          is_active?: boolean
          monthly_amount: number
          next_billing_date: string
          service_name: string
          user_id: string
        }
        Update: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle_type"]
          couple_id?: number
          created_at?: string
          id?: number
          is_active?: boolean
          monthly_amount?: number
          next_billing_date?: string
          service_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_subscriptions_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      couples: {
        Row: {
          created_at: string
          id: number
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string
          id?: number
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "couples_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "couples_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      dev_couple_subscriptions: {
        Row: {
          billing_cycle: Database["public"]["Enums"]["billing_cycle_type"]
          couple_id: number
          created_at: string
          id: number
          is_active: boolean
          monthly_amount: number
          next_billing_date: string
          service_name: string
          user_id: string
        }
        Insert: {
          billing_cycle: Database["public"]["Enums"]["billing_cycle_type"]
          couple_id: number
          created_at?: string
          id?: number
          is_active?: boolean
          monthly_amount: number
          next_billing_date: string
          service_name: string
          user_id: string
        }
        Update: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle_type"]
          couple_id?: number
          created_at?: string
          id?: number
          is_active?: boolean
          monthly_amount?: number
          next_billing_date?: string
          service_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dev_couple_subscriptions_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "dev_couples"
            referencedColumns: ["id"]
          },
        ]
      }
      dev_couples: {
        Row: {
          created_at: string
          id: number
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string
          id?: number
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dev_couples_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "dev_users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "dev_couples_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "dev_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      dev_monthly_invoices: {
        Row: {
          active: boolean
          couple_id: number
          created_at: string
          id: number
          is_paid: boolean
          month: number
          updated_at: string
          year: number
        }
        Insert: {
          active?: boolean
          couple_id: number
          created_at?: string
          id?: number
          is_paid: boolean
          month: number
          updated_at?: string
          year: number
        }
        Update: {
          active?: boolean
          couple_id?: number
          created_at?: string
          id?: number
          is_paid?: boolean
          month?: number
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "dev_monthly_invoices_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "dev_couples"
            referencedColumns: ["id"]
          },
        ]
      }
      dev_payments: {
        Row: {
          amount: number
          created_at: string
          deleted_at: string | null
          id: number
          item: string
          memo: string | null
          monthly_invoice_id: number
          owner_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          deleted_at?: string | null
          id?: number
          item: string
          memo?: string | null
          monthly_invoice_id: number
          owner_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          deleted_at?: string | null
          id?: number
          item?: string
          memo?: string | null
          monthly_invoice_id?: number
          owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dev_payments_monthly_invoice_id_fkey"
            columns: ["monthly_invoice_id"]
            isOneToOne: false
            referencedRelation: "dev_monthly_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      dev_users: {
        Row: {
          created_at: string
          expo_push_token: string
          id: number
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expo_push_token: string
          id?: number
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          expo_push_token?: string
          id?: number
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      monthly_invoices: {
        Row: {
          active: boolean
          couple_id: number
          created_at: string
          id: number
          is_paid: boolean
          month: number
          updated_at: string
          year: number
        }
        Insert: {
          active: boolean
          couple_id: number
          created_at?: string
          id?: number
          is_paid: boolean
          month?: number
          updated_at?: string
          year?: number
        }
        Update: {
          active?: boolean
          couple_id?: number
          created_at?: string
          id?: number
          is_paid?: boolean
          month?: number
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_invoices_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          deleted_at: string | null
          id: number
          item: string
          memo: string | null
          monthly_invoice_id: number
          owner_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          deleted_at?: string | null
          id?: number
          item: string
          memo?: string | null
          monthly_invoice_id: number
          owner_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          deleted_at?: string | null
          id?: number
          item?: string
          memo?: string | null
          monthly_invoice_id?: number
          owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_monthly_invoice_id_fkey"
            columns: ["monthly_invoice_id"]
            isOneToOne: false
            referencedRelation: "monthly_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          expo_push_token: string
          id: number
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expo_push_token: string
          id: number
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          expo_push_token?: string
          id?: number
          name?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      "hello-world": {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      billing_cycle_type: "monthly" | "yearly"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      billing_cycle_type: ["monthly", "yearly"],
    },
  },
} as const
