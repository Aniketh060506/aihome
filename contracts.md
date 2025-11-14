# API Contracts & Implementation Plan

## Frontend Mock Data (to be replaced)
Located in: `/app/frontend/src/mock.js`
- `mockConversations` - Sample conversation data
- `mockApiKeys` - Sample API key configurations
- `detectKeyProvider()` - Client-side key detection
- `getModelsForProvider()` - Client-side model listing

## Backend API Endpoints

### 1. API Key Management
**POST /api/keys/detect**
- Request: `{ "api_key": "sk-..." }`
- Response: `{ "provider": "openai", "models": ["gpt-4o", ...], "is_valid": true }`
- Purpose: Auto-detect provider and fetch available models

**POST /api/keys/validate**
- Request: `{ "api_key": "sk-...", "provider": "openai" }`
- Response: `{ "is_valid": true, "error": null }`
- Purpose: Validate API key with actual provider

### 2. Chat Management
**POST /api/chat/completions**
- Request:
  ```json
  {
    "messages": [{"role": "user", "content": "..."}],
    "model": "gpt-4o",
    "api_key": "sk-...",
    "provider": "openai"
  }
  ```
- Response: `{ "message": "AI response...", "usage": {...} }`
- Purpose: Stream or return AI completions

**POST /api/conversations**
- Request: `{ "title": "New Chat", "messages": [] }`
- Response: `{ "id": "...", "title": "...", "created_at": "..." }`
- Purpose: Create new conversation (optional backend storage)

**GET /api/conversations**
- Response: `[{ "id": "...", "title": "...", "messages": [...] }]`
- Purpose: Fetch all conversations (optional)

**DELETE /api/conversations/{id}**
- Purpose: Delete conversation (optional)

## MongoDB Schema

### Conversations Collection
```javascript
{
  _id: ObjectId,
  user_id: String, // Future: for multi-user support
  title: String,
  messages: [
    {
      role: "user" | "assistant",
      content: String,
      timestamp: Date
    }
  ],
  created_at: Date,
  updated_at: Date
}
```

### API Keys Collection (Optional - if storing encrypted keys)
```javascript
{
  _id: ObjectId,
  user_id: String,
  provider: "openai" | "anthropic" | "google",
  encrypted_key: String,
  name: String,
  is_active: Boolean,
  created_at: Date
}
```

## Frontend-Backend Integration Changes

### Files to Update:
1. **ChatInterface.jsx**
   - Replace mock `sendMessage()` with real API call to `/api/chat/completions`
   - Remove mock delay, use actual streaming or response

2. **SettingsPage.jsx**
   - Replace `detectKeyProvider()` with API call to `/api/keys/detect`
   - Add real-time validation when user enters key
   - Keep localStorage for API keys (security: keys stay client-side)

3. **App.js**
   - Keep localStorage logic for conversations and API keys
   - Optionally sync with backend for cross-device access

## Implementation Strategy

### Phase 1: Backend Core
1. Create AI provider integration utilities
   - OpenAI client wrapper
   - Anthropic client wrapper
   - Google Gemini client wrapper
2. Implement `/api/keys/detect` endpoint
3. Implement `/api/chat/completions` endpoint

### Phase 2: Frontend Integration
1. Create `apiService.js` for API calls
2. Update ChatInterface to use real API
3. Update SettingsPage to validate keys

### Phase 3: Storage (Optional Enhancement)
1. Add conversation persistence to MongoDB
2. Add sync functionality

## Security Notes
- API keys stored in localStorage (client-side only)
- Never send keys to our backend database
- Keys only used for direct provider API calls
- Future: Add encryption for stored keys

## Key Detection Logic
- OpenAI: `sk-` or `sk-proj-`
- Anthropic: `sk-ant-`
- Google: `AIza`
