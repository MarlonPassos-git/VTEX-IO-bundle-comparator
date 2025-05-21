'use client';

import { useState, useEffect } from "react";
import * as Select from "@radix-ui/react-select";
import * as Tabs from "@radix-ui/react-tabs";
import * as Separator from "@radix-ui/react-separator";
import * as Label from "@radix-ui/react-label";

import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import { useRouter, useSearchParams } from "next/navigation";
import { ChartData, ComparisonResult, VtexBundleState } from './types';
import { extractChartDataFromHTML, runComparison } from './utils/chartUtils';
import JsonTab from './tabs/JsonTab';
import UrlTab from './tabs/UrlTab';
import VtexTab from './tabs/VtexTab';
import ResultsDisplay from './ResultsDisplay';

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
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Novos estados para VTEX IO bundle (agora separados para cada lado)
  const [vtexOld, setVtexOld] = useState<VtexBundleState>({
    workspace: "",
    account: "",
    app: "",
    version: "",
    env: "dev", // 'dev' ou 'prod'
    mode: "dev" // 'dev' ou 'prod'
  });
  const [vtexNew, setVtexNew] = useState<VtexBundleState>({
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
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

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

      runComparison(oldData, newData, {
        setBundleSize,
        setParsedSize,
        setGzipSize,
        setResults,
        setAdded,
        setRemoved
      });
    } catch (error) {
      console.error("Erro ao comparar dados:", error);
      alert("Erro ao comparar dados. Verifique o console para mais detalhes.");
    }
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
    
    // Resetar também os dados do VTEX
    setVtexOld({
      workspace: "",
      account: "",
      app: "",
      version: "",
      env: "dev",
      mode: "dev"
    });
    setVtexNew({
      workspace: "",
      account: "",
      app: "",
      version: "",
      env: "dev",
      mode: "dev"
    });
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
        </Tabs.List>        <Tabs.Content value="json">
          <JsonTab 
            oldJson={oldJson} 
            newJson={newJson} 
            setOldJson={setOldJson} 
            setNewJson={setNewJson} 
          />
        </Tabs.Content>

        <Tabs.Content value="url">
          <UrlTab 
            oldUrl={oldUrl} 
            newUrl={newUrl} 
            setOldUrl={setOldUrl} 
            setNewUrl={setNewUrl} 
          />
        </Tabs.Content>

        <Tabs.Content value="vtex">
          <VtexTab 
            vtexOld={vtexOld} 
            vtexNew={vtexNew} 
            setVtexOld={setVtexOld} 
            setVtexNew={setVtexNew} 
            oldUrl={oldUrl} 
            newUrl={newUrl} 
          />
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
      </div>      {/* Exibição dos resultados */}
      {results.length > 0 && (
        <ResultsDisplay 
          results={results}
          added={added}
          removed={removed}
          bundleSize={bundleSize}
          parsedSize={parsedSize}
          gzipSize={gzipSize}
        />
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
