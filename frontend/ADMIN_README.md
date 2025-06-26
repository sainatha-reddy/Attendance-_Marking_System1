# Admin Dashboard - Attendance Management System

## Overview
The Admin Dashboard provides comprehensive image management capabilities for the IIITDM Attendance System. It allows authorized administrators to upload, manage, edit, and delete reference images used for facial recognition.

## Technology Stack
- **Authentication**: Firebase Authentication
- **Image Storage**: Supabase Storage
- **Metadata Storage**: Firebase Firestore
- **Frontend**: React with TypeScript

## Access Control
- **Admin Access**: Only users with emails containing 'admin', 'faculty', 'prof', or 'dr.' can access the admin dashboard
- **Domain Restriction**: Access is limited to @iiitdm.ac.in email addresses
- **Automatic Redirect**: Non-admin users are automatically redirected to the home page

## Features

### 1. Image Upload
- **File Upload**: Support for all common image formats (JPG, PNG, GIF, etc.)
- **Metadata Management**: Add names and descriptions to uploaded images
- **Supabase Storage**: Images are stored in Supabase Storage bucket 'attendance-images'
- **Firestore Metadata**: Image metadata stored in Firebase Firestore
- **Unique Naming**: Automatic generation of unique IDs for uploaded images

### 2. Image Management
- **Grid View**: Visual display of all uploaded images
- **Search Functionality**: Search images by name or description
- **Sorting**: Images are sorted by upload date (newest first)
- **Metadata Display**: Shows upload date, uploader, and description

### 3. Image Editing
- **Inline Editing**: Edit image names and descriptions without re-uploading
- **Real-time Updates**: Changes are immediately reflected in the database
- **Validation**: Form validation ensures data integrity

### 4. Image Deletion
- **Confirmation Dialog**: Prevents accidental deletions
- **Complete Removal**: Deletes both the image file from Supabase and database record from Firestore
- **Cascade Cleanup**: Removes from both Supabase Storage and Firebase Firestore

## User Interface

### Tab Navigation
- **Upload Image**: Form for uploading new images or editing existing ones
- **Manage Images**: Grid view of all uploaded images with management options

### Responsive Design
- **Mobile Friendly**: Optimized for all screen sizes
- **Modern UI**: Clean, professional interface with smooth animations
- **Accessibility**: Proper contrast and keyboard navigation support

## Technical Implementation

### Supabase Integration
- **Storage Bucket**: Images stored in 'attendance-images' bucket
- **Public URLs**: Automatic generation of public URLs for image access
- **File Organization**: Images organized in 'images/' directory with unique filenames
- **Error Handling**: Comprehensive error handling for upload/delete operations

### Firebase Integration
- **Authentication**: User authentication and role verification
- **Firestore**: Metadata storage in 'images' collection
- **Security**: Firebase security rules protect against unauthorized access

### State Management
- **React Hooks**: Uses useState and useEffect for state management
- **Real-time Updates**: Automatic refresh after operations
- **Error Handling**: Comprehensive error handling with user notifications

### Data Structure
```typescript
interface ImageData {
  id: string;           // Unique identifier
  url: string;          // Supabase public URL
  name: string;         // Display name
  uploadedAt: Date;     // Upload timestamp
  uploadedBy: string;   // Uploader's email
  description?: string; // Optional description
  supabasePath?: string; // Supabase storage path
}
```

## Environment Variables Required

### Supabase Configuration
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Firebase Configuration
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

## Supabase Setup Requirements

### Storage Bucket Configuration
1. Create a storage bucket named 'attendance-images' in your Supabase project
2. Set bucket permissions to allow authenticated users to upload
3. Configure public access for image retrieval

### Storage Policies (Recommended)
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

## Usage Instructions

### For Administrators
1. **Access**: Click the "Admin Dashboard" card on the home page (only visible to admin users)
2. **Upload Images**: 
   - Navigate to the "Upload Image" tab
   - Enter a name for the image
   - Select an image file
   - Add an optional description
   - Click "Upload Image"
3. **Manage Images**:
   - Navigate to the "Manage Images" tab
   - Use the search bar to find specific images
   - Click "Edit" to modify image details
   - Click "Delete" to remove images
4. **Edit Images**:
   - Click "Edit" on any image
   - Modify the name and/or description
   - Click "Update Image" to save changes
   - Click "Cancel" to discard changes

### Security Considerations
- **Role-based Access**: Only authorized users can access admin features
- **Input Validation**: All user inputs are validated
- **File Type Restrictions**: Only image files are accepted
- **Size Limits**: Consider implementing file size limits for production
- **Supabase Security**: Proper bucket policies and authentication

## Future Enhancements
- **Bulk Operations**: Upload and manage multiple images at once
- **Image Preview**: Enhanced image preview with zoom and rotation
- **Categories**: Organize images by categories or tags
- **Analytics**: Track image usage and performance metrics
- **Backup**: Automated backup and recovery features
- **Image Processing**: Automatic image optimization and resizing

## Troubleshooting
- **Upload Failures**: Check Supabase configuration and bucket permissions
- **Access Denied**: Ensure you're using an authorized email address
- **Image Not Loading**: Verify Supabase bucket configuration and public access
- **Search Issues**: Clear search terms and try again
- **Supabase Errors**: Check browser console for detailed error messages

## Support
For technical support or feature requests, contact the development team or refer to the main project documentation. 