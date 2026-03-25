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
      buyer_favourites: {
        Row: {
          buyer_id: string
          created_at: string
          property_id: number
        }
        Insert: {
          buyer_id: string
          created_at?: string
          property_id: number
        }
        Update: {
          buyer_id?: string
          created_at?: string
          property_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "buyer_favourites_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_favourites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_profiles: {
        Row: {
          budget: number | null
          family_size: number | null
          id: string
          preferred_locations: string[] | null
          preferred_num_bedrooms: number | null
          preferred_property_types: string[] | null
        }
        Insert: {
          budget?: number | null
          family_size?: number | null
          id: string
          preferred_locations?: string[] | null
          preferred_num_bedrooms?: number | null
          preferred_property_types?: string[] | null
        }
        Update: {
          budget?: number | null
          family_size?: number | null
          id?: string
          preferred_locations?: string[] | null
          preferred_num_bedrooms?: number | null
          preferred_property_types?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "buyers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      estate_agencies: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string | null
        }
        Relationships: []
      }
      estate_agency_location: {
        Row: {
          address_line_1: string | null
          address_line_2: string | null
          city: string | null
          email_address: string | null
          estate_agency_id: string | null
          location_id: string
          phone_number: string | null
          post_code: string | null
        }
        Insert: {
          address_line_1?: string | null
          address_line_2?: string | null
          city?: string | null
          email_address?: string | null
          estate_agency_id?: string | null
          location_id?: string
          phone_number?: string | null
          post_code?: string | null
        }
        Update: {
          address_line_1?: string | null
          address_line_2?: string | null
          city?: string | null
          email_address?: string | null
          estate_agency_id?: string | null
          location_id?: string
          phone_number?: string | null
          post_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estate_agency_location_estate_agency_id_fkey"
            columns: ["estate_agency_id"]
            isOneToOne: false
            referencedRelation: "estate_agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      estate_agent_profiles: {
        Row: {
          created_at: string
          estate_agency_location_id: string | null
          id: string
        }
        Insert: {
          created_at?: string
          estate_agency_location_id?: string | null
          id: string
        }
        Update: {
          created_at?: string
          estate_agency_location_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estate_agent_profiles_estate_agency_location_id_fkey"
            columns: ["estate_agency_location_id"]
            isOneToOne: false
            referencedRelation: "estate_agency_location"
            referencedColumns: ["location_id"]
          },
          {
            foreignKeyName: "estate_agent_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          added_at: string
          address_line_1: string
          address_line_2: string | null
          agency_location_id: string | null
          agent_id: string | null
          city: string
          council_tax_band: string | null
          description: string
          epc_rating: string | null
          features: string[] | null
          has_garage: boolean | null
          id: number
          image_url: string | null
          is_new_build: boolean
          last_updated_at: string | null
          num_bathrooms: number | null
          num_bedrooms: number | null
          post_code: string
          price: number
          price_type: string | null
          property_type: string | null
          seller_id: string | null
          square_feet: number | null
          status: string
          title: string
        }
        Insert: {
          added_at?: string
          address_line_1: string
          address_line_2?: string | null
          agency_location_id?: string | null
          agent_id?: string | null
          city: string
          council_tax_band?: string | null
          description: string
          epc_rating?: string | null
          features?: string[] | null
          has_garage?: boolean | null
          id?: number
          image_url?: string | null
          is_new_build?: boolean
          last_updated_at?: string | null
          num_bathrooms?: number | null
          num_bedrooms?: number | null
          post_code: string
          price: number
          price_type?: string | null
          property_type?: string | null
          seller_id?: string | null
          square_feet?: number | null
          status?: string
          title: string
        }
        Update: {
          added_at?: string
          address_line_1?: string
          address_line_2?: string | null
          agency_location_id?: string | null
          agent_id?: string | null
          city?: string
          council_tax_band?: string | null
          description?: string
          epc_rating?: string | null
          features?: string[] | null
          has_garage?: boolean | null
          id?: number
          image_url?: string | null
          is_new_build?: boolean
          last_updated_at?: string | null
          num_bathrooms?: number | null
          num_bedrooms?: number | null
          post_code?: string
          price?: number
          price_type?: string | null
          property_type?: string | null
          seller_id?: string | null
          square_feet?: number | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_agency_location_id_fkey"
            columns: ["agency_location_id"]
            isOneToOne: false
            referencedRelation: "estate_agency_location"
            referencedColumns: ["location_id"]
          },
          {
            foreignKeyName: "properties_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "estate_agent_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      property_seller_info: {
        Row: {
          created_at: string
          id: number
          reason_for_selling: string | null
          seller_description: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          reason_for_selling?: string | null
          seller_description?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          reason_for_selling?: string | null
          seller_description?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_seller_info_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string
          granted_by: string
          role: string | null
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by: string
          role?: string | null
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          onboarded: boolean | null
          user_goals: string[] | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          onboarded?: boolean | null
          user_goals?: string[] | null
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          onboarded?: boolean | null
          user_goals?: string[] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user: { Args: never; Returns: undefined }
      does_property_belong_to_seller: {
        Args: { p_id: number }
        Returns: boolean
      }
      fetch_agents_by_location_id: {
        Args: { p_agency_id: string }
        Returns: {
          first_name: string
          id: string
          last_name: string
        }[]
      }
      fetchagentdetailsbyagencyid: {
        Args: { p_agency_id: string }
        Returns: {
          first_name: string
          id: string
          last_name: string
        }[]
      }
      get_users_granted_by_agent: {
        Args: never
        Returns: {
          email: string
          first_name: string
          id: string
          last_name: string
        }[]
      }
      getagencylocationdetails: {
        Args: { p_id: string }
        Returns: {
          address_line_1: string
          address_line_2: string
          city: string
          email: string
          logo_url: string
          name: string
          phone_number: string
          post_code: string
        }[]
      }
      is_current_user_admin: { Args: never; Returns: boolean }
      is_current_user_agent: { Args: never; Returns: boolean }
      is_current_user_seller: { Args: never; Returns: boolean }
      is_seller_by_email: { Args: { p_email: string }; Returns: boolean }
      is_user_admin: { Args: { p_id: string }; Returns: boolean }
      is_user_estate_agent: { Args: { p_id: string }; Returns: boolean }
      update_buyer_profile: {
        Args: {
          p_budget: number
          p_family_size: number
          p_id: string
          p_preferred_locations: string[]
          p_preferred_num_bedrooms: number
          p_preferred_property_types: string[]
        }
        Returns: undefined
      }
      upgrade_user_to_agent: {
        Args: { p_admin_id: string; p_location_id: string; p_user_id: string }
        Returns: undefined
      }
      upgrade_user_to_seller: {
        Args: { p_agent_id: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
