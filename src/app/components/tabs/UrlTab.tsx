import React from 'react';
import { Flex, TextField, Box } from '@radix-ui/themes';

type UrlTabProps = {
  oldUrl: string;
  newUrl: string;
  setOldUrl: (value: string) => void;
  setNewUrl: (value: string) => void;
};

const UrlTab: React.FC<UrlTabProps> = ({ oldUrl, newUrl, setOldUrl, setNewUrl }) => {
  return (
    <Flex gap="4" mb="6">
      <Box style={{ width: '50%' }}>
        <TextField.Root
            className="rt-reset rt-TextFieldInput"
            type='url'
            value={oldUrl}
            onChange={(e) => setOldUrl(e.target.value)}
            placeholder="URL do relatório HTML antigo" 
            spellCheck="false"
        />
      </Box>
      <Box style={{ width: '50%' }}>
        <TextField.Root
            className="rt-reset rt-TextFieldInput"
            type='url'
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="URL do relatório HTML novo" 
            spellCheck="false"
        />
      </Box>
    </Flex>
  );
};

export default UrlTab;
