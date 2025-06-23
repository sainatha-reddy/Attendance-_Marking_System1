# (PASTE THE CONTENTS OF THE LATEST Sender_side.py HERE) 
import numpy as np
import socket
import time
import sys
import os
from PIL import Image, ImageDraw, ImageFont
import cv2

def is_server_environment():
    """Enhanced server environment detection for cloud platforms"""
    # Force server mode if FORCE_SERVER_MODE environment variable is set
    if os.environ.get('FORCE_SERVER_MODE') == 'true':
        print("FORCE_SERVER_MODE enabled - using server mode")
        return True
    
    # Check for common cloud platform environment variables
    cloud_indicators = [
        'RAILWAY_ENVIRONMENT',
        'RENDER',
        'HEROKU',
        'VERCEL',
        'NETLIFY',
        'DIGITALOCEAN_APP_PLATFORM',
        'AWS_LAMBDA_FUNCTION_NAME',
        'GOOGLE_CLOUD_PROJECT'
    ]
    
    # Check if any cloud platform environment variables exist
    for indicator in cloud_indicators:
        if os.environ.get(indicator):
            print(f"Cloud platform detected: {indicator}")
            return True
    
    # Check for display (traditional server detection)
    if not os.environ.get('DISPLAY') and os.name != 'nt':
        print("No display detected - server environment")
        return True
    
    # Check if we're in a containerized environment
    if os.path.exists('/.dockerenv') or os.environ.get('DOCKER_CONTAINER'):
        print("Docker container detected - server environment")
        return True
    
    # Check for common server environment variables
    if os.environ.get('NODE_ENV') == 'production' or os.environ.get('ENVIRONMENT') == 'production':
        print("Production environment detected - server environment")
        return True
    
    # Check if we're running on a cloud platform by checking hostname
    import socket
    hostname = socket.gethostname()
    cloud_hostnames = ['railway', 'render', 'heroku', 'vercel', 'netlify', 'aws', 'google']
    if any(cloud_name in hostname.lower() for cloud_name in cloud_hostnames):
        print(f"Cloud hostname detected: {hostname}")
        return True
    
    return False

def create_dummy_image_pil(output_path):
    print("Creating dummy image with PIL...")
    image = Image.new('RGB', (640, 480), color=(0, 0, 0))
    draw = ImageDraw.Draw(image)
    try:
        font = ImageFont.truetype("arial.ttf", 24)
    except:
        font = ImageFont.load_default()
    draw.rectangle([200, 150, 440, 330], fill=(100, 100, 100))
    draw.text((240, 200), "SERVER MODE", font=font, fill=(255, 255, 255))
    draw.text((260, 240), "Dummy Image", font=font, fill=(200, 200, 200))
    draw.text((260, 280), "No Camera", font=font, fill=(200, 200, 200))
    image.save(output_path)
    print(f"Image saved to {output_path}")
    return True

def process_uploaded_image(image_path):
    """Process the uploaded image from frontend"""
    print(f"Processing uploaded image: {image_path}")
    
    # Check if the uploaded image exists
    if not os.path.exists(image_path):
        print(f"Uploaded image not found: {image_path}")
        return False
    
    try:
        # Load the image to verify it's valid
        with Image.open(image_path) as img:
            print(f"Uploaded image loaded successfully: {img.size} {img.mode}")
        
        # Convert to OpenCV format for processing
        img_cv = cv2.imread(image_path)
        if img_cv is None:
            print("Failed to load image with OpenCV")
            return False
        
        print(f"Image processed successfully: {img_cv.shape}")
        return True
        
    except Exception as e:
        print(f"Error processing uploaded image: {e}")
        return False

def generate_pseudo_embedding(image_path):
    """Use PIL image bytes to generate deterministic pseudo-embedding"""
    try:
        with Image.open(image_path) as img:
            img = img.resize((64, 64)).convert('L')
            arr = np.array(img).flatten()[:128]
            if arr.size < 128:
                arr = np.pad(arr, (0, 128 - arr.size), mode='wrap')
            normalized = arr / 255.0
            return normalized
    except Exception as e:
        print(f"Error generating pseudo embedding: {e}")
        return np.random.rand(128)

def quantize_embedding(embedding):
    return np.clip(embedding * 128, -128, 127).astype(np.int8)

def send_stream(socket_conn, quantized_embedding):
    try:
        socket_conn.sendall(b'START')
        time.sleep(0.05)
        socket_conn.sendall(quantized_embedding.tobytes())
        time.sleep(0.05)
        socket_conn.sendall(b'ENDD')
        time.sleep(0.05)
        print("Stream sent to PYNQ.")
        return True
    except Exception as e:
        print(f"Send error: {e}")
        return False

def connect_to_pynq(max_retries=3):
    IP = '172.16.151.175'
    PORT = 8887
    for attempt in range(max_retries):
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(5)
            sock.connect((IP, PORT))
            print(f"[OK] Connected to PYNQ {IP}:{PORT}")
            return sock
        except Exception as e:
            print(f"[{attempt+1}] Connect failed: {e}")
            time.sleep(2)
    return None

def main():
    image_path = "photo.jpg"
    print("== FRONTEND-BASED FACE ATTENDANCE ==")
    print(f"Environment check: {'SERVER' if is_server_environment() else 'LOCAL'}")
    
    # Process the uploaded image from frontend
    if process_uploaded_image(image_path):
        print("Uploaded image processed successfully")
    else:
        print("Failed to process uploaded image - using dummy image")
        create_dummy_image_pil(image_path)
    
    # Generate embedding from the image (uploaded or dummy)
    embedding = generate_pseudo_embedding(image_path)
    quantized = quantize_embedding(embedding)
    
    # Connect to PYNQ and send data
    sock = connect_to_pynq()
    if sock:
        send_stream(sock, quantized)
        sock.close()
        print("[SUCCESS] Attendance sent.")
    else:
        print("[FALLBACK] PYNQ offline – simulate attendance stored.")

if __name__ == "__main__":
    main()
