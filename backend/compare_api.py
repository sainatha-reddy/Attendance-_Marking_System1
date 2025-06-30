import os
from flask import Flask, request, jsonify
import tempfile
import face_recognition
from supabase import create_client, Client
from dotenv import load_dotenv
import warnings
from datetime import datetime
import json

from flask_cors import CORS

warnings.filterwarnings("ignore", category=UserWarning)
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["https://attendance-marking-system1.vercel.app", "http://localhost:5173", "http://localhost:3000"], 
     methods=["GET", "POST", "OPTIONS"], 
     allow_headers=["Content-Type", "Authorization"])

# Supabase config
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://your-project.supabase.co')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY', 'your-service-role-key')
BUCKET_NAME = os.environ.get('SUPABASE_BUCKET', 'attendance-images')

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Local storage for attendance records
ATTENDANCE_FILE = 'attendance_records.json'

def save_attendance_record(record):
    """Save attendance record to local JSON file"""
    try:
        records = []
        if os.path.exists(ATTENDANCE_FILE):
            with open(ATTENDANCE_FILE, 'r') as f:
                records = json.load(f)
        
        records.append(record)
        
        with open(ATTENDANCE_FILE, 'w') as f:
            json.dump(records, f, indent=2, default=str)
            
        print(f"Attendance record saved locally: {record['status']}")
    except Exception as e:
        print(f"Error saving attendance record: {e}")

@app.route('/api/mark-attendance', methods=['POST'])
def mark_attendance():
    """
    Mark attendance by comparing captured image with reference image
    """
    try:
        if 'image' not in request.files:
            return jsonify({'success': False, 'message': 'No image provided'}), 400
        
        # Get the uploaded image
        uploaded_file = request.files['image']
        
        # Get user information from request headers or form data
        user_email = request.form.get('user_email', 'unknown@example.com')
        user_name = request.form.get('user_name', 'Unknown User')
        
        # Extract unique ID from the first word of the user's name (e.g., CS23I1010), normalized to lowercase
        if user_name and len(user_name.split()) > 0:
            unique_id = user_name.split()[0].lower()
        else:
            unique_id = user_email.split('@')[0].lower()
        
        # First, try to get the reference image from Supabase
        try:
            ref_filename = f"images/{unique_id}.jpg"
            
            # Download reference image from Supabase Storage
            ref_bytes = supabase.storage.from_(BUCKET_NAME).download(ref_filename)
            
            # Save reference image to temp file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as ref_temp:
                ref_temp.write(ref_bytes)
                ref_image_path = ref_temp.name
            
        except Exception as e:
            return jsonify({
                'success': False, 
                'message': 'Reference image not found. Please contact admin to upload your reference image.',
                'status': 'absent'
            }), 404
        
        # Save uploaded image to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as up_temp:
            uploaded_file.save(up_temp.name)
            uploaded_image_path = up_temp.name
        
        # Load images and compute face encodings
        try:
            ref_img = face_recognition.load_image_file(ref_image_path)
            up_img = face_recognition.load_image_file(uploaded_image_path)
            
            ref_encodings = face_recognition.face_encodings(ref_img)
            up_encodings = face_recognition.face_encodings(up_img)
            
            if not ref_encodings:
                return jsonify({
                    'success': False, 
                    'message': 'No face detected in reference image',
                    'status': 'absent'
                }), 400
                
            if not up_encodings:
                return jsonify({
                    'success': False, 
                    'message': 'No face detected in captured image. Please ensure your face is clearly visible.',
                    'status': 'absent'
                }), 400
            
            ref_encoding = ref_encodings[0]
            up_encoding = up_encodings[0]
            
            # Calculate face distance (lower = more similar)
            distance = face_recognition.face_distance([ref_encoding], up_encoding)[0]
            
            # Threshold for face matching (0.6 is standard, lower = stricter)
            threshold = 0.6
            match = distance < threshold
            
            # Save attendance record locally
            attendance_status = 'present' if match else 'absent'
            
            attendance_data = {
                'user_email': user_email,
                'user_name': user_name,
                'unique_id': unique_id,
                'status': attendance_status,
                'timestamp': datetime.now().isoformat(),
                'face_distance': float(distance),
                'threshold': threshold,
                'match': bool(match)
            }
            
            save_attendance_record(attendance_data)
            
            # Save captured image to Supabase for record keeping
            try:
                captured_filename = f"attendance_captures/{unique_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
                supabase.storage.from_(BUCKET_NAME).upload(captured_filename, uploaded_file)
            except Exception as storage_error:
                pass
            
            return jsonify({
                'success': True,
                'message': f"Attendance marked successfully! Status: {attendance_status.upper()}",
                'status': attendance_status,
                'face_distance': float(distance),
                'threshold': threshold,
                'match': bool(match)
            })
            
        except Exception as e:
            return jsonify({
                'success': False, 
                'message': f'Face recognition error: {str(e)}',
                'status': 'absent'
            }), 500
            
        finally:
            # Clean up temp files
            try:
                os.remove(ref_image_path)
                os.remove(uploaded_image_path)
            except:
                pass
                
    except Exception as e:
        return jsonify({
            'success': False, 
            'message': f'Server error: {str(e)}',
            'status': 'absent'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for Docker"""
    return jsonify({'status': 'healthy', 'service': 'attendance-backend'}), 200

@app.route('/upload-image', methods=['POST'])
def upload_image():
    if 'image' not in request.files or 'unique_id' not in request.form:
        return jsonify({'error': 'Missing image or unique_id'}), 400
    uploaded_file = request.files['image']
    unique_id = request.form['unique_id']
    filename = f"images/{unique_id}.jpg"
    # Upload image to Supabase Storage
    res = supabase.storage.from_(BUCKET_NAME).upload(filename, uploaded_file)
    if hasattr(res, 'error') and res.error:
        return jsonify({'error': str(res.error)}), 500
    return jsonify({'message': 'Image uploaded', 'filename': filename})

@app.route('/compare-image', methods=['POST'])
def compare_image():
    if 'image' not in request.files or 'unique_id' not in request.form:
        return jsonify({'error': 'Missing image or unique_id'}), 400
    uploaded_file = request.files['image']
    unique_id = request.form['unique_id']
    filename = f"images/{unique_id}.jpg"

    # Download reference image from Supabase Storage
    try:
        ref_bytes = supabase.storage.from_(BUCKET_NAME).download(filename)
    except Exception as e:
        return jsonify({'error': f'Reference image not found: {e}'}), 404
    with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as ref_temp:
        ref_temp.write(ref_bytes)
        ref_image_path = ref_temp.name

    # Save uploaded image to temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as up_temp:
        uploaded_file.save(up_temp.name)
        uploaded_image_path = up_temp.name

    # Load images and compute face encodings
    try:
        ref_img = face_recognition.load_image_file(ref_image_path)
        up_img = face_recognition.load_image_file(uploaded_image_path)
        ref_encodings = face_recognition.face_encodings(ref_img)
        up_encodings = face_recognition.face_encodings(up_img)
        if not ref_encodings or not up_encodings:
            return jsonify({'error': 'Face not detected in one or both images'}), 400
        ref_encoding = ref_encodings[0]
        up_encoding = up_encodings[0]
        distance = face_recognition.face_distance([ref_encoding], up_encoding)[0]
        match = distance < 0.5
        return jsonify({'match': bool(match), 'distance': float(distance)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        os.remove(ref_image_path)
        os.remove(uploaded_image_path)

@app.route('/test', methods=['GET', 'POST'])
def test():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=8080) 