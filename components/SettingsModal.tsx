import React, { useState, useEffect } from 'react';
import { X, Key, Save, AlertTriangle } from 'lucide-react';
import { getFootballApiKey, setFootballApiKey } from '../services/footballApi';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKeyInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setApiKeyInput(getFootballApiKey() || '');
    }
  }, [isOpen]);

  const handleSave = () => {
    setFootballApiKey(apiKey);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-green-500" />
            Configuração da API
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-yellow-900/20 border border-yellow-700/50 p-3 rounded-lg flex gap-3">
             <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
             <p className="text-xs text-yellow-200">
                Para obter dados reais, você precisa de uma chave da <strong>API-Football</strong> (RapidAPI). 
                Sem a chave, o sistema usará dados de demonstração.
             </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              API-Football Key (v3.football.api-sports.io)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="p-4 border-t border-gray-800 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            Salvar Chave
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
