'use client';

import { useState, useEffect, useRef } from "react";
import * as Select from "@radix-ui/react-select";
import * as Tabs from "@radix-ui/react-tabs";
import * as Separator from "@radix-ui/react-separator";
import * as Label from "@radix-ui/react-label";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import { useRouter, useSearchParams } from "next/navigation";

// Define os tipos para os dados
type ChartData = {
  label: string;
  statSize: number;
  parsedSize: number;
  gzipSize: number;
};

type ComparisonResult = {
  label: string;
  statSize: {
    label: string;
    value: number;
  };
  parsedSize: {
    label: string;
    value: number;
  };
  gzipSize: {
    label: string;
    value: number;
  };
};

const ChartDataComparator = () => {
  const [inputMode, setInputMode] = useState("json");
  const [oldJson, setOldJson] = useState("");
  const [newJson, setNewJson] = useState("");
  const [oldUrl, setOldUrl] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [added, setAdded] = useState<ChartData[]>([]);
  const [removed, setRemoved] = useState<ChartData[]>([]);
  const [bundleSize, setBundleSize] = useState({ old: 0, new: 0, diff: 0 });
  const [parsedSize, setParsedSize] = useState({ old: 0, new: 0, diff: 0 });
  const [gzipSize, setGzipSize] = useState({ old: 0, new: 0, diff: 0 });
  
  const foamtreeRef = useRef<HTMLDivElement>(null);
  const foamtreeInstance = useRef<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Novos estados para VTEX IO bundle (agora separados para cada lado)
  const [vtexOld, setVtexOld] = useState({
    workspace: "",
    account: "",
    app: "",
    version: "",
    env: "dev", // 'dev' ou 'prod'
    mode: "dev" // 'dev' ou 'prod'
  });
  const [vtexNew, setVtexNew] = useState({
    workspace: "",
    account: "",
    app: "",
    version: "",
    env: "dev",
    mode: "dev"
  });

  useEffect(() => {
    // Carrega a biblioteca FoamTree dinamicamente
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/carrotsearch.foamtree@3.1.0/carrotsearch.foamtree.js";
    script.async = true;
    script.onload = () => {
      // FoamTree está carregado e disponível globalmente
      if (results.length > 0) {
        renderFoamTree();
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      if (foamtreeInstance.current) {
        foamtreeInstance.current.dispose();
      }
    };
  }, []);

  // Renderiza o FoamTree quando os resultados mudarem
  useEffect(() => {
    if (results.length > 0 && window.CarrotSearchFoamTree) {
      renderFoamTree();
    }
  }, [results]);

  // Preenche os campos a partir dos query params ao montar
  useEffect(() => {
    const oldJsonParam = searchParams.get("oldJson") || "";
    const newJsonParam = searchParams.get("newJson") || "";
    const oldUrlParam = searchParams.get("oldUrl") || "";
    const newUrlParam = searchParams.get("newUrl") || "";
    if (oldJsonParam) setOldJson(decodeURIComponent(oldJsonParam));
    if (newJsonParam) setNewJson(decodeURIComponent(newJsonParam));
    if (oldUrlParam) setOldUrl(decodeURIComponent(oldUrlParam));
    if (newUrlParam) setNewUrl(decodeURIComponent(newUrlParam));
  }, []);

  // Atualiza os query params sempre que algum input mudar
  useEffect(() => {
    const params = new URLSearchParams();
    if (oldJson) params.set("oldJson", encodeURIComponent(oldJson));
    if (newJson) params.set("newJson", encodeURIComponent(newJson));
    if (oldUrl) params.set("oldUrl", encodeURIComponent(oldUrl));
    if (newUrl) params.set("newUrl", encodeURIComponent(newUrl));
    const query = params.toString();
    router.replace(`?${query}`, { scroll: false });
  }, [oldJson, newJson, oldUrl, newUrl]);

  // Atualiza URLs VTEX automaticamente
  useEffect(() => {
    if (inputMode !== "vtex") return;
    // Antigo
    let oldUrl = "";
    if (vtexOld.workspace && vtexOld.account && vtexOld.app && vtexOld.version) {
      if (vtexOld.mode === "dev") {
        oldUrl = `https://${vtexOld.workspace}--${vtexOld.account}.myvtex.com/_v/private/assets/v1/linked/${vtexOld.app}@${vtexOld.version}/public/react/devReport.html`;
      } else {
        oldUrl = `https://${vtexOld.workspace}--${vtexOld.account}.myvtex.com/_v/public/assets/v1/published/${vtexOld.app}@${vtexOld.version}/public/react/${vtexOld.env}Report.html`;
      }
    }
    // Novo
    let newUrl = "";
    if (vtexNew.workspace && vtexNew.account && vtexNew.app && vtexNew.version) {
      if (vtexNew.mode === "dev") {
        newUrl = `https://${vtexNew.workspace}--${vtexNew.account}.myvtex.com/_v/private/assets/v1/linked/${vtexNew.app}@${vtexNew.version}/public/react/devReport.html`;
      } else {
        newUrl = `https://${vtexNew.workspace}--${vtexNew.account}.myvtex.com/_v/public/assets/v1/published/${vtexNew.app}@${vtexNew.version}/public/react/${vtexNew.env}Report.html`;
      }
    }
    setOldUrl(oldUrl);
    setNewUrl(newUrl);
  }, [inputMode, vtexOld, vtexNew]);

  const renderFoamTree = () => {
    if (!foamtreeRef.current || !window.CarrotSearchFoamTree) return;
    
    // Limpa a instância anterior, se existir
    if (foamtreeInstance.current) {
      foamtreeInstance.current.dispose();
    }

    const groups = results.map(item => ({
      label: item.label,
      weight: Math.max(Math.abs(item.parsedSize.value), 0.001),
      color: item.parsedSize.value < 0 ? 
             { r: 76, g: 175, b: 80, a: 0.8 } : // Verde para redução
             { r: 244, g: 67, b: 54, a: 0.8 }   // Vermelho para aumento
    }));

    foamtreeInstance.current = new window.CarrotSearchFoamTree({
      id: foamtreeRef.current,
      dataObject: { groups },
      pixelRatio: window.devicePixelRatio || 1,
      layout: "squarified",
      stacking: "flattened",
      groupBorderWidth: 1.5,
      groupBorderRadius: 3,
      groupFillType: "plain",
      wireframeLabelDrawing: "always",
      rolloutDuration: 0.5,
      pullbackDuration: 0.5,
      fadeDuration: 0.2,
      zoomMouseWheelFactor: 1.5,
      openCloseDuration: 0.2,
      rolloutStartPoint: "center"
    });
  };

  const handleCompare = async () => {
    let oldData: ChartData[] = [], newData: ChartData[] = [];

    try {
      if (inputMode === "json") {
        oldData = JSON.parse(oldJson);
        newData = JSON.parse(newJson);
      } else {
        const oldHtmlResponse = await fetch(oldUrl);
        const newHtmlResponse = await fetch(newUrl);
        const oldHtml = await oldHtmlResponse.text();
        const newHtml = await newHtmlResponse.text();
        
        oldData = extractChartDataFromHTML(oldHtml);
        newData = extractChartDataFromHTML(newHtml);
      }

      runComparison(oldData, newData);
    } catch (error) {
      console.error("Erro ao comparar dados:", error);
      alert("Erro ao comparar dados. Verifique o console para mais detalhes.");
    }
  };

    function extractChartDataFromHTML(html:any) {
      const scriptMatch = html.match(/<script[^>]*>\s*window\.chartData\s*=\s*(\[.*?\]);/s);
      if (!scriptMatch) {
        alert("chartData not found in HTML.");
        return [];
      }
      return JSON.parse(scriptMatch[1]);
    }



  const runComparison = (oldData: ChartData[], newData: ChartData[]) => {
    const result: ComparisonResult[] = [];
    let totalOldStat = 0, totalNewStat = 0;
    let totalOldParsed = 0, totalNewParsed = 0;
    let totalOldGzip = 0, totalNewGzip = 0;

    oldData.forEach(oldItem => {
      const newItem = newData.find(n => n.label === oldItem.label);
      if (newItem) {
        const statDiff = newItem.statSize - oldItem.statSize;
        const parsedDiff = newItem.parsedSize - oldItem.parsedSize;
        const gzipDiff = newItem.gzipSize - oldItem.gzipSize;

        totalOldStat += oldItem.statSize;
        totalNewStat += newItem.statSize;
        totalOldParsed += oldItem.parsedSize;
        totalNewParsed += newItem.parsedSize;
        totalOldGzip += oldItem.gzipSize;
        totalNewGzip += newItem.gzipSize;

        result.push({
          label: oldItem.label,
          statSize: {
            label: createDiffSpan(oldItem.statSize, newItem.statSize, statDiff),
            value: statDiff
          },
          parsedSize: {
            label: createDiffSpan(oldItem.parsedSize, newItem.parsedSize, parsedDiff),
            value: parsedDiff
          },
          gzipSize: {
            label: createDiffSpan(oldItem.gzipSize, newItem.gzipSize, gzipDiff),
            value: gzipDiff
          }
        });
      }
    });

    const addedItems = newData.filter(n => !oldData.find(o => o.label === n.label));
    const removedItems = oldData.filter(o => !newData.find(n => n.label === o.label));

    setBundleSize({
      old: totalOldStat,
      new: totalNewStat,
      diff: totalNewStat - totalOldStat
    });
    
    setParsedSize({
      old: totalOldParsed,
      new: totalNewParsed,
      diff: totalNewParsed - totalOldParsed
    });
    
    setGzipSize({
      old: totalOldGzip,
      new: totalNewGzip,
      diff: totalNewGzip - totalOldGzip
    });

    setResults(result);
    setAdded(addedItems);
    setRemoved(removedItems);
  };

  const clearData = () => {
    setOldJson("");
    setNewJson("");
    setOldUrl("");
    setNewUrl("");
    setResults([]);
    setAdded([]);
    setRemoved([]);
    setBundleSize({ old: 0, new: 0, diff: 0 });
    setParsedSize({ old: 0, new: 0, diff: 0 });
    setGzipSize({ old: 0, new: 0, diff: 0 });
  };

  // Funções de formatação
  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    const kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(2) + ' KB';
    return (kb / 1024).toFixed(2) + ' MB';
  };

  const createDiffSpan = (oldVal: number, newVal: number, diff: number): string => {
    const cls = diff < 0 ? 'text-green-600' : (diff > 0 ? 'text-red-600' : 'text-gray-700');
    const sign = diff < 0 ? '↓ ' : (diff > 0 ? '↑ ' : '');
    const diffFormatted = formatBytes(Math.abs(diff));
    const percentage = ((Math.abs(diff) / (oldVal || 1)) * 100).toFixed(2);
    
    return `
      <div class="flex flex-col">
        <div class="font-medium">${formatBytes(newVal)}</div>
        <div class="text-xs text-gray-500">era ${formatBytes(oldVal)}</div>
        <div class="${cls} text-xs font-medium flex items-center mt-1">
          ${sign}${diffFormatted} (${diff < 0 ? '-' : '+'}${percentage}%)
        </div>
      </div>
    `;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">📊 Relatório de Bundle ChartData</h1>
        <Separator.Root className="h-[1px] bg-gray-200 my-4" />
        <p className="text-gray-600">Compare dois bundles ChartData para analisar diferenças de tamanho</p>
      </header>

      <div className="mb-4">
        <Label.Root className="mr-4 font-medium" htmlFor="inputMode">
          Modo de entrada:
        </Label.Root>
        <Select.Root value={inputMode} onValueChange={setInputMode}>
          <Select.Trigger 
            className="p-2 rounded border border-gray-300 inline-flex gap-1 items-center justify-between min-w-[160px]"
            aria-label="Selecione o modo de entrada"
          >
            <Select.Value placeholder="Selecione o modo" />
            <Select.Icon className="text-gray-500">
              <ChevronDownIcon />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content 
              className="bg-white shadow-lg rounded-md overflow-hidden z-50 border border-gray-200"
              position="popper"
              sideOffset={5}
            >
              <Select.ScrollUpButton className="flex items-center justify-center h-6 bg-white text-gray-700 cursor-default">
                <ChevronUpIcon />
              </Select.ScrollUpButton>
              <Select.Viewport className="p-1">
                <Select.Item value="json" className="relative flex items-center h-8 px-6 rounded text-sm text-gray-700 hover:bg-blue-100 data-[highlighted]:bg-blue-100 data-[highlighted]:outline-none data-[highlighted]:text-blue-900 select-none">
                  <Select.ItemText>Colar JSON</Select.ItemText>
                  <Select.ItemIndicator className="absolute left-1 inline-flex items-center justify-center">
                    <CheckIcon />
                  </Select.ItemIndicator>
                </Select.Item>
                <Select.Item value="url" className="relative flex items-center h-8 px-6 rounded text-sm text-gray-700 hover:bg-blue-100 data-[highlighted]:bg-blue-100 data-[highlighted]:outline-none data-[highlighted]:text-blue-900 select-none">
                  <Select.ItemText>Usar URLs HTML</Select.ItemText>
                  <Select.ItemIndicator className="absolute left-1 inline-flex items-center justify-center">
                    <CheckIcon />
                  </Select.ItemIndicator>
                </Select.Item>
                <Select.Item value="vtex" className="relative flex items-center h-8 px-6 rounded text-sm text-gray-700 hover:bg-blue-100 data-[highlighted]:bg-blue-100 data-[highlighted]:outline-none data-[highlighted]:text-blue-900 select-none">
                  <Select.ItemText>VTEX IO bundle</Select.ItemText>
                  <Select.ItemIndicator className="absolute left-1 inline-flex items-center justify-center">
                    <CheckIcon />
                  </Select.ItemIndicator>
                </Select.Item>
              </Select.Viewport>
              <Select.ScrollDownButton className="flex items-center justify-center h-6 bg-white text-gray-700 cursor-default">
                <ChevronDownIcon />
              </Select.ScrollDownButton>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      <Tabs.Root defaultValue="json" value={inputMode} onValueChange={setInputMode}>
        <Tabs.List className="flex border-b border-gray-200 mb-4">
          <Tabs.Trigger 
            value="json" 
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 focus:outline-none"
          >
            Entrada JSON
          </Tabs.Trigger>
          <Tabs.Trigger 
            value="url" 
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 focus:outline-none"
          >
            Entrada URL
          </Tabs.Trigger>
          <Tabs.Trigger 
            value="vtex" 
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 focus:outline-none"
          >
            VTEX IO bundle
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="json" className="flex gap-4 mb-6">
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
        </Tabs.Content>

        <Tabs.Content value="url" className="flex gap-4 mb-6">
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
        </Tabs.Content>

        <Tabs.Content value="vtex" className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Antigo */}
            <div className="flex-1 border rounded p-4 bg-gray-50">
              <div className="font-semibold mb-2 text-gray-700">Bundle Antigo</div>
              <div className="flex flex-col gap-2">
                <input value={vtexOld.workspace} onChange={e => setVtexOld(o => ({...o, workspace: e.target.value}))} placeholder="Workspace" className="p-2 rounded border border-gray-300" />
                <input value={vtexOld.account} onChange={e => setVtexOld(o => ({...o, account: e.target.value}))} placeholder="Account" className="p-2 rounded border border-gray-300" />
                <input value={vtexOld.app} onChange={e => setVtexOld(o => ({...o, app: e.target.value}))} placeholder="App" className="p-2 rounded border border-gray-300" />
                <input value={vtexOld.version} onChange={e => setVtexOld(o => ({...o, version: e.target.value}))} placeholder="Version" className="p-2 rounded border border-gray-300" />
                <div className="flex gap-2 items-center">
                  <label className="font-medium">Ambiente:</label>
                  <select value={vtexOld.env} onChange={e => setVtexOld(o => ({...o, env: e.target.value}))} className="p-2 rounded border border-gray-300">
                    <option value="dev">dev</option>
                    <option value="prod">prod</option>
                  </select>
                  <label className="font-medium ml-2">Modo:</label>
                  <select value={vtexOld.mode} onChange={e => setVtexOld(o => ({...o, mode: e.target.value}))} className="p-2 rounded border border-gray-300">
                    <option value="dev">Desenvolvimento</option>
                    <option value="prod">Produção</option>
                  </select>
                </div>
                <input value={oldUrl} readOnly className="p-2 rounded border border-gray-300 bg-gray-100 text-gray-600 mt-2" placeholder="URL do relatório antigo gerada automaticamente" />
              </div>
            </div>
            {/* Novo */}
            <div className="flex-1 border rounded p-4 bg-gray-50">
              <div className="font-semibold mb-2 text-gray-700">Bundle Novo</div>
              <div className="flex flex-col gap-2">
                <input value={vtexNew.workspace} onChange={e => setVtexNew(o => ({...o, workspace: e.target.value}))} placeholder="Workspace" className="p-2 rounded border border-gray-300" />
                <input value={vtexNew.account} onChange={e => setVtexNew(o => ({...o, account: e.target.value}))} placeholder="Account" className="p-2 rounded border border-gray-300" />
                <input value={vtexNew.app} onChange={e => setVtexNew(o => ({...o, app: e.target.value}))} placeholder="App" className="p-2 rounded border border-gray-300" />
                <input value={vtexNew.version} onChange={e => setVtexNew(o => ({...o, version: e.target.value}))} placeholder="Version" className="p-2 rounded border border-gray-300" />
                <div className="flex gap-2 items-center">
                  <label className="font-medium">Ambiente:</label>
                  <select value={vtexNew.env} onChange={e => setVtexNew(o => ({...o, env: e.target.value}))} className="p-2 rounded border border-gray-300">
                    <option value="dev">dev</option>
                    <option value="prod">prod</option>
                  </select>
                  <label className="font-medium ml-2">Modo:</label>
                  <select value={vtexNew.mode} onChange={e => setVtexNew(o => ({...o, mode: e.target.value}))} className="p-2 rounded border border-gray-300">
                    <option value="dev">Desenvolvimento</option>
                    <option value="prod">Produção</option>
                  </select>
                </div>
                <input value={newUrl} readOnly className="p-2 rounded border border-gray-300 bg-gray-100 text-gray-600 mt-2" placeholder="URL do relatório novo gerada automaticamente" />
              </div>
            </div>
          </div>
        </Tabs.Content>
      </Tabs.Root>

      <div className="flex gap-4 mb-6">
        <button 
          onClick={handleCompare} 
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Comparar
        </button>
        <button 
          onClick={clearData} 
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
        >
          Limpar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 shadow rounded border-l-4 border-blue-500 transition-all hover:shadow-md">
          <div className="text-xs uppercase text-gray-500 tracking-wider mb-1">TAMANHO DO BUNDLE</div>
          <div className="font-mono text-lg">
            {bundleSize.new > 0 ? (
              <>
                <div className="font-semibold">{formatBytes(bundleSize.new)}</div>
                <div className="text-sm text-gray-400 flex items-center gap-1">
                  <span>Antes:</span>
                  <span>{formatBytes(bundleSize.old)}</span>
                </div>
                <div className={`text-xs flex items-center mt-1 ${bundleSize.diff < 0 ? 'text-green-600' : bundleSize.diff > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {bundleSize.diff < 0 ? '↓ ' : bundleSize.diff > 0 ? '↑ ' : ''}
                  {formatBytes(Math.abs(bundleSize.diff))} 
                  <span className="ml-1">
                    ({bundleSize.diff < 0 ? '-' : '+'}
                    {((Math.abs(bundleSize.diff) / (bundleSize.old || 1)) * 100).toFixed(2)}%)
                  </span>
                </div>
              </>
            ) : "-"}
          </div>
        </div>
        <div className="bg-white p-4 shadow rounded border-l-4 border-purple-500 transition-all hover:shadow-md">
          <div className="text-xs uppercase text-gray-500 tracking-wider mb-1">TAMANHO PARSEADO</div>
          <div className="font-mono text-lg">
            {parsedSize.new > 0 ? (
              <>
                <div className="font-semibold">{formatBytes(parsedSize.new)}</div>
                <div className="text-sm text-gray-400 flex items-center gap-1">
                  <span>Antes:</span>
                  <span>{formatBytes(parsedSize.old)}</span>
                </div>
                <div className={`text-xs flex items-center mt-1 ${parsedSize.diff < 0 ? 'text-green-600' : parsedSize.diff > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {parsedSize.diff < 0 ? '↓ ' : parsedSize.diff > 0 ? '↑ ' : ''}
                  {formatBytes(Math.abs(parsedSize.diff))} 
                  <span className="ml-1">
                    ({parsedSize.diff < 0 ? '-' : '+'}
                    {((Math.abs(parsedSize.diff) / (parsedSize.old || 1)) * 100).toFixed(2)}%)
                  </span>
                </div>
              </>
            ) : "-"}
          </div>
        </div>
        <div className="bg-white p-4 shadow rounded border-l-4 border-green-500 transition-all hover:shadow-md">
          <div className="text-xs uppercase text-gray-500 tracking-wider mb-1">TAMANHO GZIP</div>
          <div className="font-mono text-lg">
            {gzipSize.new > 0 ? (
              <>
                <div className="font-semibold">{formatBytes(gzipSize.new)}</div>
                <div className="text-sm text-gray-400 flex items-center gap-1">
                  <span>Antes:</span>
                  <span>{formatBytes(gzipSize.old)}</span>
                </div>
                <div className={`text-xs flex items-center mt-1 ${gzipSize.diff < 0 ? 'text-green-600' : gzipSize.diff > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {gzipSize.diff < 0 ? '↓ ' : gzipSize.diff > 0 ? '↑ ' : ''}
                  {formatBytes(Math.abs(gzipSize.diff))} 
                  <span className="ml-1">
                    ({gzipSize.diff < 0 ? '-' : '+'}
                    {((Math.abs(gzipSize.diff) / (gzipSize.old || 1)) * 100).toFixed(2)}%)
                  </span>
                </div>
              </>
            ) : "-"}
          </div>
        </div>
      </div>

      {(added.length > 0 || removed.length > 0) && (
        <div className="bg-white shadow p-4 rounded mb-6">
          <h2 className="text-lg font-semibold mb-2">Arquivos Adicionados e Removidos</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded p-3">
              <h3 className="text-md font-medium mb-2 text-green-700">Adicionados ({added.length})</h3>
              {added.length > 0 ? (
                <ul className="space-y-1 max-h-[200px] overflow-y-auto">
                  {added.map((item, index) => (
                    <li key={`added-${index}`} className="flex justify-between text-sm">
                      <span className="font-mono truncate flex-1">{item.label}</span>
                      <span className="text-green-600 ml-2 whitespace-nowrap">{formatBytes(item.statSize)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm italic">Nenhum arquivo adicionado</p>
              )}
            </div>
            
            <div className="border rounded p-3">
              <h3 className="text-md font-medium mb-2 text-red-700">Removidos ({removed.length})</h3>
              {removed.length > 0 ? (
                <ul className="space-y-1 max-h-[200px] overflow-y-auto">
                  {removed.map((item, index) => (
                    <li key={`removed-${index}`} className="flex justify-between text-sm">
                      <span className="font-mono truncate flex-1">{item.label}</span>
                      <span className="text-red-600 ml-2 whitespace-nowrap">{formatBytes(item.statSize)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm italic">Nenhum arquivo removido</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-4">Visualização FoamTree (por Tamanho Parseado)</h2>
        <div className="border rounded-md p-1 bg-gray-50">
          <div ref={foamtreeRef} style={{ width: "100%", height: "400px" }}></div>
          <div className="text-xs text-center text-gray-500 mt-2">Clique nos segmentos para ampliar. Clique duplo para voltar.</div>
        </div>
      </div>

      {results.length > 0 && (
        <div className="bg-white shadow p-4 rounded">
          <h2 className="text-lg font-semibold mb-4">Resultados da Comparação</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3 text-left border-b border-gray-200 font-semibold text-gray-700">Rótulo</th>
                  <th className="p-3 text-left border-b border-gray-200 font-semibold text-gray-700">Tamanho Bruto</th>
                  <th className="p-3 text-left border-b border-gray-200 font-semibold text-gray-700">Tamanho Parseado</th>
                  <th className="p-3 text-left border-b border-gray-200 font-semibold text-gray-700">Tamanho Gzip</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3 border-b border-gray-200 font-mono text-xs">{row.label}</td>
                    <td className="p-3 border-b border-gray-200" dangerouslySetInnerHTML={{ __html: row.statSize.label }}></td>
                    <td className="p-3 border-b border-gray-200" dangerouslySetInnerHTML={{ __html: row.parsedSize.label }}></td>
                    <td className="p-3 border-b border-gray-200" dangerouslySetInnerHTML={{ __html: row.gzipSize.label }}></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartDataComparator;

// Adicionando a definição global do CarrotSearchFoamTree
declare global {
  interface Window {
    CarrotSearchFoamTree: any;
  }
}
