import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Edit3,
  FileQuestion,
  HelpCircle,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { adminApi } from "../../services/apiClient";
import { LevelBadge } from "./adminConstants";

const EMPTY_QUIZ_FORM = {
  questionText: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctKey: "A",
  explanationText: "",
  indicatorConcept: "",
};

const OPTION_KEYS = ["A", "B", "C", "D"];

export default function AdminQuizManagement({
  modules = [],
  selectedModuleId,
  onSelectModuleId,
  onQuizzesChanged,
  onNotify,
}) {
  const activeModule =
    modules.find((m) => m.id === selectedModuleId) || modules[0] || null;

  const [quizzes, setQuizzes] = useState([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [editingQuizId, setEditingQuizId] = useState(null);
  const [form, setForm] = useState(EMPTY_QUIZ_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const formRef = useRef(null);

  // Sinkronkan selectedModuleId jika belum terpilih
  useEffect(() => {
    if (!selectedModuleId && modules.length > 0 && onSelectModuleId) {
      onSelectModuleId(modules[0].id);
    }
  }, [selectedModuleId, modules, onSelectModuleId]);

  const fetchModuleQuizzes = useCallback(async (modId) => {
    if (!modId) {
      setQuizzes([]);
      return;
    }
    try {
      setIsLoadingQuizzes(true);
      setLoadError("");
      const res = await adminApi.getModuleQuizzes(modId);
      setQuizzes(res?.data?.quizzes || []);
    } catch (err) {
      setLoadError(err.message || "Gagal memuat daftar soal kuis modul.");
    } finally {
      setIsLoadingQuizzes(false);
    }
  }, []);

  useEffect(() => {
    if (activeModule?.id) {
      fetchModuleQuizzes(activeModule.id);
      setEditingQuizId(null);
      setForm(EMPTY_QUIZ_FORM);
      setFormError("");
      setFieldErrors({});
    }
  }, [activeModule?.id, fetchModuleQuizzes]);

  const handleResetForm = () => {
    setEditingQuizId(null);
    setForm(EMPTY_QUIZ_FORM);
    setFormError("");
    setFieldErrors({});
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuizId(quiz.id);
    setForm({
      questionText: quiz.questionText || quiz.question_text || "",
      optionA: quiz.optionA || quiz.option_a || "",
      optionB: quiz.optionB || quiz.option_b || "",
      optionC: quiz.optionC || quiz.option_c || "",
      optionD: quiz.optionD || quiz.option_d || "",
      correctKey: quiz.correctKey || quiz.correct_key || "A",
      explanationText: quiz.explanationText || quiz.explanation_text || "",
      indicatorConcept: quiz.indicatorConcept || quiz.indicator_concept || "",
    });
    setFormError("");
    setFieldErrors({});
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeModule?.id) return;

    setFormError("");
    setFieldErrors({});

    const payload = {
      moduleId: activeModule.id,
      questionText: form.questionText,
      optionA: form.optionA,
      optionB: form.optionB,
      optionC: form.optionC,
      optionD: form.optionD,
      correctKey: form.correctKey,
      explanationText: form.explanationText,
      indicatorConcept: form.indicatorConcept,
    };

    try {
      setIsSubmitting(true);
      if (editingQuizId) {
        await adminApi.updateQuiz(editingQuizId, payload);
        if (onNotify) onNotify("Butir soal kuis berhasil diperbarui.", "success");
      } else {
        await adminApi.createQuiz(payload);
        if (onNotify) onNotify("Butir soal kuis baru berhasil ditambahkan.", "success");
      }

      handleResetForm();
      await fetchModuleQuizzes(activeModule.id);
      if (onQuizzesChanged) onQuizzesChanged();
    } catch (err) {
      setFormError(err.message || "Gagal menyimpan butir soal kuis.");
      if (Array.isArray(err.details) && err.details.length > 0) {
        const mapped = {};
        for (const item of err.details) {
          if (item.field) mapped[item.field] = item.message;
        }
        setFieldErrors(mapped);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !activeModule?.id) return;
    try {
      setIsDeleting(true);
      await adminApi.deleteQuiz(deleteTarget.id);
      if (editingQuizId === deleteTarget.id) {
        handleResetForm();
      }
      setDeleteTarget(null);
      if (onNotify) onNotify("Butir soal kuis berhasil dihapus.", "success");
      await fetchModuleQuizzes(activeModule.id);
      if (onQuizzesChanged) onQuizzesChanged();
    } catch (err) {
      if (onNotify) onNotify(err.message || "Gagal menghapus soal kuis.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  if (modules.length === 0) {
    return (
      <div className="p-10 rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] text-center space-y-2">
        <BookOpen className="w-8 h-8 text-slate-400 mx-auto opacity-60" />
        <div className="text-sm font-bold text-slate-900 dark:text-white">
          Belum Ada Modul Materi Pembelajaran
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Silakan buat minimal 1 modul materi pada tab Kelola Materi Pembelajaran terlebih dahulu sebelum menyusun bank soal kuis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selector Modul Pembelajaran */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
            Pilih Modul Materi Kurikulum
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
              {activeModule?.title}
            </h3>
            {activeModule && <LevelBadge level={activeModule.level} />}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          <select
            value={activeModule?.id || ""}
            onChange={(e) => onSelectModuleId && onSelectModuleId(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-[#12151e] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer min-w-[260px]"
          >
            {modules.map((mod) => (
              <option key={mod.id} value={mod.id}>
                [{mod.level}] #{mod.orderIndex ?? mod.order_index} — {mod.title} ({mod.quizCount ?? 0} Soal)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Utama: Form Editor Butir Soal (Kiri) & Daftar Bank Soal Modul (Kanan) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* KOLOM KIRI (5 Kolom): FORM EDITOR BUTIR SOAL KUIS (Sesuai Layar 12 STITCH) */}
        <div
          ref={formRef}
          className="xl:col-span-5 rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] overflow-hidden shadow-sm"
        >
          <div className="px-5 py-4 bg-slate-50 dark:bg-[#12151e] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileQuestion className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                {editingQuizId ? "Edit Butir Soal Kuis" : "Form Editor Butir Soal Kuis"}
              </h4>
            </div>

            {editingQuizId && (
              <button
                type="button"
                onClick={handleResetForm}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:opacity-90 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Buat Baru
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span>{formError}</span>
              </div>
            )}

            {/* Indikator Konsep Materi (Digunakan oleh LLM Evaluator pada KF-17) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Indikator Konsep Materi (Pemetaan LLM Evaluator){" "}
                  <span className="text-rose-500">*</span>
                </span>
              </label>
              <input
                type="text"
                required
                value={form.indicatorConcept}
                onChange={(e) => setForm((prev) => ({ ...prev, indicatorConcept: e.target.value }))}
                placeholder="Contoh: Formula dan Perhitungan Return on Equity (ROE)"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-[#12151e] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
              {fieldErrors.indicatorConcept && (
                <span className="text-[11px] text-rose-500 mt-1 block">
                  {fieldErrors.indicatorConcept}
                </span>
              )}
            </div>

            {/* Pertanyaan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Teks Pertanyaan Kuis <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={form.questionText}
                onChange={(e) => setForm((prev) => ({ ...prev, questionText: e.target.value }))}
                placeholder="Masukkan teks soal pertanyaan pilihan ganda di sini..."
                className="w-full p-3.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-[#12151e] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
              {fieldErrors.questionText && (
                <span className="text-[11px] text-rose-500 mt-1 block">
                  {fieldErrors.questionText}
                </span>
              )}
            </div>

            {/* Pilihan Opsi A, B, C, D */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Pilihan Jawaban (Opsi A – D) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] font-semibold text-slate-400">
                  Klik huruf opsi untuk menandai kunci jawaban
                </span>
              </div>

              {OPTION_KEYS.map((key) => {
                const fieldName = `option${key}`;
                const isCorrect = form.correctKey === key;
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, correctKey: key }))}
                        className={`w-9 h-9 rounded-xl font-mono text-xs font-black shrink-0 border transition-all cursor-pointer ${
                          isCorrect
                            ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm"
                            : "bg-slate-100 dark:bg-[#12151e] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-400"
                        }`}
                        title={`Jadikan Opsi ${key} sebagai Kunci Jawaban Benar`}
                      >
                        {key}
                      </button>

                      <input
                        type="text"
                        required
                        value={form[fieldName]}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, [fieldName]: e.target.value }))
                        }
                        placeholder={`Teks Opsi Jawaban ${key}...`}
                        className={`flex-1 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-[#12151e] border text-slate-900 dark:text-white focus:outline-none ${
                          isCorrect
                            ? "border-emerald-500/60 dark:border-emerald-500/50"
                            : "border-slate-200 dark:border-slate-800 focus:border-indigo-500"
                        }`}
                      />
                    </div>
                    {fieldErrors[fieldName] && (
                      <span className="text-[11px] text-rose-500 pl-11 block">
                        {fieldErrors[fieldName]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pemilih Kunci Jawaban Deterministik (Sesuai Wireframe Layar 12) */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#12151e] border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Kunci Jawaban Resmi (Deterministik):
              </span>
              <div className="grid grid-cols-4 gap-2">
                {OPTION_KEYS.map((key) => {
                  const selected = form.correctKey === key;
                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => setForm((prev) => ({ ...prev, correctKey: key }))}
                      className={`py-2 px-2 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                        selected
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40"
                          : "bg-white dark:bg-[#080808] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <span>{selected ? "(•)" : "( )"}</span>
                      <span>Opsi {key}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pembahasan Resmi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Pembahasan Resmi <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={form.explanationText}
                onChange={(e) => setForm((prev) => ({ ...prev, explanationText: e.target.value }))}
                placeholder="Tulis penjelasan detail mengapa kunci jawaban tersebut benar untuk ditampilkan ke investor setelah submit kuis..."
                className="w-full p-3.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-[#12151e] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
              {fieldErrors.explanationText && (
                <span className="text-[11px] text-rose-500 mt-1 block">
                  {fieldErrors.explanationText}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSubmitting
                ? "Menyimpan..."
                : editingQuizId
                  ? "Simpan Perubahan Soal Kuis ✓"
                  : "Simpan Butir Soal Kuis ✓"}
            </button>
          </form>
        </div>

        {/* KOLOM KANAN (7 Kolom): DAFTAR BANK SOAL PADA MODUL TERPILIH */}
        <div className="xl:col-span-7 space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-4 h-4 text-emerald-500" />
              <h4 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
                Daftar Butir Soal Kuis ({quizzes.length} Soal)
              </h4>
            </div>

            {editingQuizId && (
              <button
                type="button"
                onClick={handleResetForm}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/25 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Soal Baru
              </button>
            )}
          </div>

          {loadError && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-300">
              {loadError}
            </div>
          )}

          {isLoadingQuizzes ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] animate-pulse space-y-3"
                >
                  <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-9 bg-slate-100 dark:bg-slate-800/70 rounded-xl" />
                    <div className="h-9 bg-slate-100 dark:bg-slate-800/70 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : quizzes.length === 0 ? (
            <div className="p-10 rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] text-center space-y-2">
              <FileQuestion className="w-8 h-8 text-slate-400 mx-auto opacity-60" />
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Belum Ada Soal Kuis pada Modul Ini
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Gunakan Form Editor Butir Soal Kuis di samping untuk menambahkan pertanyaan pilihan ganda A–D beserta kunci jawaban dan pembahasan resminya.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {quizzes.map((quiz, idx) => {
                const isBeingEdited = editingQuizId === quiz.id;
                const options = [
                  { key: "A", text: quiz.optionA || quiz.option_a },
                  { key: "B", text: quiz.optionB || quiz.option_b },
                  { key: "C", text: quiz.optionC || quiz.option_c },
                  { key: "D", text: quiz.optionD || quiz.option_d },
                ];
                const correctKey = quiz.correctKey || quiz.correct_key;

                return (
                  <div
                    key={quiz.id}
                    className={`p-5 rounded-2xl bg-white dark:bg-[#101010] border transition-all space-y-4 ${
                      isBeingEdited
                        ? "border-indigo-500 ring-1 ring-indigo-500/30"
                        : "border-slate-200 dark:border-[#272727]"
                    }`}
                  >
                    {/* Header Kartu Soal */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#12151e] border border-slate-200 dark:border-slate-800 font-mono text-xs font-black text-slate-800 dark:text-white">
                          Soal #{idx + 1}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
                          <Sparkles className="w-3 h-3" />
                          Indikator: {quiz.indicatorConcept || quiz.indicator_concept}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditQuiz(quiz)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#12151e] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(quiz)}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Hps
                        </button>
                      </div>
                    </div>

                    {/* Teks Pertanyaan */}
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                      {quiz.questionText || quiz.question_text}
                    </p>

                    {/* Grid 4 Opsi Jawaban */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {options.map((opt) => {
                        const isKey = opt.key === correctKey;
                        return (
                          <div
                            key={opt.key}
                            className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                              isKey
                                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-200 font-bold"
                                : "bg-slate-50 dark:bg-[#12151e]/70 border-slate-200/80 dark:border-slate-800/90 text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-lg font-mono text-xs font-black flex items-center justify-center shrink-0 ${
                                isKey
                                  ? "bg-emerald-500 text-slate-950"
                                  : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              {opt.key}
                            </span>
                            <div className="flex-1 leading-snug">
                              <span>{opt.text}</span>
                              {isKey && (
                                <span className="mt-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                  <CheckCircle2 className="w-3 h-3" /> Kunci Jawaban Resmi
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Kotak Pembahasan Resmi */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#12151e] border border-slate-200 dark:border-slate-800/90 text-xs space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Pembahasan Resmi (Ditampilkan Pasca-Submit):
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {quiz.explanationText || quiz.explanation_text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Konfirmasi Hapus Soal Kuis */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#12151e] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Hapus Butir Soal Kuis?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Apakah Anda yakin ingin menghapus soal:{" "}
                  <strong className="text-slate-900 dark:text-white">
                    "{deleteTarget.questionText || deleteTarget.question_text}"
                  </strong>
                  ?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus Soal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

