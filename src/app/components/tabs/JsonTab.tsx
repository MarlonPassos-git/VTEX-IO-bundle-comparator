import React from 'react';
import { Flex, TextArea } from '@radix-ui/themes';

type JsonTabProps = {
  oldJson: string;
  newJson: string;
  setOldJson: (value: string) => void;
  setNewJson: (value: string) => void;
};

const JsonTab: React.FC<JsonTabProps> = ({ oldJson, newJson, setOldJson, setNewJson }) => {
  return (
    <Flex gap="4" mb="6">
      <TextArea 
        value={oldJson}
        onChange={(e) => setOldJson(e.target.value)}
        placeholder="JSON ChartData antigo" 
        style={{ width: '50%', height: '200px' }}
      />
      <TextArea 
        value={newJson}
        onChange={(e) => setNewJson(e.target.value)}
        placeholder="JSON ChartData novo" 
        style={{ width: '50%', height: '200px' }}
      />
    </Flex>
  );
};

export default JsonTab;
