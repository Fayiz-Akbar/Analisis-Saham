import * as React from "react";
import { StockCard } from "@/components/ui/stock-card";

// Sample data for demonstration (IDX80 constituents)
const stocksData = [
  {
    logoSrc: "https://assets.stockbit.com/logos/companies/BBCA.png",
    ticker: "BBCA",
    name: "Bank Central Asia Tbk.",
    price: 5950,
    change: 1.25,
  },
  {
    logoSrc: "https://assets.stockbit.com/logos/companies/BBRI.png",
    ticker: "BBRI",
    name: "Bank Rakyat Indonesia Tbk.",
    price: 3620,
    change: -1.35,
  },
  {
    logoSrc: "https://assets.stockbit.com/logos/companies/BMRI.png",
    ticker: "BMRI",
    name: "Bank Mandiri (Persero) Tbk.",
    price: 4980,
    change: 2.15,
  },
  {
    logoSrc: "https://assets.stockbit.com/logos/companies/TLKM.png",
    ticker: "TLKM",
    name: "Telkom Indonesia Tbk.",
    price: 2710,
    change: 0.85,
  },
  {
    logoSrc: "https://assets.stockbit.com/logos/companies/ASII.png",
    ticker: "ASII",
    name: "Astra International Tbk.",
    price: 4790,
    change: -2.25,
  },
];

export default function StockCardDemo() {
  const handleBuyStock = (ticker: string) => {
    alert(`Membuka analisis untuk emiten ${ticker}...`);
  };

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 p-6 flex items-center justify-center">
      <div className="flex flex-col gap-3 w-full max-w-md">
        {stocksData.map((stock) => (
          <StockCard
            key={stock.ticker}
            logoSrc={stock.logoSrc}
            ticker={stock.ticker}
            name={stock.name}
            price={stock.price}
            change={stock.change}
            onBuy={handleBuyStock}
          />
        ))}
      </div>
    </div>
  );
}
