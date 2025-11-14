# CyberAI - Quick Reference Card

## 🚀 Getting Started in 3 Steps

1. **Check Services**
   ```bash
   sudo supervisorctl status
   ```
   All should show `RUNNING`

2. **Add API Key**
   - Click Settings (⚙️)
   - Enter key name and API key
   - Click "Add API Key"

3. **Start Chatting**
   - Click "New Chat"
   - Select a model
   - Type your question and hit Enter

---

## 🔑 API Key Formats

| Provider | Format | Example |
|----------|--------|---------|
| OpenAI | `sk-proj-...` or `sk-...` | sk-proj-abc123... |
| Anthropic | `sk-ant-...` | sk-ant-abc123... |
| Google | `AIza...` | AIzaSyAbc123... |

---

## 🤖 Available Models

### OpenAI
- `gpt-4o` ⭐ (Recommended)
- `gpt-4-turbo`
- `gpt-4`
- `gpt-3.5-turbo`
- `gpt-4o-mini` 💡 (Fast & cheap)

### Anthropic Claude
- `claude-3-opus-20240229` ⭐ (Most capable)
- `claude-3-sonnet-20240229`
- `claude-3-haiku-20240307` 💡 (Fast)
- `claude-3-5-sonnet-20241022` ⭐ (Latest)

### Google Gemini
- `gemini-pro`
- `gemini-1.5-pro` ⭐ (Recommended)
- `gemini-1.5-flash` 💡 (Fast)
- `gemini-2.0-flash` (Latest)

---

## 🛠️ Common Commands

### Service Management
```bash
# Check status
sudo supervisorctl status

# Restart all
sudo supervisorctl restart all

# Restart individual
sudo supervisorctl restart backend
sudo supervisorctl restart frontend

# Stop all
sudo supervisorctl stop all

# Start all
sudo supervisorctl start all
```

### Check Logs
```bash
# Backend logs (errors)
tail -f /var/log/supervisor/backend.err.log

# Backend logs (output)
tail -f /var/log/supervisor/backend.out.log

# Frontend logs (errors)
tail -f /var/log/supervisor/frontend.err.log

# Frontend logs (output)
tail -f /var/log/supervisor/frontend.out.log

# All logs at once
tail -f /var/log/supervisor/*.log
```

### Test Backend
```bash
# Health check
curl http://localhost:8001/api/

# Test key detection
curl -X POST http://localhost:8001/api/keys/detect \
  -H "Content-Type: application/json" \
  -d '{"api_key": "sk-test123"}'
```

### Run Startup Script
```bash
bash /app/start.sh
```

---

## 🎯 Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Send message | `Enter` |
| New line in message | `Shift + Enter` |
| Navigate to Settings | Click ⚙️ icon |
| Toggle dark mode | Click 🌙/☀️ icon |
| Create new chat | Click "+ New Chat" |

---

## 🐛 Troubleshooting One-Liners

### Services won't start?
```bash
sudo supervisorctl restart all && sleep 3 && sudo supervisorctl status
```

### Backend not responding?
```bash
curl -I http://localhost:8001/api/
```

### Check if MongoDB is running?
```bash
sudo supervisorctl status mongodb
```

### Frontend not loading?
```bash
tail -20 /var/log/supervisor/frontend.out.log | grep -i "compiled"
```

### Clear everything and restart?
```bash
sudo supervisorctl stop all && sleep 2 && sudo supervisorctl start all
```

### Check which ports are in use?
```bash
sudo netstat -tlnp | grep -E ':(3000|8001|27017)'
```

---

## 📝 Useful File Locations

| File | Location |
|------|----------|
| Backend code | `/app/backend/` |
| Frontend code | `/app/frontend/` |
| Backend .env | `/app/backend/.env` |
| Frontend .env | `/app/frontend/.env` |
| Backend logs | `/var/log/supervisor/backend.*.log` |
| Frontend logs | `/var/log/supervisor/frontend.*.log` |
| Requirements | `/app/backend/requirements.txt` |
| Package.json | `/app/frontend/package.json` |

---

## 💡 Pro Tips

1. **Multiple Keys**: Add multiple API keys and switch between them
2. **Dark Mode**: Better for long coding/learning sessions
3. **Conversation Management**: Create separate conversations for different topics
4. **Model Selection**: 
   - Use "mini" or "flash" models for quick questions
   - Use "opus" or "4o" for complex problems
5. **Session Persistence**: All data saved in browser - use same browser for continuity
6. **Key Security**: Keys shown masked - click eye icon to reveal

---

## 🔥 Quick Fixes

### Problem: "No API key configured"
**Solution**: Go to Settings → Add your API key → Set as active

### Problem: "No model selected"
**Solution**: Select a model from dropdown in sidebar

### Problem: Chat not sending
**Solution**: 
1. Check API key is active
2. Check model is selected
3. Check backend is running: `curl http://localhost:8001/api/`

### Problem: "Cannot connect to server"
**Solution**: 
```bash
sudo supervisorctl restart backend
```

### Problem: Frontend not loading
**Solution**: 
```bash
sudo supervisorctl restart frontend
```

### Problem: Changes not reflecting
**Solution**: Clear browser cache (Ctrl+Shift+Del) and hard reload (Ctrl+Shift+R)

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `README.md` | Full documentation |
| `SETUP_GUIDE.md` | Detailed setup instructions |
| `CHECKLIST.md` | Pre-launch validation |
| `QUICK_REFERENCE.md` | This file - quick help |

---

## 🆘 Emergency Commands

If nothing works:

```bash
# Nuclear option - restart everything
cd /app
sudo supervisorctl stop all
sleep 3
sudo supervisorctl start all
sleep 5
sudo supervisorctl status

# Check all logs for errors
tail -50 /var/log/supervisor/*.err.log

# Reinstall dependencies
cd /app/backend && pip install -r requirements.txt
cd /app/frontend && yarn install

# Restart again
sudo supervisorctl restart all
```

---

**Still stuck? Check the full documentation in `README.md` and `SETUP_GUIDE.md`**
