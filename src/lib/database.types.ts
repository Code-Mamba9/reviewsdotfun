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
      Merchants: {
        Row: {
          created_at: string
          merchant_wallet_addr: string
          name: string
          profile_pic: string
          token_name: string | null
          token_pic: string | null
          website_url: string
        }
        Insert: {
          created_at: string
          merchant_wallet_addr: string
          name: string
          profile_pic: string
          token_name?: string | null
          token_pic?: string | null
          website_url: string
        }
        Update: {
          created_at?: string
          merchant_wallet_addr?: string
          name?: string
          profile_pic?: string
          token_name?: string | null
          token_pic?: string | null
          website_url?: string
        }
        Relationships: []
      }
      Reviews: {
        Row: {
          body: string
          created_at: string | null
          downvotes: number
          merchant_wallet_addr: string
          parent_tx_hash: string | null
          title: string
          tx_hash: string
          upvotes: number
          user_wallet_addr: string
        }
        Insert: {
          body: string
          created_at?: string | null
          downvotes?: number
          merchant_wallet_addr: string
          parent_tx_hash?: string | null
          title: string
          tx_hash: string
          upvotes?: number
          user_wallet_addr: string
        }
        Update: {
          body?: string
          created_at?: string | null
          downvotes?: number
          merchant_wallet_addr?: string
          parent_tx_hash?: string | null
          title?: string
          tx_hash?: string
          upvotes?: number
          user_wallet_addr?: string
        }
        Relationships: [
          {
            foreignKeyName: "Reviews_merchant_wallet_addr_fkey"
            columns: ["merchant_wallet_addr"]
            isOneToOne: false
            referencedRelation: "Merchants"
            referencedColumns: ["merchant_wallet_addr"]
          },
        ]
      }
      UserReviewNote: {
        Row: {
          tx_hash: string
          upvote: boolean | null
          user_wallet_addr: string
        }
        Insert: {
          tx_hash: string
          upvote?: boolean | null
          user_wallet_addr: string
        }
        Update: {
          tx_hash?: string
          upvote?: boolean | null
          user_wallet_addr?: string
        }
        Relationships: [
          {
            foreignKeyName: "UserReviewNote_tx_hash_fkey"
            columns: ["tx_hash"]
            isOneToOne: false
            referencedRelation: "Reviews"
            referencedColumns: ["tx_hash"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
