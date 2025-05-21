import React from 'react';

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
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Antigo */}
        <div className="flex-1 border rounded p-4 bg-gray-50">
          <div className="font-semibold mb-2 text-gray-700">Bundle Antigo</div>
          <div className="flex flex-col gap-2">
            <input 
              value={vtexOld.workspace} 
              onChange={e => setVtexOld(o => ({...o, workspace: e.target.value}))} 
              placeholder="Workspace" 
              className="p-2 rounded border border-gray-300" 
            />
            <input 
              value={vtexOld.account} 
              onChange={e => setVtexOld(o => ({...o, account: e.target.value}))} 
              placeholder="Account" 
              className="p-2 rounded border border-gray-300" 
            />
            <input 
              value={vtexOld.app} 
              onChange={e => setVtexOld(o => ({...o, app: e.target.value}))} 
              placeholder="App" 
              className="p-2 rounded border border-gray-300" 
            />
            <input 
              value={vtexOld.version} 
              onChange={e => setVtexOld(o => ({...o, version: e.target.value}))} 
              placeholder="Version" 
              className="p-2 rounded border border-gray-300" 
            />
            <div className="flex gap-2 items-center">
              <label className="font-medium">Ambiente:</label>
              <select 
                value={vtexOld.env} 
                onChange={e => setVtexOld(o => ({...o, env: e.target.value}))} 
                className="p-2 rounded border border-gray-300"
              >
                <option value="dev">dev</option>
                <option value="prod">prod</option>
              </select>
              <label className="font-medium ml-2">Modo:</label>
              <select 
                value={vtexOld.mode} 
                onChange={e => setVtexOld(o => ({...o, mode: e.target.value}))} 
                className="p-2 rounded border border-gray-300"
              >
                <option value="dev">Desenvolvimento</option>
                <option value="prod">Produção</option>
              </select>
            </div>
            <input 
              value={oldUrl} 
              readOnly 
              className="p-2 rounded border border-gray-300 bg-gray-100 text-gray-600 mt-2" 
              placeholder="URL do relatório antigo gerada automaticamente" 
            />
          </div>
        </div>
        
        {/* Novo */}
        <div className="flex-1 border rounded p-4 bg-gray-50">
          <div className="font-semibold mb-2 text-gray-700">Bundle Novo</div>
          <div className="flex flex-col gap-2">
            <input 
              value={vtexNew.workspace} 
              onChange={e => setVtexNew(o => ({...o, workspace: e.target.value}))} 
              placeholder="Workspace" 
              className="p-2 rounded border border-gray-300" 
            />
            <input 
              value={vtexNew.account} 
              onChange={e => setVtexNew(o => ({...o, account: e.target.value}))} 
              placeholder="Account" 
              className="p-2 rounded border border-gray-300" 
            />
            <input 
              value={vtexNew.app} 
              onChange={e => setVtexNew(o => ({...o, app: e.target.value}))} 
              placeholder="App" 
              className="p-2 rounded border border-gray-300" 
            />
            <input 
              value={vtexNew.version} 
              onChange={e => setVtexNew(o => ({...o, version: e.target.value}))} 
              placeholder="Version" 
              className="p-2 rounded border border-gray-300" 
            />
            <div className="flex gap-2 items-center">
              <label className="font-medium">Ambiente:</label>
              <select 
                value={vtexNew.env} 
                onChange={e => setVtexNew(o => ({...o, env: e.target.value}))} 
                className="p-2 rounded border border-gray-300"
              >
                <option value="dev">dev</option>
                <option value="prod">prod</option>
              </select>
              <label className="font-medium ml-2">Modo:</label>
              <select 
                value={vtexNew.mode} 
                onChange={e => setVtexNew(o => ({...o, mode: e.target.value}))} 
                className="p-2 rounded border border-gray-300"
              >
                <option value="dev">Desenvolvimento</option>
                <option value="prod">Produção</option>
              </select>
            </div>
            <input 
              value={newUrl} 
              readOnly 
              className="p-2 rounded border border-gray-300 bg-gray-100 text-gray-600 mt-2" 
              placeholder="URL do relatório novo gerada automaticamente" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VtexTab;
