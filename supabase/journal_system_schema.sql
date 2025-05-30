-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    mood TEXT CHECK (mood IN ('happy', 'sad', 'neutral', 'excited', 'anxious', 'calm', 'frustrated', 'grateful')),
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create journal_attachments table
CREATE TABLE IF NOT EXISTS journal_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create journal_insights table
CREATE TABLE IF NOT EXISTS journal_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('mood_trend', 'topic_analysis', 'growth_pattern', 'reflection_prompt')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_tags ON journal_entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_journal_entries_mood ON journal_entries(mood);
CREATE INDEX IF NOT EXISTS idx_journal_attachments_entry_id ON journal_attachments(entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_insights_user_id ON journal_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_insights_type ON journal_insights(type);

-- Enable Row Level Security
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_insights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for journal_entries
CREATE POLICY "Users can view their own journal entries" ON journal_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal entries" ON journal_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries" ON journal_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries" ON journal_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for journal_attachments
CREATE POLICY "Users can view attachments for their journal entries" ON journal_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM journal_entries 
            WHERE journal_entries.id = journal_attachments.entry_id 
            AND journal_entries.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert attachments for their journal entries" ON journal_attachments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM journal_entries 
            WHERE journal_entries.id = journal_attachments.entry_id 
            AND journal_entries.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete attachments for their journal entries" ON journal_attachments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM journal_entries 
            WHERE journal_entries.id = journal_attachments.entry_id 
            AND journal_entries.user_id = auth.uid()
        )
    );

-- Create RLS policies for journal_insights
CREATE POLICY "Users can view their own journal insights" ON journal_insights
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal insights" ON journal_insights
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for journal files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('journal-files', 'journal-files', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for journal files
CREATE POLICY "Users can upload their own journal files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'journal-files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own journal files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'journal-files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own journal files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'journal-files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for journal_entries
CREATE TRIGGER update_journal_entries_updated_at 
    BEFORE UPDATE ON journal_entries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
