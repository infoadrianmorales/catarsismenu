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
      categories: {
        Row: {
          activo: boolean
          created_at: string | null
          descripcion: string | null
          icono: string
          id: string
          nombre: string
          orden: number
          slug: string
          type: string
          updated_at: string | null
        }
        Insert: {
          activo?: boolean
          created_at?: string | null
          descripcion?: string | null
          icono?: string
          id?: string
          nombre: string
          orden?: number
          slug: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          activo?: boolean
          created_at?: string | null
          descripcion?: string | null
          icono?: string
          id?: string
          nombre?: string
          orden?: number
          slug?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      config: {
        Row: {
          id: string
          is_public: boolean | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: string
        }
        Insert: {
          id?: string
          is_public?: boolean | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: string
        }
        Update: {
          id?: string
          is_public?: boolean | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          phone: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          activo: boolean
          created_at: string
          id: string
          image_url: string
          orden: number
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          id?: string
          image_url: string
          orden?: number
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          id?: string
          image_url?: string
          orden?: number
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          extras_snapshot: Json | null
          id: string
          line_total: number
          order_id: string
          product_id: string
          product_name_snapshot: string
          quantity: number
          unit_price_snapshot: number
        }
        Insert: {
          created_at?: string
          extras_snapshot?: Json | null
          id?: string
          line_total: number
          order_id: string
          product_id: string
          product_name_snapshot: string
          quantity?: number
          unit_price_snapshot: number
        }
        Update: {
          created_at?: string
          extras_snapshot?: Json | null
          id?: string
          line_total?: number
          order_id?: string
          product_id?: string
          product_name_snapshot?: string
          quantity?: number
          unit_price_snapshot?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          currency_mode: string
          customer_id: string | null
          delivery_address: string | null
          delivery_maps_url: string | null
          delivery_type: string | null
          email: string
          exchange_rate: number | null
          first_name: string
          id: string
          last_name: string
          notes: string | null
          order_number: string | null
          payment_confirmed_at: string | null
          payment_currency: string
          payment_instructions_snapshot: string | null
          payment_method: string
          payment_reference: string | null
          phone: string
          session_id: string | null
          status: string
          subtotal: number
          total: number
          updated_at: string | null
          whatsapp_message: string
        }
        Insert: {
          created_at?: string
          currency_mode?: string
          customer_id?: string | null
          delivery_address?: string | null
          delivery_maps_url?: string | null
          delivery_type?: string | null
          email: string
          exchange_rate?: number | null
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          order_number?: string | null
          payment_confirmed_at?: string | null
          payment_currency?: string
          payment_instructions_snapshot?: string | null
          payment_method: string
          payment_reference?: string | null
          phone: string
          session_id?: string | null
          status?: string
          subtotal: number
          total: number
          updated_at?: string | null
          whatsapp_message: string
        }
        Update: {
          created_at?: string
          currency_mode?: string
          customer_id?: string | null
          delivery_address?: string | null
          delivery_maps_url?: string | null
          delivery_type?: string | null
          email?: string
          exchange_rate?: number | null
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          order_number?: string | null
          payment_confirmed_at?: string | null
          payment_currency?: string
          payment_instructions_snapshot?: string | null
          payment_method?: string
          payment_reference?: string | null
          phone?: string
          session_id?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string | null
          whatsapp_message?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          path: string
          referrer: string | null
          session_id: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          path: string
          referrer?: string | null
          session_id: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          path?: string
          referrer?: string | null
          session_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          created_at: string
          display_order: number
          enabled: boolean
          id: string
          instructions_usd: string | null
          instructions_ves: string | null
          label: string
          supports_usd: boolean
          supports_ves: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          enabled?: boolean
          id: string
          instructions_usd?: string | null
          instructions_ves?: string | null
          label: string
          supports_usd?: boolean
          supports_ves?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          enabled?: boolean
          id?: string
          instructions_usd?: string | null
          instructions_ves?: string | null
          label?: string
          supports_usd?: boolean
          supports_ves?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      pending_checkouts: {
        Row: {
          cart_items: Json
          created_at: string
          customer_email: string | null
          customer_first_name: string | null
          customer_last_name: string | null
          customer_phone: string | null
          expires_at: string | null
          id: string
          session_id: string
          updated_at: string
        }
        Insert: {
          cart_items: Json
          created_at?: string
          customer_email?: string | null
          customer_first_name?: string | null
          customer_last_name?: string | null
          customer_phone?: string | null
          expires_at?: string | null
          id?: string
          session_id: string
          updated_at?: string
        }
        Update: {
          cart_items?: Json
          created_at?: string
          customer_email?: string | null
          customer_first_name?: string | null
          customer_last_name?: string | null
          customer_phone?: string | null
          expires_at?: string | null
          id?: string
          session_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_extras: {
        Row: {
          activo: boolean
          categoria: Database["public"]["Enums"]["product_category"]
          created_at: string
          id: string
          nombre: string
          orden: number
          precio_usd: number
          product_id: string | null
          updated_at: string
        }
        Insert: {
          activo?: boolean
          categoria: Database["public"]["Enums"]["product_category"]
          created_at?: string
          id?: string
          nombre: string
          orden?: number
          precio_usd?: number
          product_id?: string | null
          updated_at?: string
        }
        Update: {
          activo?: boolean
          categoria?: Database["public"]["Enums"]["product_category"]
          created_at?: string
          id?: string
          nombre?: string
          orden?: number
          precio_usd?: number
          product_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_extras_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "best_sellers_food"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_extras_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          activo: boolean | null
          categoria: Database["public"]["Enums"]["product_category"]
          created_at: string | null
          descripcion_corta: string | null
          destacado: boolean | null
          id: string
          imagen_url: string | null
          is_orderable: boolean | null
          nombre: string
          orden: number | null
          precio_usd: number
          slug: string
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          categoria: Database["public"]["Enums"]["product_category"]
          created_at?: string | null
          descripcion_corta?: string | null
          destacado?: boolean | null
          id?: string
          imagen_url?: string | null
          is_orderable?: boolean | null
          nombre: string
          orden?: number | null
          precio_usd: number
          slug: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          categoria?: Database["public"]["Enums"]["product_category"]
          created_at?: string | null
          descripcion_corta?: string | null
          destacado?: boolean | null
          id?: string
          imagen_url?: string | null
          is_orderable?: boolean | null
          nombre?: string
          orden?: number | null
          precio_usd?: number
          slug?: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          activo: boolean | null
          created_at: string | null
          descripcion: string | null
          id: string
          imagen_url: string | null
          orden: number | null
          subtitulo: string | null
          titulo: string
          updated_at: string | null
          vigencia_fin: string | null
          vigencia_inicio: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          imagen_url?: string | null
          orden?: number | null
          subtitulo?: string | null
          titulo: string
          updated_at?: string | null
          vigencia_fin?: string | null
          vigencia_inicio?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          imagen_url?: string | null
          orden?: number | null
          subtitulo?: string | null
          titulo?: string
          updated_at?: string | null
          vigencia_fin?: string | null
          vigencia_inicio?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          identifier: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          identifier: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          identifier?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      best_sellers_food: {
        Row: {
          activo: boolean | null
          categoria: Database["public"]["Enums"]["product_category"] | null
          descripcion_corta: string | null
          destacado: boolean | null
          id: string | null
          imagen_url: string | null
          is_orderable: boolean | null
          nombre: string | null
          orden: number | null
          precio_usd: number | null
          slug: string | null
          tags: string[] | null
          total_sold: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      auto_cancel_stale_orders: { Args: never; Returns: number }
      check_rate_limit: {
        Args: {
          p_action: string
          p_identifier: string
          p_max_attempts: number
          p_window_minutes: number
        }
        Returns: boolean
      }
      cleanup_rate_limits: { Args: never; Returns: undefined }
      create_order_and_return_number:
        | {
            Args: {
              p_currency_mode: string
              p_customer_id: string
              p_delivery_address: string
              p_delivery_maps_url: string
              p_delivery_type: string
              p_email: string
              p_exchange_rate: number
              p_first_name: string
              p_id: string
              p_last_name: string
              p_notes: string
              p_payment_currency: string
              p_payment_method: string
              p_phone: string
              p_subtotal: number
              p_total: number
            }
            Returns: string
          }
        | {
            Args: {
              p_currency_mode: string
              p_customer_id: string
              p_delivery_address: string
              p_delivery_maps_url: string
              p_delivery_type: string
              p_email: string
              p_exchange_rate: number
              p_first_name: string
              p_id: string
              p_last_name: string
              p_notes: string
              p_payment_currency: string
              p_payment_method: string
              p_phone: string
              p_session_id?: string
              p_subtotal: number
              p_total: number
            }
            Returns: string
          }
        | {
            Args: {
              p_currency_mode: string
              p_customer_id: string
              p_delivery_address: string
              p_delivery_maps_url: string
              p_delivery_type: string
              p_email: string
              p_exchange_rate: number
              p_first_name: string
              p_id: string
              p_last_name: string
              p_notes: string
              p_payment_currency: string
              p_payment_method: string
              p_phone: string
              p_session_id?: string
              p_subtotal: number
              p_total: number
              p_whatsapp_message?: string
            }
            Returns: string
          }
      find_or_create_customer: {
        Args: {
          p_email: string
          p_first_name: string
          p_last_name: string
          p_phone: string
        }
        Returns: string
      }
      get_active_payment_methods: {
        Args: never
        Returns: {
          display_order: number
          enabled: boolean
          id: string
          instructions_usd: string
          instructions_ves: string
          label: string
          supports_usd: boolean
          supports_ves: boolean
        }[]
      }
      get_client_session_id: { Args: never; Returns: string }
      get_page_views_summary: {
        Args: { p_end: string; p_granularity?: string; p_start: string }
        Returns: {
          period: string
          unique_visitors: number
          views: number
        }[]
      }
      get_page_views_totals: {
        Args: { p_end: string; p_start: string }
        Returns: {
          total_views: number
          unique_visitors: number
        }[]
      }
      get_popular_pages: {
        Args: { p_end: string; p_limit?: number; p_start: string }
        Returns: {
          path: string
          views: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      update_order_whatsapp_message: {
        Args: { p_message: string; p_order_id: string; p_session_id: string }
        Returns: Json
      }
      validate_order_exists: { Args: { p_order_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "editor"
      product_category:
        | "hamburguesas"
        | "pizzas"
        | "alitas"
        | "bebidas"
        | "postres"
        | "acompanantes"
        | "cocktails"
        | "entradas"
        | "ensaladas"
        | "emparedados"
        | "parrilla"
        | "cocteleria"
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
      app_role: ["admin", "editor"],
      product_category: [
        "hamburguesas",
        "pizzas",
        "alitas",
        "bebidas",
        "postres",
        "acompanantes",
        "cocktails",
        "entradas",
        "ensaladas",
        "emparedados",
        "parrilla",
        "cocteleria",
      ],
    },
  },
} as const
