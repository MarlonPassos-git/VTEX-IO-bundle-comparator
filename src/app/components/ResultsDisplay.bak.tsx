import React, { useEffect, useRef } from 'react';
import { ComparisonResult } from './types';
import { formatBytes } from './utils/chartUtils';
import { 
  Card, 
  Flex, 
  Box, 
  Text, 
  Table, 
  Badge, 
  Heading, 
  Grid, 
  ScrollArea, 
  Separator,
  Inset
} from '@radix-ui/themes';

type ResultsDisplayProps = {
  results: ComparisonResult[];
  added: any[];
  removed: any[];
  bundleSize: { old: number; new: number; diff: number };
  parsedSize: { old: number; new: number; diff: number };
  gzipSize: { old: number; new: number; diff: number };
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  results,
  added,
  removed,
  bundleSize,
  parsedSize,
  gzipSize
}) => {
  const foamtreeRef = useRef<HTMLDivElement>(null);
  const foamtreeInstance = useRef<any>(null);

  useEffect(() => {
    if (results.length > 0 && window.CarrotSearchFoamTree) {
      renderFoamTree();
    }
  }, [results]);

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

  return (
    <Flex direction="column" gap="6">
      <Grid columns="3" gap="4" width="100%">
        <Card size="3">
          <Flex direction="column" gap="2">
            <Text size="1" weight="bold" color="gray">TAMANHO DO BUNDLE</Text>
            {bundleSize.new > 0 ? (
              <Box>
                <Text as="div" weight="bold" size="5" font="mono">{formatBytes(bundleSize.new)}</Text>
                <Text as="div" size="1" color="gray">Antes: {formatBytes(bundleSize.old)}</Text>
                <Flex align="center" gap="1" mt="1">
                  <Badge color={bundleSize.diff < 0 ? 'green' : bundleSize.diff > 0 ? 'red' : 'gray'}>
                    {bundleSize.diff < 0 ? '↓ ' : bundleSize.diff > 0 ? '↑ ' : ''}
                    {formatBytes(Math.abs(bundleSize.diff))} 
                    ({bundleSize.diff < 0 ? '-' : '+'}
                    {((Math.abs(bundleSize.diff) / (bundleSize.old || 1)) * 100).toFixed(2)}%)
                  </Badge>
                </Flex>
              </Box>
            ) : <Text>-</Text>}
          </Flex>
        </Card>

        <Card size="3">
          <Flex direction="column" gap="2">
            <Text size="1" weight="bold" color="gray">TAMANHO PARSEADO</Text>
            {parsedSize.new > 0 ? (
              <Box>
                <Text as="div" weight="bold" size="5" font="mono">{formatBytes(parsedSize.new)}</Text>
                <Text as="div" size="1" color="gray">Antes: {formatBytes(parsedSize.old)}</Text>
                <Flex align="center" gap="1" mt="1">
                  <Badge color={parsedSize.diff < 0 ? 'green' : parsedSize.diff > 0 ? 'red' : 'gray'}>
                    {parsedSize.diff < 0 ? '↓ ' : parsedSize.diff > 0 ? '↑ ' : ''}
                    {formatBytes(Math.abs(parsedSize.diff))} 
                    ({parsedSize.diff < 0 ? '-' : '+'}
                    {((Math.abs(parsedSize.diff) / (parsedSize.old || 1)) * 100).toFixed(2)}%)
                  </Badge>
                </Flex>
              </Box>
            ) : <Text>-</Text>}
          </Flex>
        </Card>
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
    </>
  );
};

export default ResultsDisplay;
