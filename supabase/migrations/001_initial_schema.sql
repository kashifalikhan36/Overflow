-- Overflow Notes App Database Schema
-- Version: 1.0.0
-- Description: Complete database schema for production deployment

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- =====================================================
-- Users Table (extends Supabase auth.users)
-- =====================================================
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    username TEXT UNIQUE,
    bio TEXT,
    preferences JSONB DEFAULT '{}'::jsonb,
    storage_used BIGINT DEFAULT 0,
    storage_limit BIGINT DEFAULT 10737418240, -- 10GB default
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Notes Table
-- =====================================================
CREATE TABLE public.notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    content TEXT,
    type TEXT DEFAULT 'text' CHECK (type IN ('text', 'checklist', 'drawing', 'image', 'audio')),
    color TEXT DEFAULT 'default',
    pinned BOOLEAN DEFAULT FALSE,
    archived BOOLEAN DEFAULT FALSE,
    deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    
    -- Checklist data
    checklist JSONB,
    
    -- Drawing data
    drawings JSONB,
    
    -- Image data
    images JSONB,
    
    -- Audio data
    audio_url TEXT,
    audio_transcription TEXT,
    audio_duration INTEGER,
    
    -- Collaboration
    is_shared BOOLEAN DEFAULT FALSE,
    share_settings JSONB DEFAULT '{}'::jsonb,
    
    -- Reminders
    reminder_date TIMESTAMPTZ,
    reminder_repeat TEXT,
    reminder_enabled BOOLEAN DEFAULT FALSE,
    
    -- Location
    location_latitude DECIMAL(10, 8),
    location_longitude DECIMAL(11, 8),
    location_name TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    version INTEGER DEFAULT 1,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes
    CONSTRAINT valid_color CHECK (color IN ('default', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'gray'))
);

-- Create indexes for performance
CREATE INDEX idx_notes_user_id ON public.notes(user_id);
CREATE INDEX idx_notes_created_at ON public.notes(created_at DESC);
CREATE INDEX idx_notes_updated_at ON public.notes(updated_at DESC);
CREATE INDEX idx_notes_pinned ON public.notes(pinned) WHERE pinned = TRUE;
CREATE INDEX idx_notes_archived ON public.notes(archived) WHERE archived = FALSE;
CREATE INDEX idx_notes_deleted ON public.notes(deleted) WHERE deleted = FALSE;
CREATE INDEX idx_notes_type ON public.notes(type);
CREATE INDEX idx_notes_reminder ON public.notes(reminder_date) WHERE reminder_enabled = TRUE;
CREATE INDEX idx_notes_content_search ON public.notes USING gin(to_tsvector('english', content));
CREATE INDEX idx_notes_title_search ON public.notes USING gin(to_tsvector('english', title));

-- =====================================================
-- Labels Table
-- =====================================================
CREATE TABLE public.labels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    color TEXT DEFAULT 'default',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, name)
);

CREATE INDEX idx_labels_user_id ON public.labels(user_id);
CREATE INDEX idx_labels_name ON public.labels(name);

