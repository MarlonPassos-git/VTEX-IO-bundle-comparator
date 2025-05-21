'use client';

import { useState, useEffect } from "react";
import { 
  Container, 
  Heading, 
  Text, 
  Flex, 
  Tabs, 
  Box, 
  Select, 
  Separator, 
  Button,
  Card
} from "@radix-ui/themes";

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
  };  return (
    <Container size="4" px="4" py="8">
      <Flex direction="column" gap="6">
        <Box>
          <Heading as="h1" size="6" mb="2">📊 Relatório de Bundle ChartData</Heading>
          <Separator size="4" my="4" />
          <Text color="gray" size="2">Compare dois bundles ChartData para analisar diferenças de tamanho</Text>
        </Box>

        <Flex align="center" gap="2" mb="4">
          <Text weight="medium">Modo de entrada:</Text>
          <Select.Root value={inputMode} onValueChange={setInputMode}>
            <Select.Trigger placeholder="Selecione o modo" />
            <Select.Content position="popper">
              <Select.Item value="json">Colar JSON</Select.Item>
              <Select.Item value="url">Usar URLs HTML</Select.Item>
              <Select.Item value="vtex">VTEX IO bundle</Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>        <Card>
          <Box p="4">
            <Tabs.Root defaultValue="json" value={inputMode} onValueChange={setInputMode}>
              <Tabs.List>
                <Tabs.Trigger value="json">Entrada JSON</Tabs.Trigger>
                <Tabs.Trigger value="url">Entrada URL</Tabs.Trigger>
                <Tabs.Trigger value="vtex">VTEX IO bundle</Tabs.Trigger>
              </Tabs.List>
              
              <Box mt="4" mb="4">
                <Tabs.Content value="json">
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
              </Box>
            </Tabs.Root>

            <Flex gap="4" mb="6">
              <Button 
                onClick={handleCompare} 
                color="indigo"
              >
                Comparar
              </Button>
              <Button 
                onClick={clearData} 
                variant="soft"
                color="gray"
              >
                Limpar
              </Button>
            </Flex>
            
            {/* Exibição dos resultados */}
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
          </Box>
        </Card>
      </Flex>
    </Container>
  );
};

export default ChartDataComparator;

// Adicionando a definição global do CarrotSearchFoamTree
declare global {
  interface Window {
    CarrotSearchFoamTree: any;
  }
}
