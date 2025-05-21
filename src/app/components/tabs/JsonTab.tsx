import React from 'react';

type JsonTabProps = {
  oldJson: string;
  newJson: string;
  setOldJson: (value: string) => void;
  setNewJson: (value: string) => void;
};

const JsonTab: React.FC<JsonTabProps> = ({ oldJson, newJson, setOldJson, setNewJson }) => {
  return (
    <div className="flex gap-4 mb-6">
      <textarea 
        value={oldJson}
        onChange={(e) => setOldJson(e.target.value)}
        placeholder="JSON ChartData antigo" 
        className="w-1/2 p-3 rounded border border-gray-300 h-48 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <textarea 
        value={newJson}
        onChange={(e) => setNewJson(e.target.value)}
        placeholder="JSON ChartData novo" 
        className="w-1/2 p-3 rounded border border-gray-300 h-48 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
};

export default JsonTab;
