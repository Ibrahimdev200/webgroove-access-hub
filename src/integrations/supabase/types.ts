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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      account_recovery_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          reason: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          reason?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          reason?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_announcements: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          message: string
          priority: number
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          message: string
          priority?: number
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          message?: string
          priority?: number
          title?: string
        }
        Relationships: []
      }
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          target_user_id: string | null
          target_wallet_id: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_user_id?: string | null
          target_wallet_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_user_id?: string | null
          target_wallet_id?: string | null
        }
        Relationships: []
      }
      marketplace_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          display_order: number
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      marketplace_products: {
        Row: {
          base_price_usd: number
          cash_price: number | null
          category_id: string
          created_at: string
          description: string | null
          features: string[] | null
          id: string
          image_url: string | null
          name: string
          rating: number | null
          review_count: number | null
          slug: string
          status: Database["public"]["Enums"]["product_status"]
          tau_price: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          base_price_usd: number
          cash_price?: number | null
          category_id: string
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          name: string
          rating?: number | null
          review_count?: number | null
          slug: string
          status?: Database["public"]["Enums"]["product_status"]
          tau_price: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          base_price_usd?: number
          cash_price?: number | null
          category_id?: string
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          name?: string
          rating?: number | null
          review_count?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["product_status"]
          tau_price?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "marketplace_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_paid: number
          created_at: string
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          product_id: string
          status: Database["public"]["Enums"]["order_status"]
          tau_amount: number | null
          user_id: string
        }
        Insert: {
          amount_paid: number
          created_at?: string
          id?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          product_id: string
          status?: Database["public"]["Enums"]["order_status"]
          tau_amount?: number | null
          user_id: string
        }
        Update: {
          amount_paid?: number
          created_at?: string
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          product_id?: string
          status?: Database["public"]["Enums"]["order_status"]
          tau_amount?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          blocked_at: string | null
          blocked_reason: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          is_blocked: boolean
          security_phrase: string | null
          security_phrase_hash: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          blocked_at?: string | null
          blocked_reason?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id?: string
          is_blocked?: boolean
          security_phrase?: string | null
          security_phrase_hash?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          blocked_at?: string | null
          blocked_reason?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          is_blocked?: boolean
          security_phrase?: string | null
          security_phrase_hash?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_questions: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          question: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          question: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          question?: string
        }
        Relationships: []
      }
      tau_transactions: {
        Row: {
          amount: number
          balance_after: number
          counterparty_wallet_id: string | null
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          wallet_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          counterparty_wallet_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          wallet_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          counterparty_wallet_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type?: Database["public"]["Enums"]["transaction_type"]
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tau_transactions_counterparty_wallet_id_fkey"
            columns: ["counterparty_wallet_id"]
            isOneToOne: false
            referencedRelation: "tau_wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tau_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "tau_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      tau_wallets: {
        Row: {
          balance: number
          created_at: string
          daily_transfer_limit: number
          frozen_at: string | null
          frozen_reason: string | null
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
          wallet_address: string
        }
        Insert: {
          balance?: number
          created_at?: string
          daily_transfer_limit?: number
          frozen_at?: string | null
          frozen_reason?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
          wallet_address: string
        }
        Update: {
          balance?: number
          created_at?: string
          daily_transfer_limit?: number
          frozen_at?: string | null
          frozen_reason?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
      transfer_otps: {
        Row: {
          amount: number
          attempts: number
          code: string
          created_at: string
          expires_at: string
          id: string
          purpose: string | null
          recipient_wallet_address: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          attempts?: number
          code: string
          created_at?: string
          expires_at: string
          id?: string
          purpose?: string | null
          recipient_wallet_address: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          attempts?: number
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          purpose?: string | null
          recipient_wallet_address?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_notification_reads: {
        Row: {
          announcement_id: string
          id: string
          read_at: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          id?: string
          read_at?: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "admin_announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_security_answers: {
        Row: {
          answer_hash: string
          created_at: string
          id: string
          question_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answer_hash: string
          created_at?: string
          id?: string
          question_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answer_hash?: string
          created_at?: string
          id?: string
          question_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_security_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "security_questions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_security_phrase: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "standard" | "developer" | "creator" | "vendor" | "admin"
      order_status: "pending" | "completed" | "refunded" | "cancelled"
      payment_method: "tau" | "card"
      product_status: "draft" | "pending" | "active" | "inactive"
      transaction_status: "pending" | "completed" | "failed" | "cancelled"
      transaction_type:
        | "purchase"
        | "transfer_in"
        | "transfer_out"
        | "earning"
        | "refund"
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
      app_role: ["standard", "developer", "creator", "vendor", "admin"],
      order_status: ["pending", "completed", "refunded", "cancelled"],
      payment_method: ["tau", "card"],
      product_status: ["draft", "pending", "active", "inactive"],
      transaction_status: ["pending", "completed", "failed", "cancelled"],
      transaction_type: [
        "purchase",
        "transfer_in",
        "transfer_out",
        "earning",
        "refund",
      ],
    },
  },
} as const
