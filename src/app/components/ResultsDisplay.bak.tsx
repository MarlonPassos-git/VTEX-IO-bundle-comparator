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
                <Text as="div" weight="bold" size="5">{formatBytes(bundleSize.new)}</Text>
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
                <Text as="div" weight="bold" size="5" >{formatBytes(parsedSize.new)}</Text>
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

        <Card size="3">
          <Flex direction="column" gap="2">
            <Text size="1" weight="bold" color="gray">TAMANHO GZIP</Text>
            {gzipSize.new > 0 ? (
              <Box>
                <Text as="div" weight="bold" size="5">{formatBytes(gzipSize.new)}</Text>
                <Text as="div" size="1" color="gray">Antes: {formatBytes(gzipSize.old)}</Text>
                <Flex align="center" gap="1" mt="1">
                  <Badge color={gzipSize.diff < 0 ? 'green' : gzipSize.diff > 0 ? 'red' : 'gray'}>
                    {gzipSize.diff < 0 ? '↓ ' : gzipSize.diff > 0 ? '↑ ' : ''}
                    {formatBytes(Math.abs(gzipSize.diff))} 
                    ({gzipSize.diff < 0 ? '-' : '+'}
                    {((Math.abs(gzipSize.diff) / (gzipSize.old || 1)) * 100).toFixed(2)}%)
                  </Badge>
                </Flex>
              </Box>
            ) : <Text>-</Text>}
          </Flex>

        </Card>
      </Grid>
      </Flex>
  );
};

export default ResultsDisplay;
