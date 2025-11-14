# CyberAI - BYOK Cybersecurity Assistant

![Status](https://img.shields.io/badge/status-active-success.svg)
![React](https://img.shields.io/badge/React-19.0.0-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110.1-green.svg)

## Overview

CyberAI is a **Bring Your Own Key (BYOK)** cybersecurity learning assistant that empowers you to use your own API keys from OpenAI, Anthropic, or Google to chat with AI models about cybersecurity topics. Your keys, your control, your learning journey.

## Features

✅ **Multi-Provider Support**: OpenAI, Anthropic Claude, and Google Gemini  
✅ **BYOK Architecture**: Your API keys stay with you - never stored on our servers  
✅ **Intelligent Key Detection**: Automatically detects provider from key format  
✅ **Multiple Conversations**: Manage multiple chat sessions simultaneously  
✅ **Model Selection**: Choose from available models for each provider  
✅ **Dark Mode**: Beautiful cyberpunk-themed UI with light/dark modes  
✅ **Session Management**: All conversations saved locally in your browser  
✅ **Real-time Chat**: Fast, responsive AI interactions  

## Quick Start

### 1. Ensure Services Are Running

```bash
sudo supervisorctl status
```

All services should show `RUNNING`. If not:

```bash
sudo supervisorctl restart all
```

### 2. Access the Application

Open your browser and navigate to the frontend URL (displayed in `.env` file)

### 3. Add Your API Key

1. Click the **Settings** (gear icon) in the sidebar
2. Enter a name for your key
3. Paste your API key
4. System auto-detects provider and models
5. Click **Add API Key**

### 4. Start Chatting

1. Create a **New Chat**
2. Select your preferred **Model**
3. Ask cybersecurity questions!

## Supported Providers

| Provider | Key Format | Models Available |
|----------|-----------|------------------|
| **OpenAI** | `sk-proj-...` or `sk-...` | gpt-4o, gpt-4-turbo, gpt-4, gpt-3.5-turbo, gpt-4o-mini |
| **Anthropic** | `sk-ant-...` | claude-3-opus, claude-3-sonnet, claude-3-haiku, claude-3-5-sonnet |
| **Google** | `AIza...` | gemini-pro, gemini-1.5-pro, gemini-1.5-flash, gemini-2.0-flash |

## Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   React     │─────▶│   FastAPI   │─────▶│   MongoDB   │
│  Frontend   │      │   Backend   │      │  Database   │
└─────────────┘      └─────────────┘      └─────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  AI Provider │
                     │ (OpenAI/etc) │
                     └──────────────┘
```

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Motor** - Async MongoDB driver
- **emergentintegrations** - Unified LLM integration library
- **Python 3.10+**

### Frontend
- **React 19** - Latest React with improved performance
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Radix UI** - Accessible component library
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library

### Database
- **MongoDB** - Document-based NoSQL database

## Installation

### Backend Dependencies

```bash
cd /app/backend
pip install -r requirements.txt
```

### Frontend Dependencies

```bash
cd /app/frontend
yarn install
```

## Configuration

### Backend Environment Variables (`/app/backend/.env`)

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
CORS_ORIGINS=*
```

### Frontend Environment Variables (`/app/frontend/.env`)

```env
REACT_APP_BACKEND_URL=<your-backend-url>
WDS_SOCKET_PORT=443
REACT_APP_ENABLE_VISUAL_EDITS=false
ENABLE_HEALTH_CHECK=false
```

## API Endpoints

### Health Check
```bash
GET /api/
```

### Detect API Key Provider
```bash
POST /api/keys/detect
{
  "api_key": "sk-..."
}
```

### Validate API Key
```bash
POST /api/keys/validate
{
  "api_key": "sk-...",
  "provider": "openai"
}
```

### Chat Completion
```bash
POST /api/chat/completions
{
  "messages": [{"role": "user", "content": "What is SQL injection?"}],
  "api_key": "sk-...",
  "provider": "openai",
  "model": "gpt-4o",
  "session_id": "unique-session-id"
}
```

## Development

### Running Backend Locally

```bash
cd /app/backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Running Frontend Locally

```bash
cd /app/frontend
yarn start
```

### Testing Backend

```bash
cd /app/backend
pytest
```

### Linting

```bash
# Backend
flake8 .

# Frontend
cd /app/frontend
yarn lint
```

## Troubleshooting

### Services Not Running

```bash
sudo supervisorctl restart all
```

### Check Logs

```bash
# Backend logs
tail -f /var/log/supervisor/backend.err.log

# Frontend logs
tail -f /var/log/supervisor/frontend.err.log
```

### Backend Connection Issues

```bash
# Test backend
curl http://localhost:8001/api/

# Check MongoDB
sudo supervisorctl status mongodb
```

### Frontend Not Loading

1. Clear browser cache
2. Check frontend logs
3. Verify port 3000 is accessible

### Chat Not Working

1. ✓ API key added in Settings?
2. ✓ Model selected?
3. ✓ Backend running?
4. ✓ Check browser console (F12)

## Security

- 🔒 API keys stored **locally** in browser (localStorage)
- 🔒 Keys never sent to our backend for storage
- 🔒 Keys used only for API calls to respective providers
- 🔒 HTTPS recommended for production
- 🔒 CORS configured for security

## Common Use Cases

### 1. Learning Cybersecurity
Ask about vulnerabilities, attack vectors, and defense mechanisms.

### 2. Certification Prep
Get help with CEH, OSCP, or other cybersecurity certifications.

### 3. Secure Code Review
Ask about secure coding practices and common vulnerabilities.

### 4. Penetration Testing
Learn about pentesting methodologies and tools.

### 5. Threat Analysis
Understand current threats and mitigation strategies.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- Check `/app/SETUP_GUIDE.md` for detailed setup instructions
- Review logs in `/var/log/supervisor/`
- Ensure all dependencies are installed
- Verify environment variables

## Acknowledgments

- Built with ❤️ for cybersecurity learners
- Powered by emergentintegrations for unified LLM access
- UI inspired by cyberpunk aesthetics

---

**Ready to learn cybersecurity? Add your API key and start chatting!** 🚀
