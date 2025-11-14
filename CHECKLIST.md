# CyberAI - Pre-Launch Checklist ✓

## System Requirements

- [ ] Python 3.10+ installed
- [ ] Node.js 14+ installed
- [ ] MongoDB running
- [ ] Internet connection for API calls

## Service Status

Run this command to check all services:
```bash
sudo supervisorctl status
```

All services should show `RUNNING`:
- [ ] backend - RUNNING
- [ ] frontend - RUNNING
- [ ] mongodb - RUNNING
- [ ] nginx-code-proxy - RUNNING

If any service is not running:
```bash
sudo supervisorctl restart all
```

## Backend Health Checks

### 1. Backend API Accessible
```bash
curl http://localhost:8001/api/
```
Expected output: `{"message":"CyberAI Backend - BYOK Cybersecurity Assistant"}`

- [ ] Backend responds to health check

### 2. Key Detection Works
```bash
curl -X POST http://localhost:8001/api/keys/detect \
  -H "Content-Type: application/json" \
  -d '{"api_key": "sk-test123"}'
```
Expected: Returns provider and models list

- [ ] Key detection endpoint works

### 3. Backend Logs Clean
```bash
tail -20 /var/log/supervisor/backend.err.log
```
Should show "Application startup complete" with no errors

- [ ] No critical errors in backend logs

## Frontend Health Checks

### 1. Frontend Compiled
```bash
tail -20 /var/log/supervisor/frontend.out.log
```
Should show "webpack compiled successfully"

- [ ] Frontend compiled successfully

### 2. Frontend Accessible
Open browser and visit the frontend URL from `.env` file

- [ ] Frontend loads in browser
- [ ] No console errors (F12 → Console tab)

## Database Checks

### 1. MongoDB Running
```bash
sudo supervisorctl status mongodb
```
Should show `RUNNING`

- [ ] MongoDB service is running

### 2. MongoDB Accessible
```bash
mongosh --eval "db.adminCommand('ping')"
```
Expected: `{ ok: 1 }`

- [ ] MongoDB responds to ping

## Application Functionality

### 1. Settings Page
- [ ] Can navigate to Settings page
- [ ] Can enter API key name
- [ ] Can paste API key
- [ ] Provider auto-detection works
- [ ] Can add API key
- [ ] Can see added keys in list
- [ ] Can set a key as active
- [ ] Can delete a key

### 2. Chat Interface
- [ ] Can create new conversation
- [ ] Can select a model from dropdown
- [ ] Can type message in input box
- [ ] Can send message (with valid API key)
- [ ] Receives response from AI
- [ ] Response displays correctly
- [ ] Can send multiple messages
- [ ] Conversation history persists
- [ ] Can switch between conversations
- [ ] Can delete conversations

### 3. UI Features
- [ ] Dark mode toggle works
- [ ] Light mode toggle works
- [ ] Sidebar can be collapsed/expanded
- [ ] Notifications (toasts) appear for actions
- [ ] Messages auto-scroll to bottom
- [ ] Loading indicators show during API calls

## Error Handling

### 1. No API Key
- [ ] Shows error when trying to chat without API key
- [ ] Directs user to add API key in settings

### 2. No Model Selected
- [ ] Shows error when trying to chat without model
- [ ] Prompts user to select a model

### 3. Invalid API Key
- [ ] Shows appropriate error for invalid key
- [ ] Doesn't crash the application

### 4. Network Errors
- [ ] Shows error when backend is unreachable
- [ ] Error messages are user-friendly

## Performance Checks

- [ ] Initial page load < 3 seconds
- [ ] Chat messages send/receive < 5 seconds (depends on AI provider)
- [ ] No memory leaks (check browser task manager)
- [ ] Smooth scrolling and animations

## Data Persistence

- [ ] API keys persist after page reload
- [ ] Conversations persist after page reload
- [ ] Active conversation persists after page reload
- [ ] Selected model persists after page reload
- [ ] Dark mode preference persists after page reload

## Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Edge

## Security Checks

- [ ] API keys are masked in UI (showing only first/last chars)
- [ ] Can toggle visibility of API keys
- [ ] API keys stored only in localStorage
- [ ] No sensitive data in browser console
- [ ] No sensitive data in network tab

## Final Validation

### Quick Test Flow:
1. [ ] Open application in browser
2. [ ] Navigate to Settings
3. [ ] Add an API key (use a test key or real key)
4. [ ] Return to chat
5. [ ] Create new conversation
6. [ ] Select a model
7. [ ] Send message: "What is SQL injection?"
8. [ ] Receive and verify response
9. [ ] Send follow-up message
10. [ ] Verify conversation history
11. [ ] Create second conversation
12. [ ] Switch between conversations
13. [ ] Toggle dark mode
14. [ ] Refresh page - verify data persists

## Troubleshooting Commands

If any check fails, use these commands:

### Restart All Services
```bash
sudo supervisorctl restart all
```

### Check All Logs
```bash
# Backend
tail -50 /var/log/supervisor/backend.err.log

# Frontend
tail -50 /var/log/supervisor/frontend.err.log

# MongoDB
tail -50 /var/log/supervisor/mongodb.err.log
```

### Reinstall Dependencies
```bash
# Backend
cd /app/backend && pip install -r requirements.txt

# Frontend
cd /app/frontend && yarn install
```

### Clear Browser Cache
1. Open browser DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

## Support

If issues persist after following this checklist:
1. ✓ All services running?
2. ✓ No errors in logs?
3. ✓ Dependencies installed?
4. ✓ Environment variables set?
5. ✓ Browser console clean?

See `SETUP_GUIDE.md` for detailed troubleshooting steps.

---

**All checks passed? You're ready to use CyberAI! 🎉**
