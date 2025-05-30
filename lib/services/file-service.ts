import { createServerClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export interface UploadedFile {
  id: string
  user_id: string
  filename: string
  original_name: string
  file_type: string
  file_size: number
  storage_path: string
  content_text?: string
  summary?: string
  tags: string[]
  status: "uploading" | "processing" | "ready" | "error"
  created_at: string
  updated_at: string
}

export class FileService {
  private supabase = createServerClient()

  async uploadFile(userId: string, file: File, onProgress?: (progress: number) => void): Promise<UploadedFile | null> {
    try {
      onProgress?.(10)

      // Generate unique filename
      const timestamp = Date.now()
      const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
      const storagePath = `uploads/${userId}/${filename}`

      onProgress?.(25)

      // Upload to Supabase Storage
      const fileBuffer = await file.arrayBuffer()
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from("user-files")
        .upload(storagePath, fileBuffer, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        console.error("Storage upload error:", uploadError)
        throw new Error("Failed to upload file to storage")
      }

      onProgress?.(50)

      // Extract text content
      let contentText = ""
      if (file.type === "text/plain" || file.type === "text/markdown") {
        contentText = await file.text()
      }

      onProgress?.(75)

      // Create database record
      const { data: fileRecord, error: dbError } = await this.supabase
        .from("uploaded_files")
        .insert({
          user_id: userId,
          filename,
          original_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: storagePath,
          content_text: contentText,
          status: contentText ? "ready" : "processing",
        })
        .select()
        .single()

      if (dbError) {
        console.error("Database error:", dbError)
        // Clean up uploaded file
        await this.supabase.storage.from("user-files").remove([storagePath])
        throw new Error("Failed to save file record")
      }

      onProgress?.(90)

      // Process file if we have content
      if (contentText) {
        await this.processFileContent(fileRecord.id, contentText)
      }

      onProgress?.(100)

      return fileRecord as UploadedFile
    } catch (error) {
      console.error("File upload error:", error)
      return null
    }
  }

  async getFiles(userId: string): Promise<UploadedFile[]> {
    try {
      const { data, error } = await this.supabase
        .from("uploaded_files")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching files:", error)
        return []
      }

      return data as UploadedFile[]
    } catch (error) {
      console.error("Error fetching files:", error)
      return []
    }
  }

  async deleteFile(userId: string, fileId: string): Promise<boolean> {
    try {
      // Get file info
      const { data: file, error: fetchError } = await this.supabase
        .from("uploaded_files")
        .select("storage_path")
        .eq("id", fileId)
        .eq("user_id", userId)
        .single()

      if (fetchError || !file) {
        return false
      }

      // Delete from storage
      await this.supabase.storage.from("user-files").remove([file.storage_path])

      // Delete from database
      const { error: deleteError } = await this.supabase
        .from("uploaded_files")
        .delete()
        .eq("id", fileId)
        .eq("user_id", userId)

      return !deleteError
    } catch (error) {
      console.error("Error deleting file:", error)
      return false
    }
  }

  private async processFileContent(fileId: string, content: string): Promise<void> {
    try {
      // Generate summary
      const { text: summary } = await generateText({
        model: openai("gpt-4o-mini"),
        prompt: `Summarize this document in 2-3 sentences:\n\n${content.slice(0, 4000)}`,
      })

      // Extract tags
      const { text: tagsText } = await generateText({
        model: openai("gpt-4o-mini"),
        prompt: `Extract 3-5 relevant tags/keywords from this document. Return only the tags separated by commas:\n\n${content.slice(0, 2000)}`,
      })

      const tags = tagsText
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      // Update file record
      await this.supabase
        .from("uploaded_files")
        .update({
          summary,
          tags,
          status: "ready",
          updated_at: new Date().toISOString(),
        })
        .eq("id", fileId)
    } catch (error) {
      console.error("Error processing file content:", error)
      // Update status to error
      await this.supabase
        .from("uploaded_files")
        .update({
          status: "error",
          updated_at: new Date().toISOString(),
        })
        .eq("id", fileId)
    }
  }
}
