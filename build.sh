#!/bin/bash

echo "🚀 Starting build process..."

# Install system dependencies if running on Linux
if [ "$(uname)" == "Linux" ]; then
    echo "🔧 Installing system dependencies..."
    apt-get update -y || true
    apt-get install -y --no-install-recommends \
        build-essential \
        cmake \
        pkg-config \
        python3-dev \
        python3-pip \
        python3-setuptools \
        python3-wheel \
        gcc \
        g++ || true
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Ensure pip is up to date
echo "🔄 Updating pip..."
python3 -m pip install --upgrade pip setuptools wheel

# Install Python dependencies with pre-built wheels where possible
echo "🐍 Installing Python dependencies..."
python3 -m pip install --no-cache-dir -r requirements.txt || \
python -m pip install --no-cache-dir -r requirements.txt || \
echo "⚠️  Python package installation had issues, but continuing..."

# Verify critical packages
echo "🔍 Verifying Python packages..."
python3 -c "import cv2; print('✅ OpenCV imported successfully')" || \
echo "⚠️  OpenCV verification failed"

python3 -c "import dlib; print('✅ dlib imported successfully')" || \
echo "⚠️  dlib verification failed"

python3 -c "import face_recognition; print('✅ face_recognition imported successfully')" || \
echo "⚠️  face_recognition verification failed"

echo "✅ Build process completed!" 