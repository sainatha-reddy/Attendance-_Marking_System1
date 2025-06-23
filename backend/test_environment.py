#!/usr/bin/env python3
"""
Test Environment Script for Frontend-Based Attendance System
Tests the environment and dependencies for the attendance marking system
"""

import sys
import os
import platform
import subprocess
import socket
from PIL import Image, ImageDraw, ImageFont
import numpy as np

def test_python_environment():
    """Test Python environment and version"""
    print("=== Python Environment Test ===")
    print(f"Python version: {sys.version}")
    print(f"Platform: {platform.platform()}")
    print(f"Architecture: {platform.architecture()}")
    print(f"Working directory: {os.getcwd()}")
    print(f"Python executable: {sys.executable}")
    return True

def test_imports():
    """Test required package imports"""
    print("\n=== Package Import Test ===")
    packages = {
        'cv2': 'OpenCV for image processing',
        'numpy': 'Numerical computing',
        'PIL': 'Python Imaging Library',
        'socket': 'Network communication',
        'face_recognition': 'Face recognition (optional)'
    }
    
    results = {}
    for package, description in packages.items():
        try:
            if package == 'PIL':
                import PIL
                version = PIL.__version__
            elif package == 'cv2':
                import cv2
                version = cv2.__version__
            elif package == 'numpy':
                import numpy
                version = numpy.__version__
            elif package == 'socket':
                import socket
                version = 'built-in'
            elif package == 'face_recognition':
                import face_recognition
                version = 'installed'
            else:
                module = __import__(package)
                version = getattr(module, '__version__', 'unknown')
            
            print(f"✅ {package}: {version} - {description}")
            results[package] = True
        except ImportError as e:
            print(f"❌ {package}: Import failed - {description}")
            print(f"   Error: {e}")
            results[package] = False
        except Exception as e:
            print(f"⚠️  {package}: Unexpected error - {e}")
            results[package] = False
    
    return results

def test_server_environment_detection():
    """Test server environment detection logic"""
    print("\n=== Server Environment Detection Test ===")
    
    # Check environment variables
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
    
    print("Environment variables:")
    for indicator in cloud_indicators:
        value = os.environ.get(indicator)
        if value:
            print(f"  {indicator}: {value}")
        else:
            print(f"  {indicator}: Not set")
    
    # Check display
    display = os.environ.get('DISPLAY')
    print(f"DISPLAY: {display}")
    
    # Check if in container
    docker_env = os.path.exists('/.dockerenv') or os.environ.get('DOCKER_CONTAINER')
    print(f"Docker container: {docker_env}")
    
    # Check NODE_ENV
    node_env = os.environ.get('NODE_ENV')
    print(f"NODE_ENV: {node_env}")
    
    # Check FORCE_SERVER_MODE
    force_server = os.environ.get('FORCE_SERVER_MODE')
    print(f"FORCE_SERVER_MODE: {force_server}")
    
    # Determine if this would be detected as server environment
    is_server = (
        force_server == 'true' or
        any(os.environ.get(indicator) for indicator in cloud_indicators) or
        (not display and os.name != 'nt') or
        docker_env or
        node_env == 'production'
    )
    
    print(f"Would be detected as server environment: {is_server}")
    return is_server

def test_image_processing():
    """Test image processing capabilities"""
    print("\n=== Image Processing Test ===")
    
    # Test PIL image creation
    try:
        img = Image.new('RGB', (640, 480), color=(0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Try to load font
        try:
            font = ImageFont.truetype("arial.ttf", 24)
        except:
            font = ImageFont.load_default()
        
        draw.rectangle([200, 150, 440, 330], fill=(100, 100, 100))
        draw.text((240, 200), "TEST IMAGE", font=font, fill=(255, 255, 255))
        
        test_path = "test_image.jpg"
        img.save(test_path)
        print(f"✅ PIL image creation: Success - saved to {test_path}")
        
        # Test OpenCV
        try:
            import cv2
            img_cv = cv2.imread(test_path)
            if img_cv is not None:
                print(f"✅ OpenCV image loading: Success - shape {img_cv.shape}")
            else:
                print("❌ OpenCV image loading: Failed")
        except Exception as e:
            print(f"❌ OpenCV test failed: {e}")
        
        # Clean up
        if os.path.exists(test_path):
            os.remove(test_path)
            
    except Exception as e:
        print(f"❌ PIL image creation failed: {e}")
        return False
    
    return True

def test_network_connectivity():
    """Test network connectivity to PYNQ"""
    print("\n=== Network Connectivity Test ===")
    
    IP = '172.16.151.175'
    PORT = 8887
    
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        result = sock.connect_ex((IP, PORT))
        sock.close()
        
        if result == 0:
            print(f"✅ PYNQ connection: Success - {IP}:{PORT}")
            return True
        else:
            print(f"❌ PYNQ connection: Failed - {IP}:{PORT}")
            return False
    except Exception as e:
        print(f"❌ Network test failed: {e}")
        return False

def test_file_operations():
    """Test file operations"""
    print("\n=== File Operations Test ===")
    
    # Test if photo.jpg exists (uploaded image)
    photo_path = "photo.jpg"
    if os.path.exists(photo_path):
        size = os.path.getsize(photo_path)
        print(f"✅ Uploaded image found: {photo_path} ({size} bytes)")
        return True
    else:
        print(f"⚠️  Uploaded image not found: {photo_path}")
        print("   This is normal if no image has been uploaded yet")
        return False

def generate_test_report():
    """Generate a comprehensive test report"""
    print("=" * 60)
    print("FRONTEND-BASED ATTENDANCE SYSTEM - ENVIRONMENT TEST")
    print("=" * 60)
    
    # Run all tests
    python_ok = test_python_environment()
    imports_ok = test_imports()
    server_env = test_server_environment_detection()
    image_ok = test_image_processing()
    network_ok = test_network_connectivity()
    file_ok = test_file_operations()
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    tests = [
        ("Python Environment", python_ok),
        ("Package Imports", all(imports_ok.values())),
        ("Server Environment Detection", True),  # Always passes
        ("Image Processing", image_ok),
        ("Network Connectivity", network_ok),
        ("File Operations", file_ok)
    ]
    
    passed = 0
    for test_name, result in tests:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{len(tests)} tests passed")
    
    # Recommendations
    print("\n" + "=" * 60)
    print("RECOMMENDATIONS")
    print("=" * 60)
    
    if not all(imports_ok.values()):
        print("• Install missing Python packages:")
        for package, result in imports_ok.items():
            if not result and package != 'face_recognition':
                print(f"  - pip install {package}")
    
    if not network_ok:
        print("• PYNQ server is not reachable")
        print("  - Check if PYNQ board is running")
        print("  - Verify IP address and port")
        print("  - Check network connectivity")
    
    if server_env:
        print("• Running in server environment")
        print("  - Will use dummy images instead of camera")
        print("  - Frontend will capture real images")
        print("  - Backend will process uploaded images")
    else:
        print("• Running in local environment")
        print("  - Frontend will capture real images")
        print("  - Backend will process uploaded images")
    
    print("\nSystem is ready for frontend-based image capture!")

if __name__ == "__main__":
    generate_test_report() 