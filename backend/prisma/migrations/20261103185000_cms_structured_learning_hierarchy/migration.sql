-- Migration: Structured Learning Content Management System (CMS) & LLM-Ready Content Hierarchy
-- Adds LearningCourse, LearningLesson, LearningLessonRevision, LearningLessonProgress, LearningNote
-- and extends LearningModule with structured blocks, plain text extraction, and RAG chunks.

DO $$ BEGIN
    CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "LessonProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "learning_courses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "learning_level" "DifficultyLevel" NOT NULL DEFAULT 'BEGINNER',
    "learning_objectives" JSONB NOT NULL DEFAULT '[]',
    "tags" JSONB NOT NULL DEFAULT '[]',
    "thumbnail" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "order_index" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "learning_courses_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "learning_courses_slug_key" ON "learning_courses"("slug");
CREATE INDEX IF NOT EXISTS "learning_courses_learning_level_order_index_idx" ON "learning_courses"("learning_level", "order_index");
CREATE INDEX IF NOT EXISTS "learning_courses_status_idx" ON "learning_courses"("status");

ALTER TABLE "learning_modules"
    ADD COLUMN IF NOT EXISTS "course_id" UUID,
    ADD COLUMN IF NOT EXISTS "submodule_title" VARCHAR(200),
    ADD COLUMN IF NOT EXISTS "content_blocks" JSONB,
    ADD COLUMN IF NOT EXISTS "plain_text_content" TEXT,
    ADD COLUMN IF NOT EXISTS "content_chunks" JSONB,
    ADD COLUMN IF NOT EXISTS "learning_objectives" JSONB NOT NULL DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS "keywords" JSONB NOT NULL DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS "tags" JSONB NOT NULL DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS "references" JSONB NOT NULL DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS "published_at" TIMESTAMPTZ(6);

CREATE TABLE IF NOT EXISTS "learning_lessons" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "module_id" UUID NOT NULL,
    "submodule_title" VARCHAR(200),
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "summary" VARCHAR(500),
    "learning_objectives" JSONB NOT NULL DEFAULT '[]',
    "estimated_duration" INTEGER NOT NULL DEFAULT 5,
    "keywords" JSONB NOT NULL DEFAULT '[]',
    "tags" JSONB NOT NULL DEFAULT '[]',
    "difficulty_level" "DifficultyLevel" NOT NULL DEFAULT 'BEGINNER',
    "content_blocks" JSONB NOT NULL DEFAULT '{"schemaVersion":1,"blocks":[]}',
    "content_body" TEXT NOT NULL DEFAULT '',
    "plain_text_content" TEXT NOT NULL DEFAULT '',
    "content_chunks" JSONB NOT NULL DEFAULT '[]',
    "references" JSONB NOT NULL DEFAULT '[]',
    "access_level" VARCHAR(30) NOT NULL DEFAULT 'PUBLIC',
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "version" INTEGER NOT NULL DEFAULT 1,
    "order_index" INTEGER NOT NULL DEFAULT 1,
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "learning_lessons_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "learning_lessons_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "learning_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "learning_lessons_slug_key" ON "learning_lessons"("slug");
CREATE INDEX IF NOT EXISTS "learning_lessons_module_id_order_index_idx" ON "learning_lessons"("module_id", "order_index");
CREATE INDEX IF NOT EXISTS "learning_lessons_status_idx" ON "learning_lessons"("status");

CREATE TABLE IF NOT EXISTS "learning_lesson_revisions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lesson_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "summary" VARCHAR(500),
    "content_blocks" JSONB NOT NULL,
    "plain_text_content" TEXT NOT NULL,
    "change_summary" VARCHAR(300) NOT NULL DEFAULT 'Pembaruan materi',
    "status" "ContentStatus" NOT NULL,
    "changed_by_id" UUID,
    "changed_by_name" VARCHAR(100) NOT NULL DEFAULT 'Administrator',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "learning_lesson_revisions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "learning_lesson_revisions_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "learning_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "learning_lesson_progress" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "course_id" UUID,
    "module_id" UUID NOT NULL,
    "lesson_id" UUID NOT NULL,
    "status" "LessonProgressStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "progress_percent" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6),
    "last_accessed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "learning_lesson_progress_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "uq_user_learning_lesson" UNIQUE ("user_id", "lesson_id")
);

CREATE TABLE IF NOT EXISTS "learning_notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "lesson_id" UUID NOT NULL,
    "module_id" UUID,
    "title" VARCHAR(200) NOT NULL DEFAULT 'Catatan Belajar',
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "learning_notes_pkey" PRIMARY KEY ("id")
);

