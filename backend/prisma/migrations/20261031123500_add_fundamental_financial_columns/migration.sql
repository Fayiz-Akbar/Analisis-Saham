-- AlterTable
ALTER TABLE "stock_fundamentals" ADD COLUMN     "cash_equivalents" DECIMAL(20,2),
ADD COLUMN     "financial_period" VARCHAR(50) DEFAULT 'TTM / FY2024',
ADD COLUMN     "net_income" DECIMAL(20,2),
ADD COLUMN     "net_income_growth" DECIMAL(8,4),
ADD COLUMN     "revenue" DECIMAL(20,2),
ADD COLUMN     "revenue_growth" DECIMAL(8,4),
ADD COLUMN     "total_assets" DECIMAL(20,2),
ADD COLUMN     "total_equity" DECIMAL(20,2),
ADD COLUMN     "total_liabilities" DECIMAL(20,2);
