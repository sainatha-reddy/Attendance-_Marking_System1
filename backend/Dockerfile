# Base Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system-level dependencies for Pillow, OpenCV, and Node
RUN apt-get update && apt-get install -y \
    build-essential \
    libjpeg-dev \
    zlib1g-dev \
    libpng-dev \
    libfreetype6-dev \
    libopenjp2-7-dev \
    libtiff-dev \
    libwebp-dev \
    libgl1 \
    libglib2.0-0 \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Node dependencies
COPY package*.json ./
RUN npm install

# Copy and install Python dependencies inside a virtual environment
COPY requirements.txt ./
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy application source code
COPY . .

# Expose application port
EXPOSE 3001

# Start the Node server
CMD ["node", "server.js"] 