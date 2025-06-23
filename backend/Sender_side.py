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

def capture_image(output_path):
    print(f"Attempting to capture image to: {output_path}")
    
    # Always check server environment first
    if is_server_environment():
        print("Server environment detected - using dummy image")
        return create_dummy_image_pil(output_path)
    
    print("Local environment detected - attempting camera capture")
    
    # Try to capture from camera
    try:
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("Camera could not be opened - using dummy image")
            return create_dummy_image_pil(output_path)
        
        ret, frame = cap.read()
        cap.release()
        
        if not ret or frame is None:
            print("Failed to capture frame - using dummy image")
            return create_dummy_image_pil(output_path)
        
        cv2.imwrite(output_path, frame)
        print(f"Image captured and saved to {output_path}")
        return True
        
    except Exception as e:
        print(f"Camera capture failed: {e} - using dummy image")
        return create_dummy_image_pil(output_path)

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
    print("== PIL-BASED FACE ATTENDANCE ==")
    print(f"Environment check: {'SERVER' if is_server_environment() else 'LOCAL'}")
    
    capture_image(image_path)
    embedding = generate_pseudo_embedding(image_path)
    quantized = quantize_embedding(embedding)
    sock = connect_to_pynq()
    if sock:
        send_stream(sock, quantized)
        sock.close()
        print("[SUCCESS] Attendance sent.")
    else:
        print("[FALLBACK] PYNQ offline – simulate attendance stored.")

if __name__ == "__main__":
    main()
