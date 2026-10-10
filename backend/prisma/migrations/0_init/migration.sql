-- CreateEnum
CREATE TYPE "InvestorProfile" AS ENUM ('BEGINNER', 'EXPERIENCED');

-- CreateEnum
CREATE TYPE "SentimentLabel" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE');

-- CreateEnum
CREATE TYPE "MacroCategory" AS ENUM ('GLOBAL_INDEX', 'COMMODITY');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "LearningCategory" AS ENUM ('BEGINNER', 'FUNDAMENTAL', 'ANALYSIS', 'PORTFOLIO', 'STRATEGY');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "investor_profile" "InvestorProfile" NOT NULL DEFAULT 'BEGINNER',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stocks" (
    "symbol" VARCHAR(10) NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "sector" VARCHAR(100) NOT NULL,
    "industry" VARCHAR(100) NOT NULL,
    "exchange" VARCHAR(20) NOT NULL DEFAULT 'IDX',
    "is_idx80" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stocks_pkey" PRIMARY KEY ("symbol")
);

-- CreateTable
CREATE TABLE "stock_fundamentals" (
    "id" UUID NOT NULL,
    "symbol" VARCHAR(10) NOT NULL,
    "market_cap" DECIMAL(20,2),
    "pe_ratio" DECIMAL(10,2),
    "pbv_ratio" DECIMAL(10,2),
    "roe" DECIMAL(8,4),
    "roa" DECIMAL(8,4),
    "der" DECIMAL(8,4),
    "net_profit_margin" DECIMAL(8,4),
    "eps" DECIMAL(15,2),
    "dividend_yield" DECIMAL(8,4),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_fundamentals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_daily_prices" (
    "id" UUID NOT NULL,
    "symbol" VARCHAR(10) NOT NULL,
    "close_price" DECIMAL(15,2) NOT NULL,
    "change_amount" DECIMAL(15,2) NOT NULL,
    "change_percent" DECIMAL(8,4) NOT NULL,
    "open_price" DECIMAL(15,2),
    "high_price" DECIMAL(15,2),
    "low_price" DECIMAL(15,2),
    "volume" BIGINT,
    "last_updated" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_daily_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_sentiment" (
    "id" UUID NOT NULL,
    "symbol" VARCHAR(10),
    "title" VARCHAR(300) NOT NULL,
    "description" TEXT,
    "source" VARCHAR(100) NOT NULL,
    "url" TEXT NOT NULL,
    "sentiment" "SentimentLabel" NOT NULL DEFAULT 'NEUTRAL',
    "sentiment_score" DECIMAL(4,2),
    "published_at" TIMESTAMPTZ(6) NOT NULL,
    "cached_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_sentiment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "macro_markets" (
    "id" UUID NOT NULL,
    "asset_category" "MacroCategory" NOT NULL,
    "asset_name" VARCHAR(100) NOT NULL,
    "symbol_code" VARCHAR(20) NOT NULL,
    "price" DECIMAL(15,2) NOT NULL,
    "change_percent" DECIMAL(8,4) NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "macro_markets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watchlists" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "symbol" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "watchlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_analysis_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "symbol" VARCHAR(10),
    "investor_profile" "InvestorProfile" NOT NULL,
    "user_question" TEXT NOT NULL,
    "grounded_context" JSONB NOT NULL,
    "ai_response" TEXT NOT NULL,
    "factual_consistency_score" DECIMAL(5,2),
    "hallucination_flag" BOOLEAN NOT NULL DEFAULT false,
    "latency_ms" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_analysis_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_cache" (
    "id" UUID NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "endpoint_key" VARCHAR(150) NOT NULL,
    "response_data" JSONB NOT NULL,
    "fetched_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "api_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_transactions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "symbol" VARCHAR(10) NOT NULL,
    "transaction_type" "TransactionType" NOT NULL,
    "price" DECIMAL(15,2) NOT NULL,
    "lot_quantity" INTEGER NOT NULL,
    "transaction_date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portfolio_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_contents" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "category" "LearningCategory" NOT NULL,
    "difficulty" "DifficultyLevel" NOT NULL,
    "content" TEXT NOT NULL,
    "estimated_minutes" INTEGER NOT NULL DEFAULT 5,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_progress" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "content_id" UUID NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMPTZ(6),

    CONSTRAINT "learning_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizzes" (
    "id" UUID NOT NULL,
    "content_id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "option_a" VARCHAR(255) NOT NULL,
    "option_b" VARCHAR(255) NOT NULL,
    "option_c" VARCHAR(255) NOT NULL,
    "option_d" VARCHAR(255) NOT NULL,
    "correct_answer" VARCHAR(5) NOT NULL,
    "explanation" TEXT NOT NULL,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_attempts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "quiz_id" UUID NOT NULL,
    "answer" VARCHAR(5) NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "stocks_sector_idx" ON "stocks"("sector");

-- CreateIndex
CREATE INDEX "stocks_is_idx80_idx" ON "stocks"("is_idx80");

-- CreateIndex
CREATE UNIQUE INDEX "stock_fundamentals_symbol_key" ON "stock_fundamentals"("symbol");

-- CreateIndex
CREATE INDEX "stock_fundamentals_pe_ratio_idx" ON "stock_fundamentals"("pe_ratio");

-- CreateIndex
CREATE INDEX "stock_fundamentals_pbv_ratio_idx" ON "stock_fundamentals"("pbv_ratio");

-- CreateIndex
CREATE INDEX "stock_fundamentals_roe_idx" ON "stock_fundamentals"("roe");

-- CreateIndex
CREATE INDEX "stock_fundamentals_der_idx" ON "stock_fundamentals"("der");

-- CreateIndex
CREATE UNIQUE INDEX "stock_daily_prices_symbol_key" ON "stock_daily_prices"("symbol");

-- CreateIndex
CREATE INDEX "news_sentiment_symbol_idx" ON "news_sentiment"("symbol");

-- CreateIndex
CREATE INDEX "news_sentiment_published_at_idx" ON "news_sentiment"("published_at");

-- CreateIndex
CREATE UNIQUE INDEX "macro_markets_symbol_code_key" ON "macro_markets"("symbol_code");

-- CreateIndex
CREATE UNIQUE INDEX "watchlists_user_id_symbol_key" ON "watchlists"("user_id", "symbol");

-- CreateIndex
CREATE INDEX "ai_analysis_logs_symbol_idx" ON "ai_analysis_logs"("symbol");

-- CreateIndex
CREATE INDEX "ai_analysis_logs_created_at_idx" ON "ai_analysis_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "api_cache_endpoint_key_key" ON "api_cache"("endpoint_key");

-- CreateIndex
CREATE INDEX "api_cache_provider_endpoint_key_idx" ON "api_cache"("provider", "endpoint_key");

-- CreateIndex
CREATE INDEX "api_cache_expires_at_idx" ON "api_cache"("expires_at");

-- CreateIndex
CREATE INDEX "portfolio_transactions_user_id_idx" ON "portfolio_transactions"("user_id");

-- CreateIndex
CREATE INDEX "portfolio_transactions_symbol_idx" ON "portfolio_transactions"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "learning_contents_slug_key" ON "learning_contents"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "learning_progress_user_id_content_id_key" ON "learning_progress"("user_id", "content_id");

-- AddForeignKey
ALTER TABLE "stock_fundamentals" ADD CONSTRAINT "stock_fundamentals_symbol_fkey" FOREIGN KEY ("symbol") REFERENCES "stocks"("symbol") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_daily_prices" ADD CONSTRAINT "stock_daily_prices_symbol_fkey" FOREIGN KEY ("symbol") REFERENCES "stocks"("symbol") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_sentiment" ADD CONSTRAINT "news_sentiment_symbol_fkey" FOREIGN KEY ("symbol") REFERENCES "stocks"("symbol") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_symbol_fkey" FOREIGN KEY ("symbol") REFERENCES "stocks"("symbol") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_analysis_logs" ADD CONSTRAINT "ai_analysis_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_analysis_logs" ADD CONSTRAINT "ai_analysis_logs_symbol_fkey" FOREIGN KEY ("symbol") REFERENCES "stocks"("symbol") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_transactions" ADD CONSTRAINT "portfolio_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_transactions" ADD CONSTRAINT "portfolio_transactions_symbol_fkey" FOREIGN KEY ("symbol") REFERENCES "stocks"("symbol") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_progress" ADD CONSTRAINT "learning_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_progress" ADD CONSTRAINT "learning_progress_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "learning_contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "learning_contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
