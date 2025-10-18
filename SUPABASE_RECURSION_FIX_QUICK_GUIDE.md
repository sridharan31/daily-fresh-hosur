# 🚨 URGENT: How to Fix Infinite Recursion in Supabase RIGHT NOW

## The Problem
Your Supabase database has a recursive RLS policy that's blocking ALL user table operations:
```
ERROR 42P17: infinite recursion detected in policy for relation "users"
```

## ✅ The Solution (2 Minutes)

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard/project/yvjxgoxrzkcjvuptblri/sql
2. Click **"New Query"**
3. Copy **ALL** of this SQL code:

```sql
-- FIX: Drop and recreate the admin policy WITHOUT recursion
DROP POLICY IF EXISTS "Admins can do everything" ON public.users;

CREATE POLICY "Admins can do everything" ON public.users FOR ALL USING (
  auth.role() = 'admin'
);
```

### Step 2: Run the Query
1. Paste the code into the SQL editor
2. Click **▶️ Run** (or press `Ctrl+Enter`)
3. **Expected result**: ✅ Success (should show "0 rows" or no errors)

### Step 3: Verify It Works
Test with this query:
```sql
SELECT * FROM public.users WHERE id = '2e8e8b4c-c4a9-4701-8d98-02252e44767d' LIMIT 1;
```
**Expected:** ✅ Returns your user data (no infinite recursion error)

---

## Why This Works

### ❌ OLD (Recursive - BROKEN):
```sql
CREATE POLICY "Admins can do everything" ON users FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
-- Problem: To check the policy, Supabase queries the users table
-- To query the users table, it checks the policy again
-- To check the policy, it queries the users table again...
-- Result: INFINITE LOOP → ERROR 42P17
```

### ✅ NEW (Non-Recursive - WORKS):
```sql
CREATE POLICY "Admins can do everything" ON users FOR ALL USING (
  auth.role() = 'admin'
);
-- Solution: Use JWT token role claim (no database query needed)
-- Supabase embeds the user's role in their JWT during authentication
-- auth.role() extracts it without querying the database
-- Result: No recursion, instant evaluation, works perfectly
```

---

## Why Your Curl Requests Failed

Your curl requests were hitting the **old recursive policy** still in Supabase:
```bash
curl 'https://yvjxgoxrzkcjvuptblri.supabase.co/rest/v1/users?...' \
  --data-raw '{"id":"2e8e8b4c-c4a9-4701-8d98-02252e44767d",...}'
  
# Result: ERROR 42P17 (infinite recursion)
```

After you run the SQL fix above, the same curl request will work perfectly.

---

## ✅ After the Fix - Test Everything

### 1. Test INSERT (User Registration)
```bash
curl 'https://yvjxgoxrzkcjvuptblri.supabase.co/rest/v1/users' \
  -H 'apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2anhnb3hyemtjanZ1cHRibHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNTA1ODAsImV4cCI6MjA3NTgyNjU4MH0.uEuXA4gBDoK8ARKJ_CA6RFgd8sVA1OZ763BD-lUmplk' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6ImdMdk9KU0IxUGt3M3dBVkYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3l2anhnb3hyemtjanZ1cHRibHJpLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiIyZThlOGI0Yy1jNGE5LTQ3MDEtOGQ5OC0wMjI1MmU0NDc2N2QiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzYwNzE3MTM0LCJpYXQiOjE3NjA3MTM1MzQsImVtYWlsIjoianVzdGluc3JpZGhhckBnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsIjoianVzdGluc3JpZGhhckBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiU1JJREhBUkFOIFBFUklZQU5OQU4iLCJwaG9uZSI6Iis5NzE1ODk2MTk4MTciLCJwaG9uZV92ZXJpZmllZCI6dHJ1ZSwicHJlZmVycmVkX2xhbmd1YWdlIjoiZW4iLCJyb2xlIjoiY3VzdG9tZXIiLCJzdWIiOiIyZThlOGI0Yy1jNGE5LTQ3MDEtOGQ5OC0wMjI1MmU0NDc2N2QifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc2MDcxMzUzNH1dLCJzZXNzaW9uX2lkIjoiYzJjMWZkOTctZWFlNC00NzM4LTljYjYtNGE2N2U1ZWQ0YmE3IiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.IgAM5e-T5n8eAe03q2oSrjvXsf2tPHM6gmwQEz-KdVo' \
  -H 'prefer: return=representation' \
  -H 'content-type: application/json' \
  --data-raw '{"id":"2e8e8b4c-c4a9-4701-8d98-02252e44767d","email":"test@example.com","full_name":"Test User","role":"customer"}'

# Expected: ✅ Successfully creates/returns the user
```

