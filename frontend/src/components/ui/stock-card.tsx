import * as React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Props for the StockCard component.
 */
export interface StockCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The source URL for the company logo. */
  logoSrc?: string;
  /** The stock ticker symbol (e.g., "BBCA"). */
  ticker: string;
  /** The full name of the company (e.g., "Bank Central Asia Tbk."). */
  name: string;
  /** The current price of the stock. */
  price: number;
  /** The percentage change in the stock price. Positive for gain, negative for loss. */
  change: number;
  /** Optional secondary label (e.g., trading volume or nominal change) */
  metricLabel?: string;
  /** Custom button label (default: "Detail") */
  actionLabel?: string;
  /** A callback function to be invoked when the card or button is clicked. */
  onBuy?: (ticker: string) => void;
}

const StockCard = React.forwardRef<HTMLDivElement, StockCardProps>(
  (
    {
      className,
      logoSrc,
      ticker,
      name,
      price,
      change,
      metricLabel,
      actionLabel = "Detail",
      onBuy,
      onClick,
      ...props
    },
    ref
  ) => {
    const [imgError, setImgError] = React.useState(false);
    const isPositiveChange = change >= 0;

    // Format harga Rupiah standar finansial Indonesia
    const formattedPrice =
      price != null && !isNaN(price)
        ? `Rp ${Number(price).toLocaleString("id-ID")}`
        : "—";

    // Format persentase perubahan dengan tanda + atau -
    const changeSign = change > 0 ? "+" : change < 0 ? "−" : "";
    const formattedChange = `${changeSign}${Math.abs(change).toFixed(2)}%`;

    const handleActionClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onBuy) {
        onBuy(ticker);
      }
    };

    return (
      <motion.div
        ref={ref}
        whileHover={{ y: -2, transition: { duration: 0.18 } }}
        onClick={onClick || (() => onBuy && onBuy(ticker))}
        className={cn(
          "flex items-center justify-between w-full p-4 select-none cursor-pointer",
          // Light Mode Styling (Crisp, clean, card shadow)
          "bg-white border border-slate-200/90 text-slate-900 shadow-xs hover:shadow-md hover:border-slate-300",
          // Dark Mode Styling (Bloomberg / Financial dashboard sleek)
          "dark:bg-[#12151e] dark:border-slate-800/90 dark:text-slate-100 dark:hover:border-slate-700 dark:hover:shadow-black/40",
          "rounded-2xl transition-all duration-200",
          className
        )}
        {...props}
      >
        {/* Left Section: Logo and Ticker Info */}
        <div className="flex items-center gap-3.5 min-w-0 pr-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 p-1.5 flex items-center justify-center flex-shrink-0 shadow-xs">
            {!imgError && logoSrc ? (
              <img
                src={logoSrc}
                alt={`${name} logo`}
                className="w-full h-full object-contain"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 font-mono">
                {ticker?.slice(0, 3)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-base tracking-tight text-slate-900 dark:text-white leading-tight">
              {ticker}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[140px] sm:max-w-[180px] mt-0.5">
              {name}
            </p>
          </div>
        </div>

        {/* Right Section: Price, Change Percent, and Action Button */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <div className="text-right">
            <p className="font-bold text-sm sm:text-base font-mono tabular-nums text-slate-900 dark:text-white leading-tight">
              {formattedPrice}
            </p>
            <div className="flex items-center justify-end gap-1 mt-0.5">
              {isPositiveChange ? (
                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 stroke-[2.5]" />
              )}
              <span
                className={cn(
                  "text-xs font-semibold font-mono tabular-nums",
                  isPositiveChange
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                )}
              >
                {formattedChange}
              </span>
            </div>
            {metricLabel && (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                {metricLabel}
              </p>
            )}
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleActionClick}
            aria-label={`${actionLabel} ${ticker}`}
            className="h-8 px-3 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 transition-colors shadow-none cursor-pointer"
          >
            {actionLabel}
          </Button>
        </div>
      </motion.div>
    );
  }
);

StockCard.displayName = "StockCard";

export { StockCard };
export default StockCard;
