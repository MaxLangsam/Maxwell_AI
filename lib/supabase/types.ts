export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          user_status: "waitlist" | "approved" | "admin"
          preferences: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          user_status?: "waitlist" | "approved" | "admin"
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          user_status?: "waitlist" | "approved" | "admin"
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          title: string
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          session_id: string
          role: "user" | "assistant"
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          role: "user" | "assistant"
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          role?: "user" | "assistant"
          content?: string
          created_at?: string
        }
      }
      memories: {
        Row: {
          id: string
          user_id: string
          type: "short_term" | "long_term" | "preference"
          content: string
          context: Json | null
          importance: number
          created_at: string
          updated_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: "short_term" | "long_term" | "preference"
          content: string
          context?: Json | null
          importance?: number
          created_at?: string
          updated_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: "short_term" | "long_term" | "preference"
          content?: string
          context?: Json | null
          importance?: number
          created_at?: string
          updated_at?: string
          expires_at?: string | null
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          priority: "low" | "medium" | "high" | "urgent"
          status: "pending" | "in_progress" | "completed" | "cancelled"
          tags: string[]
          due_date: string | null
          recurring_pattern: Json | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          priority?: "low" | "medium" | "high" | "urgent"
          status?: "pending" | "in_progress" | "completed" | "cancelled"
          tags?: string[]
          due_date?: string | null
          recurring_pattern?: Json | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          priority?: "low" | "medium" | "high" | "urgent"
          status?: "pending" | "in_progress" | "completed" | "cancelled"
          tags?: string[]
          due_date?: string | null
          recurring_pattern?: Json | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      notes: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          type: "note" | "journal" | "idea"
          tags: string[]
          mood: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          type?: "note" | "journal" | "idea"
          tags?: string[]
          mood?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          type?: "note" | "journal" | "idea"
          tags?: string[]
          mood?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reminders: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          reminder_time: string
          recurring_pattern: Json | null
          status: "active" | "completed" | "snoozed" | "cancelled"
          snooze_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          reminder_time: string
          recurring_pattern?: Json | null
          status?: "active" | "completed" | "snoozed" | "cancelled"
          snooze_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          reminder_time?: string
          recurring_pattern?: Json | null
          status?: "active" | "completed" | "snoozed" | "cancelled"
          snooze_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      calendar_events: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          start_time: string
          end_time: string
          location: string | null
          attendees: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          start_time: string
          end_time: string
          location?: string | null
          attendees?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          location?: string | null
          attendees?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      embeddings: {
        Row: {
          id: string
          user_id: string
          content: string
          source_type: "chat" | "note" | "task" | "journal" | "idea"
          source_id: string
          embedding: number[]
          themes: string[]
          sentiment: "positive" | "negative" | "neutral" | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          source_type: "chat" | "note" | "task" | "journal" | "idea"
          source_id: string
          embedding?: number[]
          themes?: string[]
          sentiment?: "positive" | "negative" | "neutral" | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          source_type?: "chat" | "note" | "task" | "journal" | "idea"
          source_id?: string
          embedding?: number[]
          themes?: string[]
          sentiment?: "positive" | "negative" | "neutral" | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      insights: {
        Row: {
          id: string
          user_id: string
          type: "pattern" | "suggestion" | "question" | "connection" | "forgotten_idea"
          title: string
          description: string
          confidence: number
          evidence: Json | null
          actionable: boolean
          dismissed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: "pattern" | "suggestion" | "question" | "connection" | "forgotten_idea"
          title: string
          description: string
          confidence?: number
          evidence?: Json | null
          actionable?: boolean
          dismissed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: "pattern" | "suggestion" | "question" | "connection" | "forgotten_idea"
          title?: string
          description?: string
          confidence?: number
          evidence?: Json | null
          actionable?: boolean
          dismissed?: boolean
          created_at?: string
        }
      }
      waitlist: {
        Row: {
          id: string
          email: string
          name: string | null
          reason: string | null
          status: "pending" | "approved" | "rejected"
          created_at: string
          updated_at: string
          approved_by: string | null
          approved_at: string | null
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          reason?: string | null
          status?: "pending" | "approved" | "rejected"
          created_at?: string
          updated_at?: string
          approved_by?: string | null
          approved_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          reason?: string | null
          status?: "pending" | "approved" | "rejected"
          created_at?: string
          updated_at?: string
          approved_by?: string | null
          approved_at?: string | null
        }
      }
      admin_users: {
        Row: {
          id: string
          user_id: string
          role: "admin" | "super_admin"
          permissions: Json | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          user_id: string
          role?: "admin" | "super_admin"
          permissions?: Json | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          role?: "admin" | "super_admin"
          permissions?: Json | null
          created_at?: string
          created_by?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_user_approved: {
        Args: {
          user_email: string
        }
        Returns: boolean
      }
      approve_waitlist_user: {
        Args: {
          waitlist_email: string
          admin_user_id: string
        }
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

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]
