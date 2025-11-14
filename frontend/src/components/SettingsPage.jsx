import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { ArrowLeft, Plus, Trash2, Key, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, Moon, Sun } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { apiService } from '../services/apiService';

const SettingsPage = ({ apiKeys, setApiKeys, darkMode, setDarkMode }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [newKeyName, setNewKeyName] = useState('');
  const [newApiKey, setNewApiKey] = useState('');
  const [showKeys, setShowKeys] = useState({});
  const [detectedProvider, setDetectedProvider] = useState(null);
  const [detectedModels, setDetectedModels] = useState([]);
  const [isDetecting, setIsDetecting] = useState(false);

  const handleKeyChange = async (key) => {
    setNewApiKey(key);
    
    if (!key || key.length < 10) {
      setDetectedProvider(null);
      setDetectedModels([]);
      return;
    }

    setIsDetecting(true);
    
    try {
      const result = await apiService.detectApiKey(key);
      
      if (result.is_valid && result.provider !== 'unknown') {
        setDetectedProvider(result.provider);
        setDetectedModels(result.models);
        toast({
          title: 'Key detected',
          description: `Found ${result.provider.toUpperCase()} key with ${result.models.length} models`,
        });
      } else {
        setDetectedProvider('unknown');
        setDetectedModels([]);
        toast({
          title: 'Unknown key format',
          description: 'Could not detect API provider',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error detecting key:', error);
      setDetectedProvider('unknown');
      setDetectedModels([]);
      toast({
        title: 'Detection failed',
        description: 'Could not connect to backend. Please check if services are running.',
        variant: 'destructive'
      });
    } finally {
      setIsDetecting(false);
    }
  };

  const addApiKey = () => {
    if (!newApiKey.trim() || !newKeyName.trim()) {
      toast({
        title: 'Invalid input',
        description: 'Please provide both a name and an API key.',
        variant: 'destructive'
      });
      return;
    }

    if (!detectedProvider || detectedProvider === 'unknown') {
      toast({
        title: 'Unknown key format',
        description: 'Could not detect the API provider. Please check your key.',
        variant: 'destructive'
      });
      return;
    }

    const newKey = {
      id: Date.now().toString(),
      provider: detectedProvider,
      name: newKeyName,
      key: newApiKey,
      maskedKey: newApiKey.slice(0, 10) + '...' + newApiKey.slice(-4),
      models: detectedModels,
      isActive: apiKeys.length === 0,
      createdAt: new Date().toISOString()
    };

    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
    setNewApiKey('');
    setDetectedProvider(null);
    setDetectedModels([]);
    
    toast({
      title: 'API Key added successfully',
      description: `${detectedProvider.toUpperCase()} key with ${detectedModels.length} models detected.`,
    });
  };

  const deleteKey = (id) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
    toast({
      title: 'API Key removed',
      description: 'The key has been deleted from your settings.',
    });
  };

  const toggleActive = (id) => {
    setApiKeys(apiKeys.map(key => ({
      ...key,
      isActive: key.id === id
    })));
    toast({
      title: 'Active key changed',
      description: 'The selected key is now active for chat.',
    });
  };

  const toggleShowKey = (id) => {
    setShowKeys(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className={`min-h-screen ${
      darkMode
        ? 'bg-gradient-to-br from-black via-gray-900 to-black text-cyan-50'
        : 'bg-gradient-to-br from-cyan-50 via-white to-green-50 text-gray-900'
    }`}>
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className={darkMode ? 'border-cyan-500/30 hover:bg-cyan-500/10' : 'border-cyan-200 hover:bg-cyan-50'}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Chat
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDarkMode(!darkMode)}
            className={darkMode ? 'hover:bg-cyan-500/10' : 'hover:bg-cyan-100/50'}
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-cyan-400" />
            ) : (
              <Moon className="w-4 h-4 text-gray-600" />
            )}
          </Button>
        </div>

        {/* Settings Card */}
        <Card className={darkMode ? 'bg-black/40 border-cyan-500/30 backdrop-blur-xl' : 'bg-white/80 backdrop-blur-sm border-cyan-200'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 text-2xl ${
              darkMode ? 'text-cyan-300' : 'text-cyan-700'
            }`}>
              <Key className="w-6 h-6" />
              API Key Settings
            </CardTitle>
            <CardDescription className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              Manage your API keys for different AI providers (OpenAI, Anthropic, Google)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add New Key */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keyName" className={darkMode ? 'text-cyan-200' : 'text-gray-700'}>
                  Key Name
                </Label>
                <Input
                  id="keyName"
                  placeholder="My OpenAI Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className={darkMode ? 'bg-black/60 border-cyan-500/30 text-cyan-50' : 'bg-white border-cyan-200'}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apiKey" className={darkMode ? 'text-cyan-200' : 'text-gray-700'}>
                  API Key
                </Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="sk-..."
                  value={newApiKey}
                  onChange={(e) => handleKeyChange(e.target.value)}
                  className={darkMode ? 'bg-black/60 border-cyan-500/30 text-cyan-50' : 'bg-white border-cyan-200'}
                />
              </div>

              {isDetecting && (
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className={`w-4 h-4 animate-spin ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Detecting provider...</span>
                </div>
              )}

              {detectedProvider && detectedProvider !== 'unknown' && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Detected: <strong>{detectedProvider.toUpperCase()}</strong> with {detectedModels.length} models
                  </span>
                </div>
              )}

              {detectedProvider === 'unknown' && newApiKey.length > 10 && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Unknown key format. Please check your API key.
                  </span>
                </div>
              )}

              <Button
                onClick={addApiKey}
                disabled={!detectedProvider || detectedProvider === 'unknown' || !newKeyName.trim()}
                className={`w-full ${
                  darkMode
                    ? 'bg-gradient-to-r from-cyan-600 to-green-600 hover:from-cyan-500 hover:to-green-500'
                    : 'bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600'
                } text-white`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add API Key
              </Button>
            </div>

            {/* Existing Keys */}
            {apiKeys.length > 0 && (
              <div className="space-y-4">
                <h3 className={`font-semibold text-lg ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>
                  Your API Keys ({apiKeys.length})
                </h3>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {apiKeys.map((key) => (
                      <Card
                        key={key.id}
                        className={`p-4 ${
                          key.isActive
                            ? darkMode
                              ? 'bg-cyan-950/50 border-cyan-500/50 shadow-md shadow-cyan-500/20'
                              : 'bg-gradient-to-r from-cyan-50 to-green-50 border-cyan-300'
                            : darkMode
                              ? 'bg-black/60 border-cyan-500/20'
                              : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className={`font-semibold ${darkMode ? 'text-cyan-100' : 'text-gray-800'}`}>
                                {key.name}
                              </h4>
                              {key.isActive && (
                                <Badge className="bg-green-500 text-white">Active</Badge>
                              )}
                              <Badge variant="outline" className={darkMode ? 'border-cyan-400 text-cyan-400' : 'border-cyan-600 text-cyan-600'}>
                                {key.provider.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <code className={`text-sm font-mono ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {showKeys[key.id] ? key.key : key.maskedKey}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleShowKey(key.id)}
                                className="h-6 w-6 p-0"
                              >
                                {showKeys[key.id] ? (
                                  <EyeOff className="w-3 h-3" />
                                ) : (
                                  <Eye className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                              {key.models.length} models available • Added {new Date(key.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {!key.isActive && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleActive(key.id)}
                                className={darkMode ? 'border-cyan-500/30 hover:bg-cyan-500/10' : 'border-cyan-200 hover:bg-cyan-50'}
                              >
                                Set Active
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteKey(key.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {apiKeys.length === 0 && (
              <div className="text-center py-12">
                <Key className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-cyan-400/50' : 'text-cyan-300'}`} />
                <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No API keys added yet. Add your first key to get started!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
