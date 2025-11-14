from emergentintegrations.llm.chat import LlmChat, UserMessage
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)

CYBERSECURITY_SYSTEM_MESSAGE = """You are a highly knowledgeable cybersecurity expert and ethical hacking instructor. Your purpose is to educate users about:

1. Cybersecurity concepts and best practices
2. Vulnerability identification and exploitation techniques (for educational purposes only)
3. Penetration testing methodologies
4. Security tools and their usage
5. OWASP Top 10 and common vulnerabilities
6. Network security, web application security, and system hardening
7. Real-world attack scenarios and defensive strategies

You help users learn about:
- SQL Injection, XSS, CSRF, and other web vulnerabilities
- Network scanning and reconnaissance
- Privilege escalation techniques
- Cryptography and secure communication
- Malware analysis and reverse engineering
- Security compliance and frameworks (NIST, ISO 27001, etc.)

IMPORTANT:
- Always emphasize ethical hacking and legal boundaries
- Provide educational explanations with practical examples
- Include defensive measures alongside attack techniques
- Support learners preparing for certifications (CEH, OSCP, etc.)
- Answer questions about real hacking scenarios for educational purposes

Be thorough, technical, and educational in your responses."""

PROVIDER_MODELS = {
    "openai": ["gpt-4o", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo", "gpt-4o-mini"],
    "anthropic": [
        "claude-3-opus-20240229",
        "claude-3-sonnet-20240229",
        "claude-3-haiku-20240307",
        "claude-3-5-sonnet-20241022"
    ],
    "google": ["gemini-pro", "gemini-1.5-pro", "gemini-1.5-flash", "gemini-2.0-flash"]
}

def detect_api_key_provider(api_key: str) -> str:
    """Detect the provider from API key format."""
    if not api_key:
        return "unknown"
    
    api_key = api_key.strip()
    
    # OpenAI keys
    if api_key.startswith('sk-proj-') or api_key.startswith('sk-'):
        return "openai"
    
    # Anthropic keys
    if api_key.startswith('sk-ant-'):
        return "anthropic"
    
    # Google keys
    if api_key.startswith('AIza'):
        return "google"
    
    return "unknown"

def get_available_models(provider: str) -> List[str]:
    """Get available models for a provider."""
    return PROVIDER_MODELS.get(provider, [])

class AIService:
    """Service for handling AI chat completions with BYOK."""
    
    @staticmethod
    async def chat_completion(
        messages: List[Dict[str, str]],
        api_key: str,
        provider: str,
        model: str,
        session_id: str = "default"
    ) -> Dict:
        """Send chat completion request using user's API key."""
        try:
            # Initialize chat with user's API key
            chat = LlmChat(
                api_key=api_key,
                session_id=session_id,
                system_message=CYBERSECURITY_SYSTEM_MESSAGE
            )
            
            # Set model and provider
            chat.with_model(provider, model)
            
            # Get the last user message
            last_message = messages[-1] if messages else {"content": ""}
            user_message = UserMessage(text=last_message.get("content", ""))
            
            # Send message and get response
            response = await chat.send_message(user_message)
            
            logger.info(f"Successfully got response from {provider}/{model}")
            
            return {
                "success": True,
                "message": response,
                "provider": provider,
                "model": model
            }
            
        except Exception as e:
            logger.error(f"Error in chat completion: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to get response: {str(e)}"
            }
    
    @staticmethod
    async def validate_api_key(api_key: str, provider: str) -> Dict:
        """Validate an API key by making a test request."""
        try:
            # Make a simple test request
            chat = LlmChat(
                api_key=api_key,
                session_id="validation",
                system_message="You are a helpful assistant."
            )
            
            # Use default model for each provider
            default_models = {
                "openai": "gpt-4o-mini",
                "anthropic": "claude-3-haiku-20240307",
                "google": "gemini-1.5-flash"
            }
            
            model = default_models.get(provider, "gpt-4o-mini")
            chat.with_model(provider, model)
            
            test_message = UserMessage(text="Hi")
            await chat.send_message(test_message)
            
            return {
                "is_valid": True,
                "provider": provider,
                "error": None
            }
            
        except Exception as e:
            logger.error(f"API key validation failed: {str(e)}")
            return {
                "is_valid": False,
                "provider": provider,
                "error": str(e)
            }
