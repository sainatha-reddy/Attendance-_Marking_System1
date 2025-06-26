# Docker Setup for Attendance Backend

This document provides instructions for running the attendance marking system backend using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (usually comes with Docker Desktop)
- Supabase project credentials

## Quick Start

### 1. Environment Setup

Copy the example environment file and configure it:

```bash
cp env.example .env
```

Edit `.env` file with your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
SUPABASE_BUCKET=attendance-images
```

### 2. Build and Run with Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# Stop the container
docker-compose down
```

### 3. Build and Run with Docker directly

```bash
# Build the image
docker build -t attendance-backend .

# Run the container
docker run -p 3001:3001 \
  -e SUPABASE_URL=https://your-project.supabase.co \
  -e SUPABASE_KEY=your-service-role-key \
  -e SUPABASE_BUCKET=attendance-images \
  attendance-backend
```

## API Endpoints

Once running, the backend will be available at `http://localhost:3001` with the following endpoints:

- `GET /health` - Health check endpoint
- `POST /api/mark-attendance` - Mark attendance with face recognition
- `POST /upload-image` - Upload reference image
- `POST /compare-image` - Compare two images

## Docker Features

### Multi-stage Build
- Uses Python 3.9 slim image for smaller size
- Installs system dependencies for face recognition
- Optimized layer caching

### Security
- Runs as non-root user
- Minimal attack surface
- Secure environment variables

### Health Checks
- Automatic health monitoring
- Restart policy for reliability
- Health endpoint for monitoring

### Volume Mounting
- Attendance records persisted to host
- Easy backup and data access

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | Required |
| `SUPABASE_KEY` | Your Supabase service role key | Required |
| `SUPABASE_BUCKET` | Storage bucket name | `attendance-images` |
| `FLASK_ENV` | Flask environment | `production` |

## Troubleshooting

### Build Issues

1. **Memory issues during build**
   ```bash
   # Increase Docker memory limit or use swap
   docker build --memory=4g -t attendance-backend .
   ```

2. **Network issues**
   ```bash
   # Use different DNS
   docker build --dns 8.8.8.8 -t attendance-backend .
   ```

### Runtime Issues

1. **Container won't start**
   ```bash
   # Check logs
   docker-compose logs backend
   
   # Check environment variables
   docker-compose config
   ```

2. **Face recognition not working**
   - Ensure all system dependencies are installed
   - Check if the container has enough memory
   - Verify image format compatibility

### Performance Optimization

1. **Reduce image size**
   ```bash
   # Use multi-stage build (already implemented)
   docker build --target production -t attendance-backend .
   ```

2. **Optimize for production**
   ```bash
   # Use production build
   docker-compose -f docker-compose.prod.yml up
   ```

## Production Deployment

For production deployment, consider:

1. **Using a reverse proxy** (nginx, traefik)
2. **Setting up SSL/TLS certificates**
3. **Implementing proper logging**
4. **Setting up monitoring and alerting**
5. **Using secrets management** for sensitive data

### Example Production Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3001:3001"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_KEY=${SUPABASE_KEY}
      - SUPABASE_BUCKET=${SUPABASE_BUCKET}
      - FLASK_ENV=production
    volumes:
      - ./logs:/app/logs
      - ./attendance_records.json:/app/attendance_records.json
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## Development

For development, you can override the Dockerfile:

```bash
# Use development Dockerfile
docker build -f Dockerfile.dev -t attendance-backend-dev .

# Run with development settings
docker run -p 3001:3001 \
  -e FLASK_ENV=development \
  -v $(pwd):/app \
  attendance-backend-dev
```

## Monitoring

Check container health:

```bash
# View health status
docker inspect attendance-backend | grep Health -A 10

# View logs
docker-compose logs -f backend

# Monitor resource usage
docker stats attendance-backend
``` 