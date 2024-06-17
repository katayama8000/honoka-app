export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      dev_couples: {
        Row: {
          created_at: string;
          id: number;
          user1_id: string;
          user2_id: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          user1_id: string;
          user2_id: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          user1_id?: string;
          user2_id?: string;
        };
        Relationships: [];
      };
      dev_monthly_invoices: {
        Row: {
          active: boolean;
          couple_id: number;
          created_at: string;
          id: number;
          is_paid: boolean;
          month: number;
          updated_at: string;
          year: number;
        };
        Insert: {
          active?: boolean;
          couple_id: number;
          created_at?: string;
          id?: number;
          is_paid: boolean;
          month: number;
          updated_at?: string;
          year: number;
        };
        Update: {
          active?: boolean;
          couple_id?: number;
          created_at?: string;
          id?: number;
          is_paid?: boolean;
          month?: number;
          updated_at?: string;
          year?: number;
        };
        Relationships: [
          {
            foreignKeyName: "dev_monthly_invoices_couple_id_fkey";
            columns: ["couple_id"];
            isOneToOne: false;
            referencedRelation: "dev_couples";
            referencedColumns: ["id"];
          },
        ];
      };
      dev_payments: {
        Row: {
          amount: number;
          created_at: string;
          id: number;
          monthly_invoice_id: number;
          name: string;
          updated_at: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          id?: number;
          monthly_invoice_id: number;
          name: string;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          id?: number;
          monthly_invoice_id?: number;
          name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "dev_payments_monthly_invoice_id_fkey";
            columns: ["monthly_invoice_id"];
            isOneToOne: false;
            referencedRelation: "dev_monthly_invoices";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"]) | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    ? (PublicSchema["Tables"] & PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema["Enums"] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;