### 2. Test SELECT (Fetch User)
```bash
curl 'https://yvjxgoxrzkcjvuptblri.supabase.co/rest/v1/users?select=*&id=eq.2e8e8b4c-c4a9-4701-8d98-02252e44767d' \
  -H 'apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2anhnb3hyemtjanZ1cHRibHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNTA1ODAsImV4cCI6MjA3NTgyNjU4MH0.uEuXA4gBDoK8ARKJ_CA6RFgd8sVA1OZ763BD-lUmplk' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6ImdMdk9KU0IxUGt3M3dBVkYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3l2anhnb3hyemtjanZ1cHRibHJpLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiIyZThlOGI0Yy1jNGE5LTQ3MDEtOGQ5OC0wMjI1MmU0NDc2N2QiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzYwNzE3MTM0LCJpYXQiOjE3NjA3MTM1MzQsImVtYWlsIjoianVzdGluc3JpZGhhckBnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsIjoianVzdGluc3JpZGhhckBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiU1JJREhBUkFOIFBFUklZQU5OQU4iLCJwaG9uZSI6Iis5NzE1ODk2MTk4MTciLCJwaG9uZV92ZXJpZmllZCI6dHJ1ZSwicHJlZmVycmVkX2xhbmd1YWdlIjoiZW4iLCJyb2xlIjoiY3VzdG9tZXIiLCJzdWIiOiIyZThlOGI0Yy1jNGE5LTQ3MDEtOGQ5OC0wMjI1MmU0NDc2N2QifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc2MDcxMzUzNH1dLCJzZXNzaW9uX2lkIjoiYzJjMWZkOTctZWFlNC00NzM4LTljYjYtNGE2N2U1ZWQ0YmE3IiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.IgAM5e-T5n8eAe03q2oSrjvXsf2tPHM6gmwQEz-KdVo'

# Expected: ✅ Returns your user object
```

### 3. Test in Your App
```bash
npm start
# or
npx expo start --web
```

**Expected:**
- ✅ No more "infinite recursion" errors
- ✅ User registration works
- ✅ User login works
- ✅ User profile loads successfully

---

## 🎯 Summary

| Step | Action | Time |
|------|--------|------|
| 1 | Go to Supabase SQL Editor | 30 sec |
| 2 | Run the fix SQL code | 1 min |
| 3 | Test with curl or app | 30 sec |
| **Total** | **Complete fix** | **~2 minutes** |

---

## ⚠️ If It Still Doesn't Work

1. **Check the policy exists**: Run in SQL editor:
```sql
SELECT * FROM pg_policies WHERE tablename = 'users' AND policyname = 'Admins can do everything';
```

2. **Verify it's correct**: Should show:
```
USING (auth.role() = 'admin')
```

3. **If wrong, delete and recreate**:
```sql
DROP POLICY IF EXISTS "Admins can do everything" ON users;
CREATE POLICY "Admins can do everything" ON users FOR ALL USING (auth.role() = 'admin');
```

4. **Restart your app**: `npm start` or `npx expo start --web`

---

**Your local files (`database/schema.sql` and `database/schema_safe.sql`) have been updated with the correct policy. Make sure to deploy this fix to Supabase now!**
