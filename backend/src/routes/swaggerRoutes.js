import { Router } from "express";

const router = Router();

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "InvestPedia Learning CMS, User Learning & AI Knowledge API",
    version: "2.0.0",
    description:
      "RESTful API terintegrasi untuk Learning Content Studio (Admin CMS), Pengalaman Pembelajaran Pengguna (Courses, Modules, Lessons, Progress, Notes, Quizzes), dan Layanan Knowledge Retrieval untuk AI Investment Tutor.",
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local Development Server",
    },
  ],
  tags: [
    { name: "Auth", description: "Autentikasi Pengguna & Gerbang RBAC Administrator" },
    { name: "Admin CMS Studio", description: "Pengelolaan Hirarki Course, Module, Lesson, Block Editor & Versioning" },
    { name: "Admin Modules & Quizzes", description: "Manajemen Modul Kurikulum & Bank Soal Kuis Evaluasi" },
    { name: "User Learning", description: "Katalog Pembelajaran Publik, Detail Materi, Progres & Catatan Belajar" },
    { name: "AI Knowledge & Tutor", description: "Structured Content Retrieval, Chunking & AI Investment Tutor" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ContentBlock: {
        type: "object",
        required: ["id", "type"],
        properties: {
          id: { type: "string", example: "block-001" },
          type: {
            type: "string",
            enum: [
              "heading",
              "paragraph",
              "list",
              "callout",
              "image",
              "video",
              "attachment",
              "table",
              "code",
              "formula",
              "quote",
              "interactive_quiz",
              "accordion",
              "steps",
              "divider",
              "related",
            ],
          },
          content: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/api/auth/admin/login": {
      post: {
        tags: ["Auth"],
        summary: "Login khusus Administrator (RBAC)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "admin@email.com" },
                  password: { type: "string", example: "********" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Login berhasil dan menerbitkan JWT" },
          401: { description: "Kredensial tidak valid" },
          403: { description: "Bukan akun ber-role ADMIN" },
        },
      },
    },
    "/api/admin/cms/tree": {
      get: {
        tags: ["Admin CMS Studio"],
        summary: "Ambil struktur hierarki lengkap Course -> Module -> Lesson",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Berhasil memuat pohon hierarki konten CMS" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden (Bukan Admin)" },
        },
      },
    },
    "/api/admin/cms/courses": {
      post: {
        tags: ["Admin CMS Studio"],
        summary: "Buat Course / Kelas pembelajaran baru",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title"],
                properties: {
                  title: { type: "string", example: "Investasi Saham Pemula" },
                  learningLevel: { type: "string", enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"] },
                  description: { type: "string" },
                  status: { type: "string", enum: ["DRAFT", "PUBLISHED", "ARCHIVED"] },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Course berhasil dibuat" },
        },
      },
    },
    "/api/admin/cms/lessons/{id}": {
      get: {
        tags: ["Admin CMS Studio"],
        summary: "Ambil detail materi beserta contentBlocks, riwayat versi, dan kuis modul",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Detail materi berhasil dimuat" } },
      },
      put: {
        tags: ["Admin CMS Studio"],
        summary: "Simpan / publikasikan materi pembelajaran dari Visual Block Editor",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  summary: { type: "string" },
                  estimatedDuration: { type: "integer" },
                  learningObjectives: { type: "array", items: { type: "string" } },
                  keywords: { type: "array", items: { type: "string" } },
                  references: { type: "array", items: { type: "object" } },
                  status: { type: "string", enum: ["DRAFT", "PUBLISHED", "ARCHIVED"] },
                  isAutosave: { type: "boolean" },
                  contentBlocks: {
                    type: "object",
                    properties: {
                      schemaVersion: { type: "integer", example: 1 },
                      blocks: {
                        type: "array",
                        items: { $ref: "#/components/schemas/ContentBlock" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Materi berhasil diperbarui dan disinkronkan ke LLM chunks" },
        },
      },
      delete: {
        tags: ["Admin CMS Studio"],
        summary: "Hapus materi pembelajaran",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Materi berhasil dihapus" } },
      },
    },
    "/api/learning/courses": {
      get: {
        tags: ["User Learning"],
        summary: "Ambil katalog Course, Module, dan Lesson yang berstatus PUBLISHED beserta progres belajar",
        responses: { 200: { description: "Katalog pembelajaran publik" } },
      },
    },
    "/api/learning/lessons/{idOrSlug}": {
      get: {
        tags: ["User Learning"],
        summary: "Ambil detail materi terstruktur untuk dirender pada halaman belajar pengguna",
        parameters: [{ name: "idOrSlug", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Detail materi pembelajaran" },
          404: { description: "Materi tidak ditemukan atau berstatus Draft" },
        },
      },
    },
    "/api/learning/lessons/{id}/progress": {
      post: {
        tags: ["User Learning"],
        summary: "Perbarui status progres belajar materi (IN_PROGRESS / COMPLETED)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", enum: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"] },
                  progressPercent: { type: "integer", example: 100 },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Progres tersimpan di database" } },
      },
    },
    "/api/learning/notes": {
      get: {
        tags: ["User Learning"],
        summary: "Ambil daftar catatan belajar pengguna",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "lessonId", in: "query", required: false, schema: { type: "string" } }],
        responses: { 200: { description: "Daftar catatan belajar" } },
      },
      post: {
        tags: ["User Learning"],
        summary: "Simpan catatan belajar baru untuk materi tertentu",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["lessonId", "content"],
                properties: {
                  lessonId: { type: "string" },
                  title: { type: "string" },
                  content: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Catatan berhasil dibuat" } },
      },
    },
    "/api/ai/knowledge/lessons/{lessonId}": {
      get: {
        tags: ["AI Knowledge & Tutor"],
        summary: "Ambil structured plain text dan semantic chunks materi untuk konteks LLM",
        parameters: [{ name: "lessonId", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Data pengetahuan terstruktur siap konsumsi LLM" },
          404: { description: "Materi tidak ditemukan atau belum dipublikasikan" },
        },
      },
    },
    "/api/ai/knowledge/search": {
      get: {
        tags: ["AI Knowledge & Tutor"],
        summary: "Cari potongan konteks (RAG chunks) dari seluruh materi yang dipublikasikan",
        parameters: [{ name: "q", in: "query", required: false, schema: { type: "string" } }],
        responses: { 200: { description: "Daftar chunk relevan beserta metadata sumber" } },
      },
    },
    "/api/ai/tutor": {
      post: {
        tags: ["AI Knowledge & Tutor"],
        summary: "Tanya-jawab edukasi bersama AI Investment Tutor berbasis konteks materi aktif",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["question"],
                properties: {
                  question: { type: "string", example: "Bagaimana cara menghitung ROE dan artinya?" },
                  lessonId: { type: "string" },
                  lessonSlug: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Penjelasan edukatif terstruktur dengan sumber materi" } },
      },
    },
  },
};

router.get("/openapi.json", (_req, res) => {
  res.status(200).json(openApiSpec);
});

router.get("/docs", (_req, res) => {
  res.status(200).send(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>InvestPedia API Documentation — Swagger UI</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui.css" />
  <style>
    body { margin: 0; background: #fafafa; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: "/api/openapi.json",
        dom_id: "#swagger-ui",
        deepLinking: true,
        persistAuthorization: true
      });
    };
  </script>
</body>
</html>`);
});

export default router;

