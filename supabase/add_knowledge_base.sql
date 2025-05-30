-- Add knowledge_files table for uploaded documents
CREATE TABLE IF NOT EXISTS public.knowledge_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  content_text TEXT,
  summary TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add knowledge_chunks table for vector search
CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID REFERENCES public.knowledge_files(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_files_user_id ON public.knowledge_files(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_files_status ON public.knowledge_files(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_file_id ON public.knowledge_chunks(file_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_user_id ON public.knowledge_chunks(user_id);

-- Grant permissions
GRANT ALL ON public.knowledge_files TO authenticated;
GRANT ALL ON public.knowledge_chunks TO authenticated;
