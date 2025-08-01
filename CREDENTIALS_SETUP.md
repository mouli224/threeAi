# 🔐 Configuration Guide

## 🚨 **IMPORTANT: Add Your Credentials Before Deployment**

The code has been sanitized to remove sensitive tokens. You need to add your real credentials before deploying.

### 📝 **Files to Update:**

#### 1. `src/js/config.js`
Replace the placeholders with your actual values:

```javascript
// Supabase Configuration
const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL', // ← Add your Supabase project URL
    anonKey: 'YOUR_SUPABASE_ANON_KEY' // ← Add your Supabase anon key
};

// Hugging Face Configuration  
const HUGGINGFACE_CONFIG = {
    ownerToken: 'YOUR_HUGGINGFACE_TOKEN', // ← Add your HF token
    // ... rest of config
};
```

#### 2. Test Files (Optional - for development only):
- `src/cors-server.py` line 53
- `src/hf-debug.html` line 47  
- `src/hf-test.html` line 77

### 🔑 **Where to Get Your Credentials:**

#### **Supabase:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy your Project URL and anon/public key

#### **Hugging Face:**
1. Go to https://huggingface.co/settings/tokens
2. Create a new token with "Read" permissions
3. Copy the token (starts with `hf_`)

### ⚠️ **Security Best Practices:**

1. **Never commit real tokens to Git**
2. **Use environment variables in production**
3. **Regenerate tokens if accidentally exposed**
4. **Use different tokens for development/production**

### 🚀 **Deployment Steps:**

1. **Update config.js with real credentials**
2. **Test locally** with `python -m http.server 8000`
3. **Deploy to Vercel** (credentials will be in the deployed files)
4. **Run database setup** in Supabase SQL Editor

### 🛡️ **What Happened:**

GitHub's secret scanning detected the Hugging Face token and blocked the push for security. This is a good security feature that prevents accidental token exposure.
