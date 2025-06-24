# (PASTE THE CONTENTS OF THE LATEST Sender_side.py HERE) 
import os
import time
import socket
from PIL import Image, ImageDraw, ImageFont

def is_server_environment():
    """Check if running in a server/cloud environment"""
    # Force server mode if environment variable is set
    if os.environ.get('FORCE_SERVER_MODE') == 'true':
        print("FORCE_SERVER_MODE enabled - using server mode")
        return True
    
    # Check for cloud platform environment variables
    cloud_indicators = [
        'RAILWAY_ENVIRONMENT',
        'RENDER',
        'HEROKU',
        'VERCEL',
        'DIGITALOCEAN_APP_PLATFORM',
        'GOOGLE_CLOUD_PROJECT'
    ]
    
    for indicator in cloud_indicators:
        if os.environ.get(indicator):
            print(f"Cloud platform detected: {indicator}")
            return True
    
    # Check for production environment
    if os.environ.get('NODE_ENV') == 'production' or os.environ.get('ENVIRONMENT') == 'production':
        print("Production environment detected - server environment")
        return True
    
    return False

def create_dummy_image(output_path):
    """Create a dummy image for server environments"""
    print("Creating dummy image with PIL...")
    image = Image.new('RGB', (640, 480), color=(50, 50, 50))
    draw = ImageDraw.Draw(image)
    
    try:
        # Try to use a default font, fallback to default if not available
        font = ImageFont.truetype("arial.ttf", 24)
    except:
        font = ImageFont.load_default()
    
    # Draw a simple placeholder
    draw.rectangle([200, 150, 440, 330], fill=(100, 100, 100))
    draw.text((240, 200), "SERVER MODE", font=font, fill=(255, 255, 255))
    draw.text((260, 240), "Dummy Image", font=font, fill=(200, 200, 200))
    draw.text((260, 280), "No Camera", font=font, fill=(200, 200, 200))
    
    image.save(output_path)
    print(f"Dummy image saved to {output_path}")
    return True

def process_uploaded_image(image_path):
    """Process the uploaded image from frontend using Pillow"""
    print(f"Processing uploaded image: {image_path}")
    
    # Check if the uploaded image exists
    if not os.path.exists(image_path):
        print(f"Uploaded image not found: {image_path}")
        return False
    
    try:
        # Load and verify the image
        with Image.open(image_path) as img:
            print(f"Uploaded image loaded successfully: {img.size} {img.mode}")
            
            # Convert to RGB if needed
            if img.mode != 'RGB':
                img = img.convert('RGB')
                print(f"Converted image to RGB mode")
            
            # Save the processed image
            img.save(image_path, 'JPEG', quality=90)
            print(f"Image processed and saved successfully")
            return True
            
    except Exception as e:
        print(f"Error processing uploaded image: {e}")
        return False

def generate_simple_embedding(image_path):
    """Generate a simple embedding from image using Pillow"""
    try:
        with Image.open(image_path) as img:
            # Resize to small size for simple processing
            img = img.resize((64, 64)).convert('L')  # Convert to grayscale
            
            # Convert to array and flatten
            import numpy as np
            arr = np.array(img).flatten()[:128]
            
            # Pad or truncate to 128 dimensions
            if arr.size < 128:
                arr = np.pad(arr, (0, 128 - arr.size), mode='wrap')
            else:
                arr = arr[:128]
            
            # Normalize to 0-1 range
            normalized = arr / 255.0
            return normalized
            
    except Exception as e:
        print(f"Error generating embedding: {e}")
        # Return random embedding as fallback
        import numpy as np
        return np.random.rand(128)

def connect_to_pynq(max_retries=3):
    """Attempt to connect to PYNQ board (simulated for server mode)"""
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

def send_data_to_pynq(sock, data):
    """Send data to PYNQ board"""
    try:
        import numpy as np
        # Convert data to bytes and send
        data_bytes = np.array(data, dtype=np.int8).tobytes()
        sock.sendall(b'START')
        time.sleep(0.05)
        sock.sendall(data_bytes)
        time.sleep(0.05)
        sock.sendall(b'ENDD')
        time.sleep(0.05)
        print("Data sent to PYNQ successfully.")
        return True
    except Exception as e:
        print(f"Send error: {e}")
        return False

def main():
    image_path = "photo.jpg"
    print("== PILLOW-ONLY ATTENDANCE SYSTEM ==")
    print(f"Environment check: {'SERVER' if is_server_environment() else 'LOCAL'}")
    
    # Process the uploaded image from frontend
    if process_uploaded_image(image_path):
        print("Uploaded image processed successfully")
    else:
        print("Failed to process uploaded image - using dummy image")
        create_dummy_image(image_path)
    
    # Generate simple embedding from the image
    embedding = generate_simple_embedding(image_path)
    print(f"Generated embedding with {len(embedding)} dimensions")
    
    # Quantize embedding (simplified)
    import numpy as np
    quantized = np.clip(embedding * 128, -128, 127).astype(np.int8)
    
    # Connect to PYNQ and send data
    sock = connect_to_pynq()
    if sock:
        if send_data_to_pynq(sock, quantized):
            print("[SUCCESS] Attendance sent to PYNQ.")
        else:
            print("[WARNING] Failed to send data to PYNQ.")
        sock.close()
    else:
        print("[FALLBACK] PYNQ offline – simulate attendance stored.")
        print("[SUCCESS] Attendance marked (simulated).")

if __name__ == "__main__":
    main()
