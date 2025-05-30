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
      anthropometry: {
        Row: {
          abdominal: number | null
          arm: number | null
          body_fat_pct: number | null
          calf: number | null
          chest: number | null
          created_at: string | null
          date: string
          height: number | null
          hip: number | null
          id: string
          imc: number | null
          lean_mass_kg: number | null
          patient_id: string
          rcq: number | null
          subscapular: number | null
          suprailiac: number | null
          thigh: number | null
          triceps: number | null
          user_id: string
          waist: number | null
          weight: number | null
        }
        Insert: {
          abdominal?: number | null
          arm?: number | null
          body_fat_pct?: number | null
          calf?: number | null
          chest?: number | null
          created_at?: string | null
          date?: string
          height?: number | null
          hip?: number | null
          id?: string
          imc?: number | null
          lean_mass_kg?: number | null
          patient_id: string
          rcq?: number | null
          subscapular?: number | null
          suprailiac?: number | null
          thigh?: number | null
          triceps?: number | null
          user_id: string
          waist?: number | null
          weight?: number | null
        }
        Update: {
          abdominal?: number | null
          arm?: number | null
          body_fat_pct?: number | null
          calf?: number | null
          chest?: number | null
          created_at?: string | null
          date?: string
          height?: number | null
          hip?: number | null
          id?: string
          imc?: number | null
          lean_mass_kg?: number | null
          patient_id?: string
          rcq?: number | null
          subscapular?: number | null
          suprailiac?: number | null
          thigh?: number | null
          triceps?: number | null
          user_id?: string
          waist?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "anthropometry_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_anthropometry_patient_id"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_type_id: string | null
          created_at: string | null
          date: string
          end_time: string | null
          id: string
          measurements: Json | null
          notes: string | null
          patient_id: string | null
          recommendations: string | null
          start_time: string | null
          status: string
          title: string | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          appointment_type_id?: string | null
          created_at?: string | null
          date: string
          end_time?: string | null
          id?: string
          measurements?: Json | null
          notes?: string | null
          patient_id?: string | null
          recommendations?: string | null
          start_time?: string | null
          status?: string
          title?: string | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          appointment_type_id?: string | null
          created_at?: string | null
          date?: string
          end_time?: string | null
          id?: string
          measurements?: Json | null
          notes?: string | null
          patient_id?: string | null
          recommendations?: string | null
          start_time?: string | null
          status?: string
          title?: string | null
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
          {
            foreignKeyName: "fk_appointments_patient_id"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      calculation_history: {
        Row: {
          activity_level: string
          age: number
          body_profile: string
          calculation_date: string
          carbs_g: number
          carbs_kcal: number
          consultation_number: number | null
          created_at: string
          fat_g: number
          fat_kcal: number
          formula_used: string
          get: number
          height: number
          id: string
          notes: string | null
          objective: string
          patient_id: string
          protein_g: number
          protein_kcal: number
          sex: string
          tmb: number
          updated_at: string
          user_id: string
          vet: number
          weight: number
        }
        Insert: {
          activity_level: string
          age: number
          body_profile: string
          calculation_date?: string
          carbs_g: number
          carbs_kcal: number
          consultation_number?: number | null
          created_at?: string
          fat_g: number
          fat_kcal: number
          formula_used: string
          get: number
          height: number
          id?: string
          notes?: string | null
          objective: string
          patient_id: string
          protein_g: number
          protein_kcal: number
          sex: string
          tmb: number
          updated_at?: string
          user_id: string
          vet: number
          weight: number
        }
        Update: {
          activity_level?: string
          age?: number
          body_profile?: string
          calculation_date?: string
          carbs_g?: number
          carbs_kcal?: number
          consultation_number?: number | null
          created_at?: string
          fat_g?: number
          fat_kcal?: number
          formula_used?: string
          get?: number
          height?: number
          id?: string
          notes?: string | null
          objective?: string
          patient_id?: string
          protein_g?: number
          protein_kcal?: number
          sex?: string
          tmb?: number
          updated_at?: string
          user_id?: string
          vet?: number
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "calculation_history_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_calculation_history_patient_id"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
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
          last_auto_save: string | null
          measurements: Json | null
          notes: string | null
          patient_id: string | null
          protein: number
          status: string
          tdee: number
          tipo: string
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
          last_auto_save?: string | null
          measurements?: Json | null
          notes?: string | null
          patient_id?: string | null
          protein: number
          status?: string
          tdee: number
          tipo?: string
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
          last_auto_save?: string | null
          measurements?: Json | null
          notes?: string | null
          patient_id?: string | null
          protein?: number
          status?: string
          tdee?: number
          tipo?: string
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
          {
            foreignKeyName: "fk_calculations_patient_id"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
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
      meal_plan_items: {
        Row: {
          calories: number
          carbs: number
          created_at: string | null
          fats: number
          food_id: string | null
          food_name: string
          id: string
          meal_plan_id: string | null
          meal_type: string
          order_index: number
          protein: number
          quantity: number
          unit: string
          updated_at: string | null
        }
        Insert: {
          calories?: number
          carbs?: number
          created_at?: string | null
          fats?: number
          food_id?: string | null
          food_name: string
          id?: string
          meal_plan_id?: string | null
          meal_type: string
          order_index?: number
          protein?: number
          quantity?: number
          unit?: string
          updated_at?: string | null
        }
        Update: {
          calories?: number
          carbs?: number
          created_at?: string | null
          fats?: number
          food_id?: string | null
          food_name?: string
          id?: string
          meal_plan_id?: string | null
          meal_type?: string
          order_index?: number
          protein?: number
          quantity?: number
          unit?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_meal_plan_items_food_id"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_meal_plan_items_meal_plan_id"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plan_items_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plan_items_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          calculation_id: string | null
          created_at: string | null
          date: string
          day_of_week: number | null
          id: string
          is_template: boolean | null
          meals: Json
          notes: string | null
          patient_id: string | null
          total_calories: number
          total_carbs: number
          total_fats: number
          total_protein: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          calculation_id?: string | null
          created_at?: string | null
          date: string
          day_of_week?: number | null
          id?: string
          is_template?: boolean | null
          meals: Json
          notes?: string | null
          patient_id?: string | null
          total_calories: number
          total_carbs: number
          total_fats: number
          total_protein: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          calculation_id?: string | null
          created_at?: string | null
          date?: string
          day_of_week?: number | null
          id?: string
          is_template?: boolean | null
          meals?: Json
          notes?: string | null
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
            foreignKeyName: "fk_meal_plans_calculation_id"
            columns: ["calculation_id"]
            isOneToOne: false
            referencedRelation: "calculations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_meal_plans_patient_id"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
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
      measurements: {
        Row: {
          abdominal_skinfold: number | null
          arm_circumference: number | null
          body_fat_percentage: number | null
          cholesterol_hdl: number | null
          cholesterol_ldl: number | null
          cholesterol_total: number | null
          created_at: string
          glucose: number | null
          height: number | null
          hip_circumference: number | null
          id: string
          imc: number | null
          measurement_date: string
          muscle_mass_percentage: number | null
          notes: string | null
          patient_id: string
          subscapular_skinfold: number | null
          suprailiac_skinfold: number | null
          thigh_circumference: number | null
          triceps_skinfold: number | null
          triglycerides: number | null
          updated_at: string
          user_id: string
          waist_circumference: number | null
          water_percentage: number | null
          weight: number | null
        }
        Insert: {
          abdominal_skinfold?: number | null
          arm_circumference?: number | null
          body_fat_percentage?: number | null
          cholesterol_hdl?: number | null
          cholesterol_ldl?: number | null
          cholesterol_total?: number | null
          created_at?: string
          glucose?: number | null
          height?: number | null
          hip_circumference?: number | null
          id?: string
          imc?: number | null
          measurement_date?: string
          muscle_mass_percentage?: number | null
          notes?: string | null
          patient_id: string
          subscapular_skinfold?: number | null
          suprailiac_skinfold?: number | null
          thigh_circumference?: number | null
          triceps_skinfold?: number | null
          triglycerides?: number | null
          updated_at?: string
          user_id: string
          waist_circumference?: number | null
          water_percentage?: number | null
          weight?: number | null
        }
        Update: {
          abdominal_skinfold?: number | null
          arm_circumference?: number | null
          body_fat_percentage?: number | null
          cholesterol_hdl?: number | null
          cholesterol_ldl?: number | null
          cholesterol_total?: number | null
          created_at?: string
          glucose?: number | null
          height?: number | null
          hip_circumference?: number | null
          id?: string
          imc?: number | null
          measurement_date?: string
          muscle_mass_percentage?: number | null
          notes?: string | null
          patient_id?: string
          subscapular_skinfold?: number | null
          suprailiac_skinfold?: number | null
          thigh_circumference?: number | null
          triceps_skinfold?: number | null
          triglycerides?: number | null
          updated_at?: string
          user_id?: string
          waist_circumference?: number | null
          water_percentage?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_measurements_patient_id"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "measurements_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          birth_date: string | null
          cpf: string | null
          created_at: string | null
          email: string | null
          gender: string | null
          goals: Json | null
          id: string
          measurements: Json | null
          name: string
          notes: string | null
          phone: string | null
          secondaryPhone: string | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          gender?: string | null
          goals?: Json | null
          id?: string
          measurements?: Json | null
          name: string
          notes?: string | null
          phone?: string | null
          secondaryPhone?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          gender?: string | null
          goals?: Json | null
          id?: string
          measurements?: Json | null
          name?: string
          notes?: string | null
          phone?: string | null
          secondaryPhone?: string | null
          status?: string
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
      stripe_events: {
        Row: {
          created_at: string
          event_data: Json
          event_type: string
          id: string
          processed_at: string | null
          stripe_event_id: string
        }
        Insert: {
          created_at?: string
          event_data: Json
          event_type: string
          id?: string
          processed_at?: string | null
          stripe_event_id: string
        }
        Update: {
          created_at?: string
          event_data?: Json
          event_type?: string
          id?: string
          processed_at?: string | null
          stripe_event_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_premium: boolean
          payment_status: string | null
          role: string
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          subscription_end: string | null
          subscription_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_premium?: boolean
          payment_status?: string | null
          role?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_premium?: boolean
          payment_status?: string | null
          role?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          approved: boolean | null
          content: string
          created_at: string | null
          id: string
          name: string
          rating: number | null
          role: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          approved?: boolean | null
          content: string
          created_at?: string | null
          id?: string
          name: string
          rating?: number | null
          role: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          approved?: boolean | null
          content?: string
          created_at?: string | null
          id?: string
          name?: string
          rating?: number | null
          role?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      check_user_premium_status: {
        Args: { user_id: string }
        Returns: boolean
      }
      create_meal_plan_with_items: {
        Args: { p_meal_plan_data: Json; p_meal_plan_items_data: Json }
        Returns: string
      }
      generate_meal_plan: {
        Args: {
          p_user_id: string
          p_patient_id: string
          p_target_calories: number
          p_target_protein: number
          p_target_carbs: number
          p_target_fats: number
          p_date?: string
        }
        Returns: string
      }
      get_food_ids: {
        Args: { food_names: string[] }
        Returns: string[]
      }
      get_patient_last_consultation: {
        Args: { p_patient_id: string }
        Returns: {
          consultation_number: number
          weight: number
          height: number
          age: number
          sex: string
          body_profile: string
          activity_level: string
          objective: string
          tmb: number
          get_value: number
          vet: number
          protein_g: number
          carbs_g: number
          fat_g: number
          calculation_date: string
        }[]
      }
      get_subscription_status: {
        Args: { user_id: string }
        Returns: {
          is_premium: boolean
          role: string
          email: string
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_premium: {
        Args: { user_id: string }
        Returns: boolean
      }
      recalculate_meal_plan_totals: {
        Args: { p_meal_plan_id: string }
        Returns: undefined
      }
      update_meal_plan_with_items: {
        Args: {
          p_meal_plan_id: string
          p_meal_plan_data: Json
          p_meal_plan_items_data: Json
        }
        Returns: boolean
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
