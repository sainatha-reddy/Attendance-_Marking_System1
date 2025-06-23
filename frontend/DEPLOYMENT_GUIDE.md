# Deployment Guide - Attendance Marking System

## How It Works

The attendance marking system works as follows:

1. **Frontend**: User clicks "Mark Attendance" button
2. **Backend**: Receives the request and triggers the Python script
3. **Python Script**: Automatically captures image using OpenCV and processes attendance
4. **Result**: Attendance is marked and user is redirected back

## Issues Fixed

1. **Simplified Frontend**: No camera permissions needed in browser
2. **Backend Integration**: Proper communication with Python script
3. **Error Handling**: Clear error messages for different scenarios
4. **User Experience**: Clean UI with loading states and success feedback

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=https://your-railway-app.railway.app
```

## Vercel Deployment

1. **Environment Variables**: Set `VITE_API_URL` in Vercel dashboard
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Install Command**: `npm install`

## Railway Deployment

1. **Environment Variables**: Set `VITE_API_URL` in Railway dashboard
2. **Build Command**: `npm run build`
3. **Start Command**: `npm run preview`

## Backend Requirements

The backend needs:
- Python 3.x
- OpenCV (`cv2`)
- face_recognition library
- numpy
- PIL (Pillow)

## Troubleshooting

### If attendance marking doesn't work:

1. **Check Backend Logs**: Look for Python script execution errors
2. **Camera Access**: Ensure the server has camera access
3. **Dependencies**: Verify all Python packages are installed
4. **Network**: Check if PYNQ server is accessible (if using)

### Common Issues:

1. **Python Not Found**: Ensure Python is installed and in PATH
2. **Missing Dependencies**: Install required Python packages
3. **Camera Access**: Server needs camera permissions
4. **CORS**: Backend must allow requests from your frontend domain

## Testing

1. Visit your deployed site
2. Click "Mark Attendance"
3. Wait for processing (no camera permission needed)
4. Verify success message and redirect

## Security Considerations

- No camera permissions needed in browser
- Image capture happens server-side
- Proper error handling and validation
- Secure communication between frontend and backend

## Browser Compatibility

- All modern browsers supported
- No special camera permissions required
- Works on mobile and desktop

## Mobile Considerations

- Responsive design for all screen sizes
- Touch-friendly interface
- Fast loading and processing 