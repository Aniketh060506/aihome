# CyberAI BYOK Assistant - Setup Guide

## Overview
CyberAI is a Bring Your Own Key (BYOK) cybersecurity learning assistant that allows you to use your own API keys from OpenAI, Anthropic, or Google to chat with AI models about cybersecurity topics.

## Quick Start

### Prerequisites
- Backend services (FastAPI, MongoDB)
- Frontend services (React)
- Internet connection for API calls

### Running the Application

#### Option 1: Using Supervisor (Recommended - Already Running)
All services are managed by supervisor and should be running automatically.

Check service status:
```bash
sudo supervisorctl status
```

Restart all services:
```bash
sudo supervisorctl restart all
```

Restart individual services:
```bash
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
```

#### Option 2: Manual Setup (For Desktop/Local Development)

**Backend Setup:**
```bash
cd /app/backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Frontend Setup:**
```bash
cd /app/frontend
yarn install
yarn start
```

**MongoDB:**
Make sure MongoDB is running on localhost:27017

## Using the Application

### 1. Add Your API Key

1. Click the **Settings** icon (gear) in the top sidebar
2. Enter a name for your key (e.g., "My OpenAI Key")
3. Paste your API key:
   - **OpenAI**: Starts with `sk-proj-` or `sk-`
   - **Anthropic**: Starts with `sk-ant-`
   - **Google**: Starts with `AIza`
4. The system will auto-detect the provider and available models
5. Click **Add API Key**

### 2. Start Chatting

1. Return to the main chat interface
2. Click **New Chat** to create a conversation
3. Select a model from the dropdown (e.g., gpt-4o, claude-3-opus, gemini-pro)
4. Type your cybersecurity question in the input box
5. Press **Enter** or click the **Send** button

### 3. Features

- **Multiple Conversations**: Create and manage multiple chat sessions
- **Model Selection**: Choose from available models for your provider
- **Dark Mode**: Toggle between light and dark themes
- **Session Management**: Conversations are saved in your browser
- **BYOK**: Your API keys are stored locally - never sent to our servers

## Supported Providers & Models

### OpenAI
- gpt-4o
- gpt-4-turbo
- gpt-4
- gpt-3.5-turbo
- gpt-4o-mini

### Anthropic
- claude-3-opus-20240229
- claude-3-sonnet-20240229
- claude-3-haiku-20240307
- claude-3-5-sonnet-20241022

### Google
- gemini-pro
- gemini-1.5-pro
- gemini-1.5-flash
- gemini-2.0-flash

## Troubleshooting

### Services Not Running
```bash
sudo supervisorctl status
sudo supervisorctl restart all
```

### Backend Connection Errors
1. Check if backend is running: `curl http://localhost:8001/api/`
2. Check backend logs: `tail -f /var/log/supervisor/backend.err.log`
3. Verify MongoDB is running: `sudo supervisorctl status mongodb`

### Frontend Not Loading
1. Check frontend logs: `tail -f /var/log/supervisor/frontend.err.log`
2. Clear browser cache and reload
3. Check if port 3000 is accessible

### Chat Not Working
1. Verify you've added an API key in Settings
2. Make sure you've selected a model
3. Check that your API key is valid
4. Ensure backend is running and accessible
5. Check browser console for errors (F12)

### API Key Not Detected
- Make sure your API key format is correct
- OpenAI: `sk-proj-...` or `sk-...`
- Anthropic: `sk-ant-...`
- Google: `AIza...`

## Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
CORS_ORIGINS=*
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=https://smooth-desktop-app.preview.emergentagent.com
WDS_SOCKET_PORT=443
REACT_APP_ENABLE_VISUAL_EDITS=false
ENABLE_HEALTH_CHECK=false
```

## API Endpoints

- `GET /api/` - Health check
- `POST /api/keys/detect` - Detect API key provider
- `POST /api/keys/validate` - Validate API key
- `POST /api/chat/completions` - Send chat message

## Security Notes

- API keys are stored in browser localStorage only
- Keys are never sent to our backend permanently
- Keys are used only to make API calls to respective providers
- Use the masked key display to keep your keys secure

## Dependencies

### Backend
- FastAPI
- Motor (MongoDB async driver)
- emergentintegrations (LLM integration)
- Python 3.10+

### Frontend
- React 19
- React Router DOM
- Axios
- Radix UI components
- Tailwind CSS

## Getting Help

If you encounter issues:
1. Check service status: `sudo supervisorctl status`
2. Review logs in `/var/log/supervisor/`
3. Ensure all dependencies are installed
4. Verify environment variables are set correctly

## Development

### Running Tests
```bash
cd /app/backend
pytest

cd /app/frontend
yarn test
```

### Code Linting
```bash
# Backend
cd /app/backend
flake8 .

# Frontend
cd /app/frontend
yarn lint
```

## License
MIT License - Feel free to use and modify
