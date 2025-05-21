import React from 'react';
import { Box, Flex, Text, TextField, Select, Card } from '@radix-ui/themes';

export type VtexBundleState = {
  workspace: string;
  account: string;
  app: string;
  version: string;
  env: string;
  mode: string;
};

type VtexTabProps = {
  vtexOld: VtexBundleState;
  vtexNew: VtexBundleState;
  setVtexOld: (value: VtexBundleState | ((prev: VtexBundleState) => VtexBundleState)) => void;
  setVtexNew: (value: VtexBundleState | ((prev: VtexBundleState) => VtexBundleState)) => void;
  oldUrl: string;
  newUrl: string;
};

const VtexTab: React.FC<VtexTabProps> = ({ 
  vtexOld, 
  vtexNew, 
  setVtexOld, 
  setVtexNew, 
  oldUrl, 
  newUrl 
}) => {
  return (
    <Flex direction="column" gap="4" mb="6">
      <Flex direction={{initial: "column", md: "row"}} gap="8">
        {/* Antigo */}
        <Card style={{flex: 1}} variant="surface">
          <Box p="4">
            <Text weight="medium" mb="2" color="gray">Bundle Antigo</Text>
            <Flex direction="column" gap="2">
              <TextField.Root
                  className="rt-reset rt-TextFieldInput"
                  value={vtexOld.workspace}
                  onChange={e => setVtexOld(o => ({...o, workspace: e.target.value}))}
                  placeholder="Workspace"
                />
              
              <TextField.Root
                  className="rt-reset rt-TextFieldInput"
                  value={vtexOld.account}
                  onChange={e => setVtexOld(o => ({...o, account: e.target.value}))}
                  placeholder="Account"
                />
              
              <TextField.Root
                  className="rt-reset rt-TextFieldInput"
                  value={vtexOld.app}
                  onChange={e => setVtexOld(o => ({...o, app: e.target.value}))}
                  placeholder="App"
              />
              
              <TextField.Root
                  className="rt-reset rt-TextFieldInput"
                  value={vtexOld.version}
                  onChange={e => setVtexOld(o => ({...o, version: e.target.value}))}
                  placeholder="Version"
                />
              
              <Flex gap="2" align="center">
                <Text weight="medium">Ambiente:</Text>
                <Select.Root 
                  value={vtexOld.env} 
                  onValueChange={(value) => setVtexOld(o => ({...o, env: value}))}
                >
                  <Select.Trigger />
                  <Select.Content>
                    <Select.Item value="dev">dev</Select.Item>
                    <Select.Item value="prod">prod</Select.Item>
                  </Select.Content>
                </Select.Root>
                
                <Text weight="medium" ml="2">Modo:</Text>
                <Select.Root 
                  value={vtexOld.mode} 
                  onValueChange={(value) => setVtexOld(o => ({...o, mode: value}))}
                >
                  <Select.Trigger />
                  <Select.Content>
                    <Select.Item value="dev">Desenvolvimento</Select.Item>
                    <Select.Item value="prod">Produção</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Flex>
              
              <TextField.Root
                  className="rt-reset rt-TextFieldInput"
                  value={oldUrl}
                  readOnly
                  style={{backgroundColor: 'var(--gray-3)'}}
                  placeholder="URL do relatório antigo gerada automaticamente"
                />
            </Flex>
          </Box>
        </Card>
        
        {/* Novo */}
        <Card style={{flex: 1}} variant="surface">
          <Box p="4">
            <Text weight="medium" mb="2" color="gray">Bundle Novo</Text>
            <Flex direction="column" gap="2">
              <TextField.Root
                  className="rt-reset rt-TextFieldInput"
                  value={vtexNew.workspace}
                  onChange={e => setVtexNew(o => ({...o, workspace: e.target.value}))}
                  placeholder="Workspace"
                />
              
              <TextField.Root
                  className="rt-reset rt-TextFieldInput"
                  value={vtexNew.account}
                  onChange={e => setVtexNew(o => ({...o, account: e.target.value}))}
                  placeholder="Account"
                />
              
              <TextField.Root
                  className="rt-reset rt-TextFieldInput"
                  value={vtexNew.app}
                  onChange={e => setVtexNew(o => ({...o, app: e.target.value}))}
                  placeholder="App"
                />
              
              <TextField.Root
                  className="rt-reset rt-TextFieldInput"
                  value={vtexNew.version}
                  onChange={e => setVtexNew(o => ({...o, version: e.target.value}))}
                  placeholder="Version"
                />
              
              <Flex gap="2" align="center">
                <Text weight="medium">Ambiente:</Text>
                <Select.Root 
                  value={vtexNew.env} 
                  onValueChange={(value) => setVtexNew(o => ({...o, env: value}))}
                >
                  <Select.Trigger />
                  <Select.Content>
                    <Select.Item value="dev">dev</Select.Item>
                    <Select.Item value="prod">prod</Select.Item>
                  </Select.Content>
                </Select.Root>
                
                <Text weight="medium" ml="2">Modo:</Text>
                <Select.Root 
                  value={vtexNew.mode} 
                  onValueChange={(value) => setVtexNew(o => ({...o, mode: value}))}
                >
                  <Select.Trigger />
                  <Select.Content>
                    <Select.Item value="dev">Desenvolvimento</Select.Item>
                    <Select.Item value="prod">Produção</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Flex>
              
              <TextField.Root>
                <input
                  className="rt-reset rt-TextFieldInput"
                  value={newUrl}
                  readOnly
                  style={{backgroundColor: 'var(--gray-3)'}}
                  placeholder="URL do relatório novo gerada automaticamente"
                />
              </TextField.Root>
            </Flex>
          </Box>
        </Card>
      </Flex>
    </Flex>
  );
};

export default VtexTab;
