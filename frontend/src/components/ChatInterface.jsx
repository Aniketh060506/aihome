import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  Settings,
  Plus,
  Send,
  MessageSquare,
  Trash2,
  Shield,
  Lock,
  Zap,
  Sparkles,
  Bot,
  User
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { getModelsForProvider } from '../mock';
import { apiService } from '../services/apiService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const ChatInterface = ({
  apiKeys,
  conversations,
  setConversations,
  activeConversation,
  setActiveConversation,
  selectedModel,
  setSelectedModel
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations, activeConversation]);

  const activeKey = apiKeys.find(key => key.isActive);
  const availableModels = activeKey ? getModelsForProvider(activeKey.provider) : [];

  const currentConversation = conversations.find(c => c.id === activeConversation);

  const createNewConversation = () => {
    const newConv = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setConversations([newConv, ...conversations]);
    setActiveConversation(newConv.id);
    toast({
      title: 'New conversation created',
      description: 'Start chatting about cybersecurity!',
    });
  };

  const deleteConversation = (id) => {
    setConversations(conversations.filter(c => c.id !== id));
    if (activeConversation === id) {
      setActiveConversation(null);
    }
    toast({
      title: 'Conversation deleted',
      description: 'The conversation has been removed.',
    });
  };

  const sendMessage = async () => {
    if (!message.trim() || !activeKey) {
      if (!activeKey) {
        toast({
          title: 'No API key configured',
          description: 'Please add an API key in settings first.',
          variant: 'destructive'
        });
      }
      return;
    }

    if (!selectedModel) {
      toast({
        title: 'No model selected',
        description: 'Please select a model first.',
        variant: 'destructive'
      });
      return;
    }

    if (!activeConversation) {
      createNewConversation();
      // Need to wait for next render cycle
      setTimeout(() => sendMessage(), 100);
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedConversations = conversations.map(conv => {
      if (conv.id === activeConversation) {
        return {
          ...conv,
          messages: [...conv.messages, userMessage],
          title: conv.messages.length === 0 ? message.slice(0, 50) : conv.title,
          updatedAt: new Date().toISOString()
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setMessage('');
    setIsLoading(true);

    try {
      // Get all messages for this conversation
      const currentConv = updatedConversations.find(c => c.id === activeConversation);
      const messages = currentConv.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      }));

      // Call AI API
      const response = await apiService.chatCompletion(
        messages,
        activeKey.key,
        activeKey.provider,
        selectedModel,
        activeConversation
      );

      if (response.success) {
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.message,
          timestamp: new Date().toISOString()
        };

        const finalConversations = updatedConversations.map(conv => {
          if (conv.id === activeConversation) {
            return {
              ...conv,
              messages: [...conv.messages, assistantMessage],
              updatedAt: new Date().toISOString()
            };
          }
          return conv;
        });

        setConversations(finalConversations);
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to get response from AI',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please check your API key.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-80' : 'w-0'
        } transition-all duration-300 bg-white/40 backdrop-blur-lg border-r border-cyan-200/50 overflow-hidden`}
      >
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-cyan-600" />
              <h2 className="font-bold text-lg bg-gradient-to-r from-cyan-600 to-green-600 bg-clip-text text-transparent">
                CyberAI
              </h2>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate('/settings')}
              className="hover:bg-cyan-100/50"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          <Button
            onClick={createNewConversation}
            className="w-full bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>

          {/* Model Selection */}
          {availableModels.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-600" />
                Select Model
              </label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="bg-white/60 border-cyan-200">
                  <SelectValue placeholder="Choose a model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map(model => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Conversations List */}
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-2">
              {conversations.map(conv => (
                <Card
                  key={conv.id}
                  className={`p-3 cursor-pointer transition-all duration-200 hover:shadow-md group ${
                    activeConversation === conv.id
                      ? 'bg-gradient-to-r from-cyan-50 to-green-50 border-cyan-300 shadow-md'
                      : 'bg-white/60 border-gray-200 hover:bg-white/80'
                  }`}
                  onClick={() => setActiveConversation(conv.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                        <h3 className="text-sm font-medium truncate">{conv.title}</h3>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white/40 backdrop-blur-lg border-b border-cyan-200/50 p-4">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hover:bg-cyan-100/50"
              >
                <MessageSquare className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-bold text-xl bg-gradient-to-r from-cyan-600 via-green-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
                  <Lock className="w-5 h-5 text-cyan-600" />
                  Cybersecurity AI Assistant
                </h1>
                {activeKey && (
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-green-500" />
                    Using {activeKey.provider} - {selectedModel || 'No model selected'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-4xl mx-auto space-y-6 pb-4">
            {!currentConversation || currentConversation.messages.length === 0 ? (
              <div className="text-center py-20 space-y-6 animate-fade-in">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-green-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                    <Shield className="w-24 h-24 text-cyan-600 relative" />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-green-600 bg-clip-text text-transparent mb-2">
                    Welcome to CyberAI
                  </h2>
                  <p className="text-gray-600 text-lg">Your personal cybersecurity learning assistant</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mt-8">
                  {[
                    { icon: Shield, title: 'Security Topics', desc: 'Learn about vulnerabilities' },
                    { icon: Lock, title: 'Best Practices', desc: 'Secure coding guidelines' },
                    { icon: Zap, title: 'Quick Answers', desc: 'Get instant help' }
                  ].map((item, idx) => (
                    <Card key={idx} className="p-6 bg-white/60 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <item.icon className="w-10 h-10 text-cyan-600 mb-3 mx-auto" />
                      <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              currentConversation.messages.map((msg, idx) => (
                <div
                  key={msg.id}
                  className={`flex gap-4 animate-fade-in ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <Avatar className="w-10 h-10 border-2 border-cyan-300 shadow-md">
                      <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-green-500 text-white">
                        <Bot className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <Card
                    className={`max-w-2xl p-4 shadow-md ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-cyan-500 to-green-500 text-white border-none'
                        : 'bg-white/80 backdrop-blur-sm border-cyan-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p
                      className={`text-xs mt-2 ${
                        msg.role === 'user' ? 'text-cyan-100' : 'text-gray-500'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </Card>
                  {msg.role === 'user' && (
                    <Avatar className="w-10 h-10 border-2 border-green-300 shadow-md">
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white">
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex gap-4 justify-start animate-fade-in">
                <Avatar className="w-10 h-10 border-2 border-cyan-300 shadow-md">
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-green-500 text-white">
                    <Bot className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <Card className="max-w-2xl p-4 bg-white/80 backdrop-blur-sm border-cyan-200">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="bg-white/40 backdrop-blur-lg border-t border-cyan-200/50 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about cybersecurity, vulnerabilities, best practices..."
                className="flex-1 bg-white/80 border-cyan-200 focus:border-cyan-400 focus:ring-cyan-400 shadow-sm"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!message.trim() || isLoading}
                className="bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;