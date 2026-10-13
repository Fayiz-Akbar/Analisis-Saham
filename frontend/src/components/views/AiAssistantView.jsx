import React, { useState } from "react";

export default function AiAssistantView({ onSelectStock }) {
  const [activeRole, setActiveRole] = useState("FINANCIAL_ASSISTANT"); // FINANCIAL_ASSISTANT | INVESTMENT_TUTOR
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Halo! Saya adalah Asisten Cerdas InvestAI berbasis Google Gemini dengan arsitektur Context-Grounded. Seluruh analisis yang saya sajikan terikat ketat pada data faktual laporan keuangan emiten IDX80 dan kaidah fundamental tanpa spekulasi liar. Ada yang ingin Anda tanyakan seputar emiten atau konsep investasi?",
      timestamp: "Baru saja",
    },
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const quickPrompts = [
    { label: "Analisis Fundamental BBCA vs BBRI", text: "Bandingkan rasio valuasi (PER, PBV) dan profitabilitas (ROE) antara BBCA dan BBRI berdasarkan data terkini." },
    { label: "Apa itu Price to Book Value (PBV)?", text: "Jelaskan konsep PBV untuk pemula dan bagaimana cara menentukan apakah harga saham suatu bank wajar." },
    { label: "Audit Risiko Portofolio Sektor Finansial", text: "Jika portofolio saya didominasi 60% perbankan, risiko apa saja yang perlu saya antisipasi?" },
    { label: "Prinsip Dollar Cost Averaging (DCA)", text: "Bagaimana cara kerja DCA pada bursa Indonesia yang memiliki satuan perdagangan minimum 1 lot?" },
  ];

  const handleSend = (textToSend) => {
    const query = textToSend || inputMsg;
    if (!query.trim()) return;

    const userMessage = {
      role: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMsg("");
    setIsTyping(true);

    // Simulasi response Context-Grounded AI
    setTimeout(() => {
      let botResponse = "";
      if (activeRole === "FINANCIAL_ASSISTANT") {
        botResponse = `[Analisis Grounded Fakta - Financial Assistant]\n\nBerdasarkan data keuangan terverifikasi di database:\n1. BBCA diperdagangkan pada valuasi premium (PER ~22.4x, PBV ~4.8x) didukung efisiensi CASA tinggi dan ROE solid di level 21.8%.\n2. BBRI menawarkan valuasi relatif atraktif (PER ~12.8x, PBV ~2.3x) dengan dividend yield kompetitif di kisaran 6.4% dan fokus pertumbuhan kredit UMKM.\n\nCatatan Penting: Analisis ini bertujuan sebagai sarana riset dan edukasi mandiri, bukan anjuran spekulatif beli/jual saham.`;
      } else {
        botResponse = `[Bimbingan Edukasi - Investment Tutor]\n\nMari kita bedah secara sederhana:\nPrice to Book Value (PBV) adalah rasio harga saham dibandingkan dengan nilai buku (ekuitas bersih per lembar).\n\n• Jika PBV = 1x, harga pasar persis sama dengan modal buku bersih perusahaan.\n• Pada industri perbankan, bank dengan kualitas aset prima dan ROE di atas 20% wajar diperdagangkan pada PBV di atas 2x karena kemampuan menghasilkan laba yang tinggi dari modalnya.\n\nPelajari modul Level 3 pada menu Learning untuk memahami kriteria sehat 4 pilar fundamental lainnya!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: botResponse,
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Context-Grounded AI Assistant
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Asisten analitik dan tutor investasi cerdas berbasis model Google Gemini dengan protokol anti-halusinasi data finansial.
          </p>
        </div>

        {/* Role Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveRole("FINANCIAL_ASSISTANT")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeRole === "FINANCIAL_ASSISTANT"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Financial Assistant
          </button>
          <button
            onClick={() => setActiveRole("INVESTMENT_TUTOR")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeRole === "INVESTMENT_TUTOR"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Investment Tutor
          </button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col h-[580px] overflow-hidden">
        {/* Chat History Messages */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                m.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed ${
                  m.role === "user"
                    ? "bg-blue-600 text-white rounded-br-xs"
                    : "bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 rounded-bl-xs whitespace-pre-line"
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">
                {m.role === "user" ? "Anda" : "InvestAI Gemini"} • {m.timestamp}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>InvestAI sedang mensintesis konteks data finansial...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="px-5 py-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none bg-slate-50/50 dark:bg-slate-900/50">
          <span className="text-[11px] text-slate-400 font-semibold whitespace-nowrap">Pertanyaan Cepat:</span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p.text)}
              className="px-3 py-1 rounded-xl text-[11px] font-medium bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-500 whitespace-nowrap transition-colors cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Chat Input Field */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={
              activeRole === "FINANCIAL_ASSISTANT"
                ? "Tanyakan perbandingan rasio, valuasi, atau analisis emiten IDX80..."
                : "Tanyakan konsep dasar, istilah keuangan, atau strategi investasi..."
            }
            className="flex-1 px-4 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputMsg.trim() || isTyping}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-950 dark:bg-white dark:text-slate-950 hover:bg-slate-200 disabled:opacity-40 transition-all cursor-pointer shadow-xs"
          >
            Kirim
          </button>
        </div>
      </div>
    </div>
  );
}
