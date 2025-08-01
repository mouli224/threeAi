-- ThreeAI Database Setup for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Create user_profiles table for storing user information
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Create user_usage table
CREATE TABLE IF NOT EXISTS user_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    free_generations_used INTEGER DEFAULT 0,
    total_generations INTEGER DEFAULT 0,
    has_own_token BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    own_token_added_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_email ON user_usage(email);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own usage data" ON user_usage;
DROP POLICY IF EXISTS "Users can update own usage data" ON user_usage;
DROP POLICY IF EXISTS "Users can insert own usage data" ON user_usage;

-- Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for user_usage  
CREATE POLICY "Users can view own usage data" ON user_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own usage data" ON user_usage
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage data" ON user_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to automatically create profile and usage records when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    -- Create user profile
    INSERT INTO public.user_profiles (user_id, full_name, created_at)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', now())
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Create usage record
    INSERT INTO public.user_usage (user_id, email, created_at)
    VALUES (new.id, new.email, now())
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger to call the function when a new user is created
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS handle_user_usage_updated_at ON user_usage;

-- Trigger to update updated_at on user_usage table
CREATE TRIGGER handle_user_usage_updated_at
    BEFORE UPDATE ON user_usage
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS handle_user_profiles_updated_at ON user_profiles;

-- Trigger to update updated_at on user_profiles table
CREATE TRIGGER handle_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Insert some test data (optional - for testing)
-- This will be automatically created when users sign up, so this is just for reference
/*
INSERT INTO user_usage (user_id, email, free_generations_used, total_generations, has_own_token)
VALUES 
    ('00000000-0000-0000-0000-000000000000', 'test@example.com', 0, 0, false)
ON CONFLICT (user_id) DO NOTHING;
*/

-- Verify the setup
SELECT 'Database setup complete!' as status;
