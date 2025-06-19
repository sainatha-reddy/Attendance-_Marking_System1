# Base image
FROM python:3.10-slim

# Install system packages for OpenCV and Pillow
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    nodejs \
    npm

# Set working directory
WORKDIR /app

# Node setup
COPY package*.json ./
RUN npm install

# Python setup
COPY requirements.txt ./
RUN python3 -m venv /opt/venv
RUN /opt/venv/bin/pip install --upgrade pip && /opt/venv/bin/pip install -r requirements.txt
ENV PATH="/opt/venv/bin:$PATH"

# App source
COPY . .

# Expose and run
EXPOSE 3001
CMD ["node", "server.js"]
