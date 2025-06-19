# Base image
FROM python:3.10-slim

# Install system packages + new cmake
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    wget \
    python3-dev \
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    libgtk-3-dev \
    libboost-python-dev \
    nodejs \
    npm && \
    wget https://github.com/Kitware/CMake/releases/download/v3.26.4/cmake-3.26.4-linux-x86_64.sh && \
    mkdir /opt/cmake && \
    sh cmake-3.26.4-linux-x86_64.sh --skip-license --prefix=/opt/cmake && \
    ln -sf /opt/cmake/bin/cmake /usr/bin/cmake

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
