#!/usr/bin/env python3
"""
Test script to check environment detection and camera availability
"""
import os
import sys
import cv2
from PIL import Image, ImageDraw, ImageFont

def test_environment():
    print("=== ENVIRONMENT TEST ===")
    
    # Check environment variables
    env_vars = [
        'RAILWAY_ENVIRONMENT',
        'RENDER', 
        'HEROKU',
        'VERCEL',
        'NETLIFY',
        'DIGITALOCEAN_APP_PLATFORM',
        'AWS_LAMBDA_FUNCTION_NAME',
        'GOOGLE_CLOUD_PROJECT',
        'NODE_ENV',
        'ENVIRONMENT',
        'DISPLAY'
    ]
    
    print("Environment Variables:")
    for var in env_vars:
        value = os.environ.get(var)
        if value:
            print(f"  {var}: {value}")
        else:
            print(f"  {var}: Not set")
    
    # Check for Docker
    if os.path.exists('/.dockerenv'):
        print("  /.dockerenv: EXISTS (Docker container)")
    else:
        print("  /.dockerenv: Not found")
    
    # Check OS
    print(f"OS: {os.name}")
    print(f"Platform: {sys.platform}")
    
    # Test camera
    print("\n=== CAMERA TEST ===")
    try:
        cap = cv2.VideoCapture(0)
        if cap.isOpened():
            print("✅ Camera is available")
            ret, frame = cap.read()
            if ret and frame is not None:
                print("✅ Camera can capture frames")
                print(f"   Frame shape: {frame.shape}")
            else:
                print("❌ Camera cannot capture frames")
            cap.release()
        else:
            print("❌ Camera is not available")
    except Exception as e:
        print(f"❌ Camera test failed: {e}")
    
    # Test PIL
    print("\n=== PIL TEST ===")
    try:
        img = Image.new('RGB', (100, 100), color='red')
        print("✅ PIL is working")
    except Exception as e:
        print(f"❌ PIL test failed: {e}")
    
    # Test OpenCV
    print("\n=== OPENCV TEST ===")
    try:
        print(f"OpenCV version: {cv2.__version__}")
        print("✅ OpenCV is working")
    except Exception as e:
        print(f"❌ OpenCV test failed: {e}")

if __name__ == "__main__":
    test_environment() 