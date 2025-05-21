"use client";

import dynamic from "next/dynamic";

// Importando o componente com carregamento dinâmico para evitar problemas de SSR
const ChartDataComparator = dynamic(
  () => import('./components/ChartDataComparator'),
  { ssr: false } // Desabilitando SSR pois o FoamTree depende do navegador
);

export default function Home() {
  return (
    <div className="bg-[#f7f9fc] text-gray-900 min-h-screen">
      <ChartDataComparator />
    </div>
  );
}
