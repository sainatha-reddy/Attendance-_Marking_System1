# Use official Node.js LTS image
FROM node:18

# Install Python and pip
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    ln -s /usr/bin/python3 /usr/bin/python

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy Python requirements and install them
COPY requirements.txt ./

# Create a virtual environment
RUN python3 -m venv /opt/venv

# Activate the virtual environment and install requirements
RUN /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

# Make sure Python and pip from venv are used by default
ENV PATH="/opt/venv/bin:$PATH"

# Copy the rest of the app files
COPY . .

# Expose the backend port
EXPOSE 3001

# Start the Node.js server
CMD ["node", "server.js"]
