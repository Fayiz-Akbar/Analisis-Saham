-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('INVESTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "QuizOptionKey" AS ENUM ('A', 'B', 'C', 'D');

-- DropForeignKey
ALTER TABLE "learning_progress" DROP CONSTRAINT "learning_progress_content_id_fkey";

-- DropForeignKey
ALTER TABLE "quiz_attempts" DROP CONSTRAINT "quiz_attempts_quiz_id_fkey";

-- DropForeignKey
ALTER TABLE "quizzes" DROP CONSTRAINT "quizzes_content_id_fkey";

-- DropIndex
DROP INDEX "learning_progress_user_id_content_id_key";

-- AlterTable
ALTER TABLE "learning_progress" DROP COLUMN "completed",
DROP COLUMN "content_id",
ADD COLUMN     "is_completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "module_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "quiz_attempts" DROP COLUMN "answer",
DROP COLUMN "is_correct",
DROP COLUMN "quiz_id",
ADD COLUMN     "ai_feedback_payload" JSONB,
ADD COLUMN     "answers_payload" JSONB NOT NULL,
ADD COLUMN     "module_id" UUID NOT NULL,
ADD COLUMN     "score_percentage" DECIMAL(5,2) NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'INVESTOR';

-- DropTable
DROP TABLE "learning_contents";

-- DropTable
DROP TABLE "quizzes";

-- DropEnum
DROP TYPE "LearningCategory";

-- CreateTable
CREATE TABLE "learning_modules" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "level" "DifficultyLevel" NOT NULL,
    "summary" VARCHAR(500),
    "content_body" TEXT NOT NULL,
    "estimated_minutes" INTEGER NOT NULL DEFAULT 5,
    "order_index" INTEGER NOT NULL DEFAULT 1,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_questions" (
    "id" UUID NOT NULL,
    "module_id" UUID NOT NULL,
    "question_text" TEXT NOT NULL,
    "option_a" VARCHAR(255) NOT NULL,
    "option_b" VARCHAR(255) NOT NULL,
    "option_c" VARCHAR(255) NOT NULL,
    "option_d" VARCHAR(255) NOT NULL,
    "correct_key" "QuizOptionKey" NOT NULL,
    "explanation_text" TEXT NOT NULL,
    "indicator_concept" VARCHAR(150) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "learning_modules_slug_key" ON "learning_modules"("slug");

-- CreateIndex
CREATE INDEX "learning_modules_level_order_index_idx" ON "learning_modules"("level", "order_index");

-- CreateIndex
CREATE INDEX "learning_modules_is_published_idx" ON "learning_modules"("is_published");

-- CreateIndex
CREATE INDEX "quiz_questions_module_id_idx" ON "quiz_questions"("module_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_user_learning_module" ON "learning_progress"("user_id", "module_id");

-- CreateIndex
CREATE INDEX "quiz_attempts_user_id_module_id_idx" ON "quiz_attempts"("user_id", "module_id");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- AddForeignKey
ALTER TABLE "learning_progress" ADD CONSTRAINT "learning_progress_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "learning_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "learning_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "learning_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
