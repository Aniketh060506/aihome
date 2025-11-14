// Mock data for development
export const mockConversations = [
  {
    id: '1',
    title: 'Web Application Security',
    messages: [
      {
        id: 'm1',
        role: 'user',
        content: 'What are the OWASP Top 10 vulnerabilities?',
        timestamp: new Date().toISOString()
      },
      {
        id: 'm2',
        role: 'assistant',
        content: 'The OWASP Top 10 represents the most critical security risks to web applications...',
        timestamp: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const mockApiKeys = [
  {
    id: 'key1',
    provider: 'openai',
    name: 'OpenAI Key',
    key: 'sk-...abc123',
    maskedKey: 'sk-...abc123',
    models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

export const detectKeyProvider = (key) => {
  if (key.startsWith('sk-')) return 'openai';
  if (key.startsWith('sk-ant-')) return 'anthropic';
  if (key.startsWith('AIza')) return 'google';
  return 'unknown';
};

export const getModelsForProvider = (provider) => {
  const modelsByProvider = {
    openai: ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo', 'gpt-4o-mini'],
    anthropic: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307', 'claude-3-5-sonnet-20241022'],
    google: ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash']
  };
  return modelsByProvider[provider] || [];
};