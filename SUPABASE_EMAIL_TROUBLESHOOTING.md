# Supabase Email Verification Troubleshooting Guide

## 🔍 **Common Issues and Solutions**

### **1. Check Supabase Project Settings**

1. **Go to your Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your project: `jmfgmpalqkdzckedbfbv`

2. **Authentication Settings:**
   - Go to `Authentication` → `Settings`
   - Check these settings:

   #### **Email Confirmation:**
   - ✅ `Enable email confirmations` should be **ON**
   - ✅ `Confirm email` should be **ENABLED**

   #### **Site URL:**
   - Set to: `http://localhost:8000` (for development)
   - Or your production domain if deployed

   #### **Redirect URLs:**
   - Add: `http://localhost:8000/**`
   - Add: `http://localhost:8000/index.html`

### **2. Email Provider Configuration**

#### **Default Supabase SMTP (Most likely issue):**
- Supabase's default email service has limitations
- Emails might go to spam or not be delivered
- **Solution:** Configure custom SMTP

#### **Custom SMTP Setup (Recommended):**
1. Go to `Authentication` → `Settings` → `SMTP Settings`
2. Configure with Gmail/Outlook/SendGrid:

**Gmail Example:**
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your-email@gmail.com
SMTP Pass: your-app-password (not regular password)
Sender Email: your-email@gmail.com
Sender Name: ThreeAI App
```

### **3. Immediate Solutions**

#### **Option A: Disable Email Confirmation (Quick Fix)**
1. Go to `Authentication` → `Settings`
2. Turn OFF `Enable email confirmations`
3. Users can sign up without email verification

#### **Option B: Manual Email Template Fix**
1. Go to `Authentication` → `Email Templates`
2. Check the "Confirm signup" template
3. Ensure the confirmation URL is correct

#### **Option C: Check Email Template**
Default template should have:
```html
<h2>Confirm your signup</h2>
<p>Click this link to confirm your email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
```

### **4. Testing Steps**

1. **Check Spam Folder** - Most common issue
2. **Try Different Email** - Gmail, Outlook, Yahoo
3. **Check Browser Console** - Look for errors during signup
4. **Test with curl:**
```bash
curl -X POST 'https://jmfgmpalqkdzckedbfbv.supabase.co/auth/v1/signup' \
-H "apikey: YOUR_ANON_KEY" \
-H "Content-Type: application/json" \
-d '{"email": "test@example.com", "password": "password123"}'
```

### **5. Quick Development Workaround**

Update the signup method to skip email verification for development:

```javascript
const { data, error } = await this.supabase.auth.signUp({
    email,
    password,
    options: {
        emailRedirectTo: window.location.origin,
        data: {
            email_confirmed: true  // Only for development
        }
    }
});
```

### **6. Environment-Specific Issues**

#### **Development (localhost):**
- Emails might not work with `localhost`
- Use ngrok for public URL testing
- Or disable email confirmation for dev

#### **Production:**
- Ensure proper domain in Site URL
- Add all redirect URLs
- Use custom SMTP for reliability

### **7. Check Supabase Auth Logs**

1. Go to `Authentication` → `Logs`
2. Look for signup events
3. Check for any error messages

## 🚀 **Recommended Immediate Fix**

**For Development (Quick Start):**
1. Disable email confirmation in Supabase dashboard
2. Test authentication flow
3. Re-enable with custom SMTP later

**For Production:**
1. Set up Gmail App Password or SendGrid
2. Configure custom SMTP in Supabase
3. Test thoroughly before deployment

## 📞 **Still Having Issues?**

1. Check Supabase Status: https://status.supabase.com/
2. Supabase Discord: https://discord.supabase.com/
3. Check your email provider's delivery logs
4. Contact Supabase support if using paid plan
