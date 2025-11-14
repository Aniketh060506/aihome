import { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ChatInterface from './components/ChatInterface';
import SettingsPage from './components/SettingsPage';
import { Toaster } from './components/ui/toaster';

function App() {
  const [apiKeys, setApiKeys] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('apiKeys');
    const savedConversations = localStorage.getItem('conversations');
    const savedActiveConv = localStorage.getItem('activeConversation');
    const savedModel = localStorage.getItem('selectedModel');
    const savedDarkMode = localStorage.getItem('darkMode');

    if (savedKeys) setApiKeys(JSON.parse(savedKeys));
    if (savedConversations) setConversations(JSON.parse(savedConversations));
    if (savedActiveConv) setActiveConversation(savedActiveConv);
    if (savedModel) setSelectedModel(savedModel);
    if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    if (activeConversation) {
      localStorage.setItem('activeConversation', activeConversation);
    }
  }, [activeConversation]);

  useEffect(() => {
    if (selectedModel) {
      localStorage.setItem('selectedModel', selectedModel);
    }
  }, [selectedModel]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }, [darkMode]);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <ChatInterface
                apiKeys={apiKeys}
                conversations={conversations}
                setConversations={setConversations}
                activeConversation={activeConversation}
                setActiveConversation={setActiveConversation}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
              />
            }
          />
          <Route
            path="/settings"
            element={
              <SettingsPage
                apiKeys={apiKeys}
                setApiKeys={setApiKeys}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;