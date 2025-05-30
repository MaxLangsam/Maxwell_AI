export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          preferences: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "chat_sessions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "messages_session_id_fkey"
            columns: ["session_id"]
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "memories_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "notes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "reminders_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "calendar_events_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "embeddings_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "insights_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_memories: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_user_stats: {
        Args: {
          user_uuid: string
        }
        Returns: Json
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
