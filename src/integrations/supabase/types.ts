export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          created_at: string | null
          date: string
          id: string
          measurements: Json | null
          notes: string | null
          patient_id: string | null
          recommendations: string | null
          status: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          measurements?: Json | null
          notes?: string | null
          patient_id?: string | null
          recommendations?: string | null
          status?: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          measurements?: Json | null
          notes?: string | null
          patient_id?: string | null
          recommendations?: string | null
          status?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      calculations: {
        Row: {
          activity_level: string
          age: number
          bmr: number
          carbs: number
          created_at: string | null
          fats: number
          follow_up_date: string | null
          gender: string
          goal: string
          height: number
          id: string
          measurements: Json | null
          notes: string | null
          patient_id: string | null
          protein: number
          tdee: number
          user_id: string | null
          weight: number
        }
        Insert: {
          activity_level: string
          age: number
          bmr: number
          carbs: number
          created_at?: string | null
          fats: number
          follow_up_date?: string | null
          gender: string
          goal: string
          height: number
          id?: string
          measurements?: Json | null
          notes?: string | null
          patient_id?: string | null
          protein: number
          tdee: number
          user_id?: string | null
          weight: number
        }
        Update: {
          activity_level?: string
          age?: number
          bmr?: number
          carbs?: number
          created_at?: string | null
          fats?: number
          follow_up_date?: string | null
          gender?: string
          goal?: string
          height?: number
          id?: string
          measurements?: Json | null
          notes?: string | null
          patient_id?: string | null
          protein?: number
          tdee?: number
          user_id?: string | null
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "calculations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calculations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      food_substitutions: {
        Row: {
          created_at: string | null
          food_id: string | null
          id: string
          nutritional_similarity: Json | null
          reason: string | null
          recommendations: string | null
          substitute_id: string | null
        }
        Insert: {
          created_at?: string | null
          food_id?: string | null
          id?: string
          nutritional_similarity?: Json | null
          reason?: string | null
          recommendations?: string | null
          substitute_id?: string | null
        }
        Update: {
          created_at?: string | null
          food_id?: string | null
          id?: string
          nutritional_similarity?: Json | null
          reason?: string | null
          recommendations?: string | null
          substitute_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_substitutions_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_substitutions_substitute_id_fkey"
            columns: ["substitute_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
        ]
      }
      foods: {
        Row: {
          calories: number
          carbs: number
          category: string
          created_at: string | null
          fats: number
          food_group: string
          id: string
          meal_time: string[] | null
          name: string
          nutritional_info: Json | null
          portion_size: number
          portion_unit: string
          protein: number
          serving_suggestion: string | null
        }
        Insert: {
          calories: number
          carbs: number
          category: string
          created_at?: string | null
          fats: number
          food_group?: string
          id?: string
          meal_time?: string[] | null
          name: string
          nutritional_info?: Json | null
          portion_size: number
          portion_unit: string
          protein: number
          serving_suggestion?: string | null
        }
        Update: {
          calories?: number
          carbs?: number
          category?: string
          created_at?: string | null
          fats?: number
          food_group?: string
          id?: string
          meal_time?: string[] | null
          name?: string
          nutritional_info?: Json | null
          portion_size?: number
          portion_unit?: string
          protein?: number
          serving_suggestion?: string | null
        }
        Relationships: []
      }
      meal_plans: {
        Row: {
          created_at: string | null
          date: string
          id: string
          meals: Json
          patient_id: string | null
          total_calories: number
          total_carbs: number
          total_fats: number
          total_protein: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          meals: Json
          patient_id?: string | null
          total_calories: number
          total_carbs: number
          total_fats: number
          total_protein: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          meals?: Json
          patient_id?: string | null
          total_calories?: number
          total_carbs?: number
          total_fats?: number
          total_protein?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_suggestions: {
        Row: {
          calories_percentage: number
          carbs_percentage: number
          created_at: string | null
          fats_percentage: number
          foods: string[]
          goal: string
          id: string
          meal_time: string
          protein_percentage: number
        }
        Insert: {
          calories_percentage: number
          carbs_percentage: number
          created_at?: string | null
          fats_percentage: number
          foods: string[]
          goal: string
          id?: string
          meal_time: string
          protein_percentage: number
        }
        Update: {
          calories_percentage?: number
          carbs_percentage?: number
          created_at?: string | null
          fats_percentage?: number
          foods?: string[]
          goal?: string
          id?: string
          meal_time?: string
          protein_percentage?: number
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string | null
          birth_date: string | null
          created_at: string | null
          email: string | null
          gender: string | null
          goals: Json | null
          id: string
          measurements: Json | null
          name: string
          notes: string | null
          phone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          created_at?: string | null
          email?: string | null
          gender?: string | null
          goals?: Json | null
          id?: string
          measurements?: Json | null
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          created_at?: string | null
          email?: string | null
          gender?: string | null
          goals?: Json | null
          id?: string
          measurements?: Json | null
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string | null
          id: string
          professional_settings: Json | null
          settings: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          professional_settings?: Json | null
          settings?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          professional_settings?: Json | null
          settings?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          clinic_name: string | null
          created_at: string | null
          crn: string | null
          email: string
          id: string
          name: string | null
          photo_url: string | null
          specialty: string | null
          updated_at: string | null
        }
        Insert: {
          clinic_name?: string | null
          created_at?: string | null
          crn?: string | null
          email: string
          id?: string
          name?: string | null
          photo_url?: string | null
          specialty?: string | null
          updated_at?: string | null
        }
        Update: {
          clinic_name?: string | null
          created_at?: string | null
          crn?: string | null
          email?: string
          id?: string
          name?: string | null
          photo_url?: string | null
          specialty?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_nutritional_similarity: {
        Args: { original_id: string; substitute_id: string }
        Returns: Json
      }
      get_food_ids: {
        Args: { food_names: string[] }
        Returns: string[]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
