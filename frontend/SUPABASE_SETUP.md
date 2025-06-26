# Supabase Setup Guide for Admin Page

## Prerequisites
- Supabase account and project
- Firebase project (for authentication)

## Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

## Step 2: Create Storage Bucket
1. In your Supabase dashboard, go to Storage
2. Create a new bucket named `attendance-images`
3. Set the bucket to public (for image access)
4. Enable Row Level Security (RLS)

## Step 3: Configure Storage Policies
Run these SQL commands in your Supabase SQL editor:

```sql
-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow public read access to images
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'attendance-images');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE USING (auth.role() = 'authenticated');
```

## Step 4: Environment Variables
Create a `.env` file in the frontend directory with:

```env
# Firebase Configuration (for Authentication and Firestore)
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Supabase Configuration (for Image Storage)
VITE_SUPABASE_URL=https://your_project_id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Step 5: Test the Setup
1. Start your development server
2. Navigate to the admin page
3. Try uploading an image
4. Verify the image appears in your Supabase storage bucket

## Troubleshooting
- **Upload fails**: Check bucket permissions and RLS policies
- **Images not loading**: Verify bucket is set to public
- **Authentication errors**: Check Firebase configuration
- **Environment variables**: Ensure all variables are set correctly 