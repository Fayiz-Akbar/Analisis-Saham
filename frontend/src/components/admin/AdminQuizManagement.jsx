import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Edit3,
  FileQuestion,
  HelpCircle,
  Plus,
  RotateCcw,
  Save,
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
      <div className="p-10 rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] text-center space-y-3">
        <FileQuestion className="w-8 h-8 text-slate-400 mx-auto opacity-50" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Belum Ada Modul Materi
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Silakan buat modul pembelajaran terlebih dahulu pada tab Materi Pembelajaran sebelum mengelola bank soal kuis evaluasi.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bar Pemilih Modul Materi Terkait */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
            Modul Pembelajaran Aktif
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white">
              {activeModule?.title}
            </h3>
            {activeModule && <LevelBadge level={activeModule.level} />}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <select
            value={activeModule?.id || ""}
            onChange={(e) => onSelectModuleId && onSelectModuleId(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 cursor-pointer min-w-[260px]"
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
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* KOLOM KIRI (5 Kolom): FORM EDITOR BUTIR SOAL KUIS */}
        <div
          ref={formRef}
          className="xl:col-span-5 rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] overflow-hidden"
        >
          <div className="px-4 py-3 bg-slate-50 dark:bg-[#0c0e14] border-b border-slate-200 dark:border-[#272727] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileQuestion className="w-3.5 h-3.5 text-slate-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">
                {editingQuizId ? "Edit Butir Soal" : "Form Butir Soal Baru"}
              </h4>
            </div>

            {editingQuizId && (
              <button
                type="button"
                onClick={handleResetForm}
                className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:opacity-90 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Batal Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-[#2a0e12] border border-rose-200 dark:border-[#4c151c] flex items-start gap-2 text-xs text-rose-700 dark:text-[#f87171] font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span>{formError}</span>
              </div>
            )}

            {/* Indikator Konsep Materi */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Indikator Konsep Materi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.indicatorConcept}
                onChange={(e) => setForm((prev) => ({ ...prev, indicatorConcept: e.target.value }))}
                placeholder="Contoh: Formula dan Perhitungan Return on Equity (ROE)"
                className="w-full px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-600"
              />
              {fieldErrors.indicatorConcept && (
                <span className="text-[11px] text-rose-500 mt-1 block">
                  {fieldErrors.indicatorConcept}
                </span>
              )}
            </div>

            {/* Pertanyaan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Teks Pertanyaan Kuis <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={form.questionText}
                onChange={(e) => setForm((prev) => ({ ...prev, questionText: e.target.value }))}
                placeholder="Tuliskan butir pertanyaan pilihan ganda..."
                className="w-full p-2.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-600"
              />
              {fieldErrors.questionText && (
                <span className="text-[11px] text-rose-500 mt-1 block">
                  {fieldErrors.questionText}
                </span>
              )}
            </div>

            {/* Pilihan Opsi A, B, C, D */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Pilihan Jawaban (A – D) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400">
                  Klik huruf opsi untuk menetapkan kunci
                </span>
              </div>

              {OPTION_KEYS.map((key) => {
                const fieldName = `option${key}`;
                const isCorrect = form.correctKey === key;
                return (
                  <div key={key} className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, correctKey: key }))}
                        className={`w-8 h-8 rounded-lg font-mono text-xs font-black shrink-0 border transition-colors cursor-pointer ${
                          isCorrect
                            ? "bg-[#062c19] text-[#34d399] border-[#0e4429]"
                            : "bg-slate-100 dark:bg-[#0c0e14] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-400"
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
                        placeholder={`Teks Jawaban ${key}...`}
                        className={`flex-1 px-3 py-1.5 rounded-xl text-xs font-medium border text-slate-900 dark:text-white focus:outline-none ${
                          isCorrect
                            ? "border-[#0e4429] bg-[#062c19]/30"
                            : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0c0e14] focus:border-slate-400 dark:focus:border-slate-600"
                        }`}
                      />
                    </div>
                    {fieldErrors[fieldName] && (
                      <span className="text-[11px] text-rose-500 pl-10 block">
                        {fieldErrors[fieldName]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pemilih Kunci Jawaban Deterministik */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                Kunci Jawaban Resmi (Deterministik):
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {OPTION_KEYS.map((key) => {
                  const selected = form.correctKey === key;
                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => setForm((prev) => ({ ...prev, correctKey: key }))}
                      className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1 border transition-colors cursor-pointer ${
                        selected
                          ? "bg-[#062c19] text-[#34d399] border-[#0e4429]"
                          : "bg-white dark:bg-[#101010] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-400"
                      }`}
                    >
                      <span>{selected ? "●" : "○"}</span>
                      <span>{key}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pembahasan Resmi */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Teks Pembahasan Resmi <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={form.explanationText}
                onChange={(e) => setForm((prev) => ({ ...prev, explanationText: e.target.value }))}
                placeholder="Penjelasan rasional mengapa kunci tersebut benar..."
                className="w-full p-2.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-600"
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
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              {isSubmitting
                ? "Menyimpan..."
                : editingQuizId
                  ? "Perbarui Soal Kuis"
                  : "Simpan Butir Soal"}
            </button>
          </form>
        </div>

        {/* KOLOM KANAN (7 Kolom): DAFTAR BANK SOAL PADA MODUL TERPILIH */}
        <div className="xl:col-span-7 space-y-3">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
                Daftar Bank Soal ({quizzes.length})
              </h4>
            </div>

            {editingQuizId && (
              <button
                type="button"
                onClick={handleResetForm}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                Tambah Baru
              </button>
            )}
          </div>

          {loadError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-[#2a0e12] border border-rose-200 dark:border-[#4c151c] text-xs text-rose-700 dark:text-[#f87171] font-semibold">
              {loadError}
            </div>
          )}

          {isLoadingQuizzes ? (
            <div className="space-y-2.5">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] animate-pulse space-y-2.5"
                >
                  <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-8 bg-slate-100 dark:bg-slate-800/70 rounded-lg" />
                    <div className="h-8 bg-slate-100 dark:bg-slate-800/70 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : quizzes.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] text-center space-y-2">
              <FileQuestion className="w-8 h-8 text-slate-400 mx-auto opacity-50" />
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Belum ada butir soal kuis untuk modul ini
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Gunakan form di samping untuk memasukkan soal pilihan ganda A–D beserta kunci deterministiknya.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
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
                    className={`p-4 rounded-xl bg-white dark:bg-[#101010] border transition-colors space-y-3 ${
                      isBeingEdited
                        ? "border-slate-500 dark:border-white/40 bg-slate-50/50 dark:bg-white/[0.02]"
                        : "border-slate-200 dark:border-[#272727]"
                    }`}
                  >
                    {/* Header Kartu Soal */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold tabular-nums text-slate-500 dark:text-slate-400">
                          #{idx + 1}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-[#1a1f2c] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                          Indikator: {quiz.indicatorConcept || quiz.indicator_concept}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditQuiz(quiz)}
                          className="px-2 py-1 rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(quiz)}
                          className="p-1 rounded-lg border border-rose-200 dark:border-[#4c151c] text-rose-600 dark:text-[#f87171] hover:bg-rose-50 dark:hover:bg-[#2a0e12] transition-colors cursor-pointer"
                          title="Hapus Soal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Teks Pertanyaan */}
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                      {quiz.questionText || quiz.question_text}
                    </p>

                    {/* Grid 4 Opsi Jawaban */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {options.map((opt) => {
                        const isKey = opt.key === correctKey;
                        return (
                          <div
                            key={opt.key}
                            className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                              isKey
                                ? "bg-[#062c19]/50 border-[#0e4429] text-white font-medium"
                                : "bg-slate-50 dark:bg-[#0c0e14] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded font-mono text-[11px] font-bold flex items-center justify-center shrink-0 ${
                                isKey
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              {opt.key}
                            </span>
                            <div className="flex-1 leading-snug">
                              <span>{opt.text}</span>
                              {isKey && (
                                <span className="mt-0.5 flex items-center gap-1 text-[10px] font-bold text-[#34d399] uppercase font-mono">
                                  <CheckCircle2 className="w-2.5 h-2.5" /> Kunci Resmi
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Kotak Pembahasan Resmi */}
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10 text-xs space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                        Pembahasan Resmi:
                      </span>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
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

      {/* Modal Konfirmasi Hapus Soal Kuis (Clean Flat Alert) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] p-5 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-rose-600 dark:text-[#f87171] font-bold text-xs uppercase font-mono tracking-wider">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Konfirmasi Penghapusan Soal</span>
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Hapus Butir Soal Ini?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                "{deleteTarget.questionText || deleteTarget.question_text}"
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#272727]">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-50 cursor-pointer transition-colors"
              >
                {isDeleting ? "Menghapus..." : "Hapus Permanen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
