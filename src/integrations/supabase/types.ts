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
      badges: {
        Row: {
          badge_type: Database["public"]["Enums"]["badge_type"]
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          tasks_threshold: number | null
          tau_threshold: number | null
        }
        Insert: {
          badge_type?: Database["public"]["Enums"]["badge_type"]
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          tasks_threshold?: number | null
          tau_threshold?: number | null
        }
        Update: {
          badge_type?: Database["public"]["Enums"]["badge_type"]
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          tasks_threshold?: number | null
          tau_threshold?: number | null
        }
        Relationships: []
      }
      build_era_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      build_phases: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          id: string
          is_active: boolean
          is_locked: boolean
          name: string
          phase_number: number
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean
          is_locked?: boolean
          name: string
          phase_number: number
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean
          is_locked?: boolean
          name?: string
          phase_number?: number
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      build_tasks: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          end_date: string
          id: string
          is_system_task: boolean
          max_completions_per_user: number | null
          max_total_completions: number | null
          phase_id: string | null
          requires_approval: boolean
          start_date: string
          status: Database["public"]["Enums"]["build_task_status"]
          task_type: Database["public"]["Enums"]["build_task_type"]
          tau_reward: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          end_date: string
          id?: string
          is_system_task?: boolean
          max_completions_per_user?: number | null
          max_total_completions?: number | null
          phase_id?: string | null
          requires_approval?: boolean
          start_date: string
          status?: Database["public"]["Enums"]["build_task_status"]
          task_type: Database["public"]["Enums"]["build_task_type"]
          tau_reward: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          end_date?: string
          id?: string
          is_system_task?: boolean
          max_completions_per_user?: number | null
          max_total_completions?: number | null
          phase_id?: string | null
          requires_approval?: boolean
          start_date?: string
          status?: Database["public"]["Enums"]["build_task_status"]
          task_type?: Database["public"]["Enums"]["build_task_type"]
          tau_reward?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "build_tasks_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "build_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_logins: {
        Row: {
          created_at: string
          id: string
          login_date: string
          tau_awarded: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          login_date?: string
          tau_awarded?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          login_date?: string
          tau_awarded?: number
          user_id?: string
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
      pending_transfers: {
        Row: {
          accepted_at: string | null
          amount: number
          cancelled_at: string | null
          created_at: string
          expires_at: string
          id: string
          purpose: string | null
          recipient_user_id: string
          recipient_wallet_id: string
          sender_user_id: string
          sender_wallet_id: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          amount: number
          cancelled_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          purpose?: string | null
          recipient_user_id: string
          recipient_wallet_id: string
          sender_user_id: string
          sender_wallet_id: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          amount?: number
          cancelled_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          purpose?: string | null
          recipient_user_id?: string
          recipient_wallet_id?: string
          sender_user_id?: string
          sender_wallet_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_transfers_recipient_wallet_id_fkey"
            columns: ["recipient_wallet_id"]
            isOneToOne: false
            referencedRelation: "tau_wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_transfers_sender_wallet_id_fkey"
            columns: ["sender_wallet_id"]
            isOneToOne: false
            referencedRelation: "tau_wallets"
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
      referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          max_uses: number | null
          tau_per_referral: number
          user_id: string
          uses_count: number
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          max_uses?: number | null
          tau_per_referral?: number
          user_id: string
          uses_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          max_uses?: number | null
          tau_per_referral?: number
          user_id?: string
          uses_count?: number
        }
        Relationships: []
      }
      referrals: {
        Row: {
          activated_at: string | null
          created_at: string
          id: string
          is_active: boolean
          referral_code_id: string
          referred_id: string
          referrer_id: string
          tau_awarded_to_referrer: number | null
        }
        Insert: {
          activated_at?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          referral_code_id: string
          referred_id: string
          referrer_id: string
          tau_awarded_to_referrer?: number | null
        }
        Update: {
          activated_at?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          referral_code_id?: string
          referred_id?: string
          referrer_id?: string
          tau_awarded_to_referrer?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referral_code_id_fkey"
            columns: ["referral_code_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
            referencedColumns: ["id"]
          },
        ]
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
      task_applications: {
        Row: {
          applicant_id: string
          cover_message: string | null
          created_at: string
          id: string
          status: string
          task_id: string
          updated_at: string
        }
        Insert: {
          applicant_id: string
          cover_message?: string | null
          created_at?: string
          id?: string
          status?: string
          task_id: string
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          cover_message?: string | null
          created_at?: string
          id?: string
          status?: string
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_applications_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_at: string | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          deadline: string | null
          description: string
          id: string
          owner_id: string
          requirements: string | null
          status: Database["public"]["Enums"]["task_status"]
          tau_reward: number
          title: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          description: string
          id?: string
          owner_id: string
          requirements?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          tau_reward: number
          title: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          description?: string
          id?: string
          owner_id?: string
          requirements?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          tau_reward?: number
          title?: string
          updated_at?: string
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
      user_badges: {
        Row: {
          awarded_at: string
          awarded_by: string | null
          badge_id: string
          id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          awarded_by?: string | null
          badge_id: string
          id?: string
          user_id: string
        }
        Update: {
          awarded_at?: string
          awarded_by?: string | null
          badge_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_build_stats: {
        Row: {
          contribution_score: number
          created_at: string
          current_rank: Database["public"]["Enums"]["user_rank"]
          id: string
          last_login_date: string | null
          login_streak: number
          longest_streak: number
          tasks_completed: number
          total_tau_earned: number
          updated_at: string
          user_id: string
        }
        Insert: {
          contribution_score?: number
          created_at?: string
          current_rank?: Database["public"]["Enums"]["user_rank"]
          id?: string
          last_login_date?: string | null
          login_streak?: number
          longest_streak?: number
          tasks_completed?: number
          total_tau_earned?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          contribution_score?: number
          created_at?: string
          current_rank?: Database["public"]["Enums"]["user_rank"]
          id?: string
          last_login_date?: string | null
          login_streak?: number
          longest_streak?: number
          tasks_completed?: number
          total_tau_earned?: number
          updated_at?: string
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
      user_task_completions: {
        Row: {
          admin_notes: string | null
          completed_at: string
          completion_date: string
          id: string
          status: string
          task_id: string
          tau_awarded: number
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          completed_at?: string
          completion_date?: string
          id?: string
          status?: string
          task_id: string
          tau_awarded: number
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          completed_at?: string
          completion_date?: string
          id?: string
          status?: string
          task_id?: string
          tau_awarded?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_task_completions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "build_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_daily_login: { Args: never; Returns: Json }
      execute_transfer: {
        Args: {
          p_amount: number
          p_description: string
          p_recipient_wallet_id: string
          p_reference_id: string
          p_sender_wallet_id: string
        }
        Returns: Json
      }
      generate_referral_code: { Args: never; Returns: string }
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
      badge_type: "auto" | "admin_approved"
      build_task_status:
        | "draft"
        | "scheduled"
        | "active"
        | "inactive"
        | "expired"
      build_task_type: "daily" | "weekly" | "seasonal" | "special"
      order_status: "pending" | "completed" | "refunded" | "cancelled"
      payment_method: "tau" | "card"
      product_status: "draft" | "pending" | "active" | "inactive"
      task_status:
        | "open"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "disputed"
      transaction_status: "pending" | "completed" | "failed" | "cancelled"
      transaction_type:
        | "purchase"
        | "transfer_in"
        | "transfer_out"
        | "earning"
        | "refund"
      user_rank:
        | "explorer"
        | "builder"
        | "architect"
        | "pioneer"
        | "founder_circle"
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
      badge_type: ["auto", "admin_approved"],
      build_task_status: [
        "draft",
        "scheduled",
        "active",
        "inactive",
        "expired",
      ],
      build_task_type: ["daily", "weekly", "seasonal", "special"],
      order_status: ["pending", "completed", "refunded", "cancelled"],
      payment_method: ["tau", "card"],
      product_status: ["draft", "pending", "active", "inactive"],
      task_status: [
        "open",
        "in_progress",
        "completed",
        "cancelled",
        "disputed",
      ],
      transaction_status: ["pending", "completed", "failed", "cancelled"],
      transaction_type: [
        "purchase",
        "transfer_in",
        "transfer_out",
        "earning",
        "refund",
      ],
      user_rank: [
        "explorer",
        "builder",
        "architect",
        "pioneer",
        "founder_circle",
      ],
    },
  },
} as const
