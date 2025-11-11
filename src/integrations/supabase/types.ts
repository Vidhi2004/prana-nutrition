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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      diet_chart_items: {
        Row: {
          diet_chart_id: string
          food_id: string
          id: string
          meal_time: string | null
          meal_type: string
          quantity_grams: number
          sort_order: number | null
          special_instructions: string | null
        }
        Insert: {
          diet_chart_id: string
          food_id: string
          id?: string
          meal_time?: string | null
          meal_type: string
          quantity_grams?: number
          sort_order?: number | null
          special_instructions?: string | null
        }
        Update: {
          diet_chart_id?: string
          food_id?: string
          id?: string
          meal_time?: string | null
          meal_type?: string
          quantity_grams?: number
          sort_order?: number | null
          special_instructions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diet_chart_items_diet_chart_id_fkey"
            columns: ["diet_chart_id"]
            isOneToOne: false
            referencedRelation: "diet_charts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diet_chart_items_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
        ]
      }
      diet_charts: {
        Row: {
          chart_date: string
          created_at: string
          id: string
          notes: string | null
          patient_id: string
          practitioner_id: string
          title: string
          total_calories: number | null
          updated_at: string
        }
        Insert: {
          chart_date?: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_id: string
          practitioner_id: string
          title: string
          total_calories?: number | null
          updated_at?: string
        }
        Update: {
          chart_date?: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string
          practitioner_id?: string
          title?: string
          total_calories?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "diet_charts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diet_charts_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      foods: {
        Row: {
          calcium_mg: number | null
          calories_per_100g: number
          carbs_g: number | null
          category: string
          created_at: string
          cuisine_type: string | null
          description: string | null
          digestibility: Database["public"]["Enums"]["digestibility"]
          fat_g: number | null
          fiber_g: number | null
          id: string
          iron_mg: number | null
          is_active: boolean | null
          name: string
          primary_taste: Database["public"]["Enums"]["rasa_taste"]
          protein_g: number | null
          secondary_tastes: Database["public"]["Enums"]["rasa_taste"][] | null
          temperature: Database["public"]["Enums"]["food_temperature"]
          vitamin_a_mcg: number | null
          vitamin_c_mg: number | null
        }
        Insert: {
          calcium_mg?: number | null
          calories_per_100g?: number
          carbs_g?: number | null
          category: string
          created_at?: string
          cuisine_type?: string | null
          description?: string | null
          digestibility?: Database["public"]["Enums"]["digestibility"]
          fat_g?: number | null
          fiber_g?: number | null
          id?: string
          iron_mg?: number | null
          is_active?: boolean | null
          name: string
          primary_taste: Database["public"]["Enums"]["rasa_taste"]
          protein_g?: number | null
          secondary_tastes?: Database["public"]["Enums"]["rasa_taste"][] | null
          temperature?: Database["public"]["Enums"]["food_temperature"]
          vitamin_a_mcg?: number | null
          vitamin_c_mg?: number | null
        }
        Update: {
          calcium_mg?: number | null
          calories_per_100g?: number
          carbs_g?: number | null
          category?: string
          created_at?: string
          cuisine_type?: string | null
          description?: string | null
          digestibility?: Database["public"]["Enums"]["digestibility"]
          fat_g?: number | null
          fiber_g?: number | null
          id?: string
          iron_mg?: number | null
          is_active?: boolean | null
          name?: string
          primary_taste?: Database["public"]["Enums"]["rasa_taste"]
          protein_g?: number | null
          secondary_tastes?: Database["public"]["Enums"]["rasa_taste"][] | null
          temperature?: Database["public"]["Enums"]["food_temperature"]
          vitamin_a_mcg?: number | null
          vitamin_c_mg?: number | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          age: number
          allergies: string | null
          bowel_movements_per_day: number | null
          contact_number: string | null
          created_at: string
          current_medications: string | null
          dietary_habit: Database["public"]["Enums"]["dietary_habit"]
          email: string | null
          full_name: string
          gender: Database["public"]["Enums"]["patient_gender"]
          height_cm: number | null
          id: string
          meal_frequency: number | null
          medical_history: string | null
          practitioner_id: string
          updated_at: string
          water_intake_liters: number | null
          weight_kg: number | null
        }
        Insert: {
          age: number
          allergies?: string | null
          bowel_movements_per_day?: number | null
          contact_number?: string | null
          created_at?: string
          current_medications?: string | null
          dietary_habit?: Database["public"]["Enums"]["dietary_habit"]
          email?: string | null
          full_name: string
          gender: Database["public"]["Enums"]["patient_gender"]
          height_cm?: number | null
          id?: string
          meal_frequency?: number | null
          medical_history?: string | null
          practitioner_id: string
          updated_at?: string
          water_intake_liters?: number | null
          weight_kg?: number | null
        }
        Update: {
          age?: number
          allergies?: string | null
          bowel_movements_per_day?: number | null
          contact_number?: string | null
          created_at?: string
          current_medications?: string | null
          dietary_habit?: Database["public"]["Enums"]["dietary_habit"]
          email?: string | null
          full_name?: string
          gender?: Database["public"]["Enums"]["patient_gender"]
          height_cm?: number | null
          id?: string
          meal_frequency?: number | null
          medical_history?: string | null
          practitioner_id?: string
          updated_at?: string
          water_intake_liters?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          contact_number: string | null
          created_at: string
          full_name: string
          id: string
          qualification: string | null
          specialization: string | null
          updated_at: string
        }
        Insert: {
          contact_number?: string | null
          created_at?: string
          full_name: string
          id: string
          qualification?: string | null
          specialization?: string | null
          updated_at?: string
        }
        Update: {
          contact_number?: string | null
          created_at?: string
          full_name?: string
          id?: string
          qualification?: string | null
          specialization?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      dietary_habit: "vegetarian" | "non_vegetarian" | "vegan" | "eggetarian"
      digestibility: "easy" | "moderate" | "difficult"
      food_temperature: "hot" | "cold" | "neutral"
      patient_gender: "male" | "female" | "other"
      rasa_taste:
        | "sweet"
        | "sour"
        | "salty"
        | "bitter"
        | "pungent"
        | "astringent"
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
      dietary_habit: ["vegetarian", "non_vegetarian", "vegan", "eggetarian"],
      digestibility: ["easy", "moderate", "difficult"],
      food_temperature: ["hot", "cold", "neutral"],
      patient_gender: ["male", "female", "other"],
      rasa_taste: ["sweet", "sour", "salty", "bitter", "pungent", "astringent"],
    },
  },
} as const
