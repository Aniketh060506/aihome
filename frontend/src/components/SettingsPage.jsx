import { useState } from 'react';
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
      } else {
        setDetectedProvider('unknown');
        setDetectedModels([]);
      }
    } catch (error) {
      console.error('Error detecting key:', error);
      setDetectedProvider('unknown');
      setDetectedModels([]);
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
      title: 'Active key updated',
      description: 'The selected key is now active.',
    });
  };

  const toggleShowKey = (id) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const providerColors = {
    openai: 'bg-green-100 text-green-800 border-green-300',
    anthropic: 'bg-orange-100 text-orange-800 border-orange-300',
    google: 'bg-blue-100 text-blue-800 border-blue-300'
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className={darkMode ? 'hover:bg-cyan-500/10' : 'hover:bg-cyan-100/50'}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className={`text-3xl font-bold ${\n                darkMode\n                  ? 'bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent neon-text'\n                  : 'bg-gradient-to-r from-cyan-600 to-green-600 bg-clip-text text-transparent'\n              }`}>
                API Settings
              </h1>
              <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage your AI provider keys</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => setDarkMode(!darkMode)}
            className={darkMode ? 'hover:bg-cyan-500/10' : 'hover:bg-cyan-100/50'}
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-cyan-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </Button>
        </div>

        {/* Add New Key Card */}
        <Card className={darkMode ? 'bg-black/40 backdrop-blur-lg border-cyan-500/30 cyber-border shadow-lg shadow-cyan-500/10' : 'bg-white/60 backdrop-blur-lg border-cyan-200 shadow-lg'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${darkMode ? 'text-cyan-100' : ''}`}>
              <Plus className={`w-5 h-5 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
              Add New API Key
            </CardTitle>
            <CardDescription className={darkMode ? 'text-gray-400' : ''}>
              Enter your API key and we'll automatically detect the provider
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="keyName" className={darkMode ? 'text-cyan-300' : ''}>Key Name</Label>
              <Input
                id="keyName"
                placeholder="e.g., My OpenAI Key"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className={darkMode ? 'bg-black/60 border-cyan-500/30 text-cyan-50 placeholder:text-gray-500' : 'bg-white/80 border-cyan-200'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey" className={darkMode ? 'text-cyan-300' : ''}>API Key</Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Paste your API key here..."
                  value={newApiKey}
                  onChange={(e) => handleKeyChange(e.target.value)}
                  className={darkMode ? 'bg-black/60 border-cyan-500/30 text-cyan-50 placeholder:text-gray-500' : 'bg-white/80 border-cyan-200'}
                />
                {isDetecting && (
                  <Loader2 className={`w-4 h-4 animate-spin absolute right-3 top-3 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                )}
              </div>
            </div>

            {/* Detection Result */}
            {detectedProvider && detectedProvider !== 'unknown' && (
              <Card className="bg-gradient-to-r from-cyan-50 to-green-50 border-cyan-300 animate-fade-in">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 mb-2">
                        Detected: {detectedProvider.toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">Available Models:</p>
                      <div className="flex flex-wrap gap-2">
                        {detectedModels.map(model => (
                          <Badge key={model} variant="secondary" className="bg-white/60">
                            {model}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {detectedProvider === 'unknown' && newApiKey && !isDetecting && (
              <Card className="bg-red-50 border-red-300 animate-fade-in">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-800">Unknown key format</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Supported: OpenAI (sk-...), Anthropic (sk-ant-...), Google (AIza...)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              onClick={addApiKey}
              className="w-full bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={isDetecting}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add API Key
            </Button>
          </CardContent>
        </Card>

        {/* Existing Keys */}
        <Card className="bg-white/60 backdrop-blur-lg border-cyan-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-cyan-600" />
              Your API Keys ({apiKeys.length})
            </CardTitle>
            <CardDescription>
              Manage and switch between your configured API keys
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {apiKeys.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Key className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No API keys configured yet</p>
                    <p className="text-sm mt-1">Add your first key to get started</p>
                  </div>
                ) : (
                  apiKeys.map(key => (
                    <Card
                      key={key.id}
                      className={`transition-all duration-200 ${
                        key.isActive
                          ? 'bg-gradient-to-r from-cyan-50 to-green-50 border-cyan-300 shadow-md'
                          : 'bg-white/60 border-gray-200'
                      }`}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-800">{key.name}</h3>
                              <Badge className={providerColors[key.provider]}>
                                {key.provider.toUpperCase()}
                              </Badge>
                              {key.isActive && (
                                <Badge className="bg-green-500 text-white">
                                  Active
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {showKeys[key.id] ? key.key : key.maskedKey}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleShowKey(key.id)}
                              >
                                {showKeys[key.id] ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {key.models.slice(0, 3).map(model => (
                                <Badge key={model} variant="outline" className="text-xs">
                                  {model}
                                </Badge>
                              ))}
                              {key.models.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{key.models.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {!key.isActive && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleActive(key.id)}
                                className="border-cyan-300 hover:bg-cyan-50"
                              >
                                Set Active
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteKey(key.id)}
                              className="text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          Added {new Date(key.createdAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;