-- =====================================================
-- Note Labels Junction Table
-- =====================================================
CREATE TABLE public.note_labels (
    note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE,
    label_id UUID REFERENCES public.labels(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (note_id, label_id)
);

CREATE INDEX idx_note_labels_note_id ON public.note_labels(note_id);
CREATE INDEX idx_note_labels_label_id ON public.note_labels(label_id);

-- =====================================================
-- Collaborators Table
-- =====================================================
CREATE TABLE public.collaborators (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    permission TEXT DEFAULT 'view' CHECK (permission IN ('view', 'edit', 'admin')),
    invited_by UUID REFERENCES public.profiles(id),
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    last_viewed_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    
    UNIQUE(note_id, user_id)
);

CREATE INDEX idx_collaborators_note_id ON public.collaborators(note_id);
CREATE INDEX idx_collaborators_user_id ON public.collaborators(user_id);
CREATE INDEX idx_collaborators_active ON public.collaborators(is_active) WHERE is_active = TRUE;

-- =====================================================
-- Note Activity Log
-- =====================================================
CREATE TABLE public.note_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_note_activities_note_id ON public.note_activities(note_id);
CREATE INDEX idx_note_activities_user_id ON public.note_activities(user_id);
CREATE INDEX idx_note_activities_created_at ON public.note_activities(created_at DESC);

-- =====================================================
-- Attachments Table
-- =====================================================
CREATE TABLE public.attachments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    storage_path TEXT NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attachments_note_id ON public.attachments(note_id);
CREATE INDEX idx_attachments_user_id ON public.attachments(user_id);

-- =====================================================
-- Share Links Table
-- =====================================================
CREATE TABLE public.share_links (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    token TEXT UNIQUE NOT NULL,
    permission TEXT DEFAULT 'view' CHECK (permission IN ('view', 'edit')),
    password_hash TEXT,
    expires_at TIMESTAMPTZ,
    view_count INTEGER DEFAULT 0,
    max_views INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ
);

CREATE INDEX idx_share_links_note_id ON public.share_links(note_id);
CREATE INDEX idx_share_links_token ON public.share_links(token);
CREATE INDEX idx_share_links_active ON public.share_links(is_active) WHERE is_active = TRUE;

-- =====================================================
-- Functions
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_labels_updated_at BEFORE UPDATE ON public.labels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log note activity
CREATE OR REPLACE FUNCTION log_note_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.note_activities (note_id, user_id, action, details)
        VALUES (NEW.id, NEW.user_id, 'created', jsonb_build_object('type', NEW.type));
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.note_activities (note_id, user_id, action, details)
        VALUES (NEW.id, NEW.user_id, 'updated', jsonb_build_object('type', NEW.type));
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.note_activities (note_id, user_id, action, details)
        VALUES (OLD.id, OLD.user_id, 'deleted', jsonb_build_object('type', OLD.type));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_note_activity_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.notes
    FOR EACH ROW EXECUTE FUNCTION log_note_activity();

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Notes policies
CREATE POLICY "Users can view own notes" ON public.notes
    FOR SELECT USING (
        auth.uid() = user_id 
        OR id IN (
            SELECT note_id FROM public.collaborators 
            WHERE user_id = auth.uid() AND is_active = TRUE
        )
    );

CREATE POLICY "Users can insert own notes" ON public.notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes or shared notes with edit permission" ON public.notes
    FOR UPDATE USING (
        auth.uid() = user_id 
        OR id IN (
            SELECT note_id FROM public.collaborators 
            WHERE user_id = auth.uid() 
            AND permission IN ('edit', 'admin') 
            AND is_active = TRUE
        )
    );

CREATE POLICY "Users can delete own notes" ON public.notes
    FOR DELETE USING (auth.uid() = user_id);

-- Labels policies
CREATE POLICY "Users can manage own labels" ON public.labels
    FOR ALL USING (auth.uid() = user_id);

-- Note labels policies
CREATE POLICY "Users can manage own note labels" ON public.note_labels
    FOR ALL USING (
        note_id IN (SELECT id FROM public.notes WHERE user_id = auth.uid())
    );

-- Collaborators policies
CREATE POLICY "Users can view collaborators on accessible notes" ON public.collaborators
    FOR SELECT USING (
        note_id IN (
            SELECT id FROM public.notes WHERE user_id = auth.uid()
        ) OR user_id = auth.uid()
    );

CREATE POLICY "Note owners can manage collaborators" ON public.collaborators
    FOR ALL USING (
        note_id IN (SELECT id FROM public.notes WHERE user_id = auth.uid())
    );

-- Activities policies
CREATE POLICY "Users can view activities on accessible notes" ON public.note_activities
    FOR SELECT USING (
        note_id IN (
            SELECT id FROM public.notes 
            WHERE user_id = auth.uid() 
            OR id IN (
                SELECT note_id FROM public.collaborators 
                WHERE user_id = auth.uid() AND is_active = TRUE
            )
        )
    );

-- Attachments policies
CREATE POLICY "Users can view attachments on accessible notes" ON public.attachments
    FOR SELECT USING (
        note_id IN (
            SELECT id FROM public.notes 
            WHERE user_id = auth.uid() 
            OR id IN (
                SELECT note_id FROM public.collaborators 
                WHERE user_id = auth.uid() AND is_active = TRUE
            )
        )
    );

CREATE POLICY "Users can manage own attachments" ON public.attachments
    FOR ALL USING (auth.uid() = user_id);

-- Share links policies
CREATE POLICY "Users can manage share links for own notes" ON public.share_links
    FOR ALL USING (
        note_id IN (SELECT id FROM public.notes WHERE user_id = auth.uid())
    );

-- =====================================================
-- Realtime subscriptions
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.collaborators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.note_activities;

-- =====================================================
-- Grant permissions
-- =====================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
