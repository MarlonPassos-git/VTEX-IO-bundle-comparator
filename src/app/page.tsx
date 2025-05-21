"use client";

import { Suspense } from "react";
import ChartDataComparator from "./components/ChartDataComparator";

// Importando o componente com carregamento dinâmico para evitar problemas de SSR


export default function Home() {
  return (
    <div className="bg-[#f7f9fc] text-gray-900 min-h-screen">
      <Suspense>
        <ChartDataComparator />
      </Suspense>
    </div>
  );
}
