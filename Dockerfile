# Use official Node.js LTS image
FROM node:18

# Install Python, pip, venv support, and system dependencies for dlib
RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    python3-full \
    build-essential \
    cmake \
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    libgtk-3-dev \
    libboost-python-dev \
    && ln -s /usr/bin/python3 /usr/bin/python

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy Python requirements
COPY requirements.txt ./

# Create a virtual environment
RUN python3 -m venv /opt/venv

# Activate virtual environment and install requirements
RUN . /opt/venv/bin/activate && pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Make sure Python and pip from venv are used by default
ENV PATH="/opt/venv/bin:$PATH"

# Copy the rest of the app files
COPY . .

# Expose the backend port
EXPOSE 3001

# Start the Node.js server
CMD ["node", "server.js"]
