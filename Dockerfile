# Use official Python 3.10 slim image
FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    libgtk-3-dev \
    libboost-python-dev \
    python3-dev \
    nodejs \
    npm \
    && apt-get clean

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy Python requirements
COPY requirements.txt ./

# Create virtual environment
RUN python3 -m venv /opt/venv

# Upgrade pip and install requirements using venv pip directly
RUN /opt/venv/bin/pip install --upgrade pip \
 && /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

# Set environment to use venv by default
ENV PATH="/opt/venv/bin:$PATH"

# Copy the rest of the app files
COPY . .

# Expose backend port
EXPOSE 3001

# Start server
CMD ["node", "server.js"]
