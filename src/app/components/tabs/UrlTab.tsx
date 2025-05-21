import React from 'react';

type UrlTabProps = {
  oldUrl: string;
  newUrl: string;
  setOldUrl: (value: string) => void;
  setNewUrl: (value: string) => void;
};

const UrlTab: React.FC<UrlTabProps> = ({ oldUrl, newUrl, setOldUrl, setNewUrl }) => {
  return (
    <div className="flex gap-4 mb-6">
      <input 
        value={oldUrl}
        onChange={(e) => setOldUrl(e.target.value)}
        placeholder="URL do relatório HTML antigo" 
        className="w-1/2 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <input 
        value={newUrl}
        onChange={(e) => setNewUrl(e.target.value)}
        placeholder="URL do relatório HTML novo" 
        className="w-1/2 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
};

export default UrlTab;
