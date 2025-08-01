# Setup Guide for ThreeAI 3D Creator

This guide will help you configure Supabase authentication and Hugging Face integration for your 3D Creator application.

## Prerequisites

- A Supabase account (free tier available)
- A Hugging Face account (free tier available)

## Step 1: Configure Supabase

### 1.1 Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to be set up (usually takes 1-2 minutes)

### 1.2 Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL**
3. Copy your **anon/public key**

### 1.3 Set Up the User Usage Table

1. In your Supabase dashboard, go to **SQL Editor**
2. Create a new query and run this SQL:

```sql
-- Create user_usage table
CREATE TABLE user_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    free_generations_used INTEGER DEFAULT 0,
    total_generations INTEGER DEFAULT 0,
    has_own_token BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create an index on user_id for faster queries
CREATE INDEX idx_user_usage_user_id ON user_usage(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see and update their own usage data
CREATE POLICY "Users can view own usage data" ON user_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own usage data" ON user_usage
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage data" ON user_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to automatically create usage record when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_usage (user_id, email)
    VALUES (new.id, new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
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

-- Trigger to update updated_at on user_usage table
CREATE TRIGGER handle_user_usage_updated_at
    BEFORE UPDATE ON user_usage
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
```

## Step 2: Configure Hugging Face

### 2.1 Create a Hugging Face Account

1. Go to [Hugging Face](https://huggingface.co) and create a free account
2. Verify your email address

### 2.2 Generate an Access Token

1. Go to [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Click **"New token"**
3. Give it a name like "ThreeAI 3D Creator"
4. Select **"Read"** permission (sufficient for API access)
5. Click **"Generate a token"**
6. **Copy and save this token securely** - you'll need it for configuration

## Step 3: Update Application Configuration

1. Open `src/js/config.js` in your project
2. Replace the placeholder values:

```javascript
// Supabase Configuration
const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL', // Replace with your Supabase Project URL
    anonKey: 'YOUR_SUPABASE_ANON_KEY' // Replace with your Supabase anon key
};

// Hugging Face Configuration
const HUGGINGFACE_CONFIG = {
    // Replace with your actual Hugging Face token for the owner's free generations
    ownerToken: 'hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Your HF token here
    
    // ... rest of the configuration stays the same
};
```

## Step 4: Test Your Setup

1. Save the configuration file
2. Open your application in a browser
3. Test the following:
   - **Anonymous user**: Try generating one 3D model (should work)
   - **Sign up**: Create a new account
   - **Logged-in user**: Try generating up to 3 models (should work)
   - **Token setup**: After 3 generations, try adding your own HF token

## Usage Tiers Explained

### Anonymous Users (Not Logged In)
- **1 free generation** using the owner's Hugging Face token
- After this, they must create an account for more generations

### Registered Users (Logged In)
- **3 free generations** using the owner's Hugging Face token
- After this, they can add their own Hugging Face token for unlimited use

### Users with Own Token
- **Unlimited generations** using their own Hugging Face token
- Their usage doesn't count against the owner's limits

## Security Notes

1. **Never commit real tokens to version control**
2. The owner's Hugging Face token should be kept secure
3. Consider setting up environment variables for production
4. Monitor your Hugging Face usage to avoid unexpected charges
5. The free Hugging Face tier has rate limits - consider upgrading if needed

## Troubleshooting

### Common Issues

1. **"Supabase configuration not found"**
   - Make sure `config.js` is loaded before other scripts
   - Check that the SUPABASE_CONFIG object is properly defined

2. **"Invalid Hugging Face token"**
   - Verify your token starts with "hf_"
   - Check that the token has correct permissions
   - Try generating a new token

3. **"Database table not found"**
   - Make sure you ran the SQL setup script in Supabase
   - Check that the user_usage table exists in your database

4. **Authentication not working**
   - Verify your Supabase URL and anon key are correct
   - Check browser console for error messages
   - Ensure Supabase CDN is loading properly

### Rate Limits

- Hugging Face free tier: ~1000 requests/month
- Supabase free tier: 50,000 monthly active users
- Consider monitoring usage and upgrading plans as needed

## Production Deployment

For production deployment, consider:

1. Using environment variables instead of hardcoded config
2. Setting up proper domain configuration in Supabase
3. Implementing proper error handling and fallbacks
4. Adding analytics to monitor usage patterns
5. Setting up monitoring for API rate limits

## Need Help?

- Check the browser console for error messages
- Verify all configuration values are correct
- Test with simple examples first
- Consider reaching out to Supabase or Hugging Face support if needed
