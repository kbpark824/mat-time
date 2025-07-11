# API Configuration

This directory contains configuration for API endpoints and environment management.

## Usage

### Current Configuration
- **Production**: Uses production backend for all builds (default)
- **Local Development**: Can be enabled by changing `apiEnvironment` in `app.json`

### Switching Environments

#### Option 1: Use Production Backend (Current Setting)
```json
// app.json
"extra": {
  "apiEnvironment": "production"
}
```

#### Option 2: Use Local Backend for Development
```json
// app.json
"extra": {
  "apiEnvironment": "local"
}
```

#### Option 3: Automatic Environment Detection
```json
// app.json
"extra": {
  // Remove apiEnvironment to use automatic detection
  // Development builds → local backend
  // Production builds → production backend
}
```

### Available Endpoints
- `local`: `http://localhost:5001/api`
- `production`: `https://mat-time-production.up.railway.app/api`

### Adding New Environments
To add staging or other environments:

1. Add endpoint to `config/api.js`:
```javascript
const API_ENDPOINTS = {
  local: 'http://localhost:5001/api',
  staging: 'https://mat-time-staging.up.railway.app/api',
  production: 'https://mat-time-production.up.railway.app/api',
};
```

2. Set environment in `app.json`:
```json
"extra": {
  "apiEnvironment": "staging"
}
```

## Benefits
- ✅ No hardcoded IP addresses
- ✅ Centralized configuration
- ✅ Easy environment switching
- ✅ Team-friendly (each developer can configure independently)
- ✅ Build-time configuration (secure)
- ✅ Scalable to multiple environments