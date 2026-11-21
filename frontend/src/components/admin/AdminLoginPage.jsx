import React, { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../context/AuthContext";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VERTEX_SHADER_SOURCE = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SOURCE = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
  #else
    precision mediump float;
  #endif
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_dpr;

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float aspect = u_resolution.x / max(u_resolution.y, 1.0);

    // Koordinat ternormalisasi untuk domain-warped wave
    vec2 p = vec2((uv.x - 0.15) * aspect, uv.y - 0.1) * 2.15;
    float t = u_time * 0.28;

    // Iterasi lipatan gelombang organik (folded silk wave)
    for (int i = 1; i < 5; i++) {
      float fi = float(i);
      p.x += (0.58 / fi) * sin(fi * 1.85 * p.y + t + 0.45 * fi);
      p.y += (0.58 / fi) * cos(fi * 1.85 * p.x - t * 0.85 + 0.65 * fi);
    }

    // Intensitas gelombang dan punggung lipatan (ridge)
    float waveA = 0.5 + 0.5 * sin(p.x * 2.1 - p.y * 1.7 + t * 0.4);
    float waveB = 0.5 + 0.5 * cos(p.y * 2.6 + p.x * 1.4 - t * 0.3);
    float ridge = pow(1.0 - abs(sin(p.x * 1.45 + p.y * 1.25)), 2.2);

    float intensity = clamp(waveA * 0.52 + waveB * 0.28 + ridge * 0.48, 0.0, 1.0);

    // Ruang tenang di sudut kiri bawah agar headline memiliki kontras optimal
    float bottomLeftFade = smoothstep(0.05, 0.68, length(vec2(uv.x * 0.95, uv.y * 1.15)));
    intensity *= mix(0.22, 1.0, bottomLeftFade);

    // Matriks rotasi grid halftone (sudut klasik 20 derajat)
    float angle = 0.35;
    float s = sin(angle);
    float c = cos(angle);
    mat2 rot = mat2(c, -s, s, c);

    // Ukuran sel dot proporsional terhadap layar (HiDPI aware)
    float cellSize = 4.6 * u_dpr;
    vec2 gridCoord = (rot * gl_FragCoord.xy) / cellSize;
    vec2 cellUv = fract(gridCoord) - 0.5;
    float dist = length(cellUv);

    // Radius dot berdasarkan intensitas gelombang
    float radius = clamp(pow(intensity, 1.25) * 0.66, 0.03, 0.62);
    float aa = 0.14;
    float dotMask = 1.0 - smoothstep(radius - aa, radius + aa, dist);

    // Palet warna: permukaan putih bersih dengan dot merah (Investpedia Red)
    vec3 bgLight = vec3(0.988, 0.984, 0.985);
    vec3 bgShade = vec3(0.955, 0.925, 0.930);
    vec3 baseBg = mix(bgLight, bgShade, intensity * 0.40);

    vec3 redBright = vec3(0.890, 0.145, 0.185);
    vec3 redDeep = vec3(0.710, 0.075, 0.115);
    vec3 dotColor = mix(redBright, redDeep, smoothstep(0.55, 0.95, intensity));

    vec3 finalColor = mix(baseBg, dotColor, dotMask * smoothstep(0.08, 0.92, intensity));
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

function startWebGLHalftone(canvas) {
  const gl =
    canvas.getContext("webgl", {
      antialias: true,
      alpha: false,
      failIfMajorPerformanceCaveat: false,
    }) || canvas.getContext("experimental-webgl");

  if (!gl) return null;

  const compileShader = (type, source) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const vertexShader = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
  const fragmentShader = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
  if (!vertexShader || !fragmentShader) {
    if (vertexShader) gl.deleteShader(vertexShader);
    if (fragmentShader) gl.deleteShader(fragmentShader);
    return null;
  }

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  gl.useProgram(program);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );

  const positionLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  const timeLocation = gl.getUniformLocation(program, "u_time");
  const dprLocation = gl.getUniformLocation(program, "u_dpr");

  let animationFrameId = null;
  const startTime = performance.now();

  const resizeCanvas = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform1f(dprLocation, dpr);
  };

  resizeCanvas();
  const resizeObserver =
    typeof ResizeObserver !== "undefined" ? new ResizeObserver(resizeCanvas) : null;
  if (resizeObserver) {
    resizeObserver.observe(canvas);
  } else {
    window.addEventListener("resize", resizeCanvas);
  }

  const render = (now) => {
    const elapsedSeconds = (now - startTime) * 0.001;
    gl.uniform1f(timeLocation, elapsedSeconds);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    animationFrameId = window.requestAnimationFrame(render);
  };

  animationFrameId = window.requestAnimationFrame(render);

  return () => {
    if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    if (resizeObserver) {
      resizeObserver.disconnect();
    } else {
      window.removeEventListener("resize", resizeCanvas);
    }
    gl.deleteBuffer(positionBuffer);
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
  };
}

function start2DHalftoneWave(canvas) {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return null;

  let width = 1;
  let height = 1;
  let dpr = 1;
  let animationFrameId = null;
  const startTime = performance.now();

  const resizeCanvas = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, canvas.clientWidth);
    height = Math.max(1, canvas.clientHeight);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  resizeCanvas();
  const resizeObserver =
    typeof ResizeObserver !== "undefined" ? new ResizeObserver(resizeCanvas) : null;
  if (resizeObserver) {
    resizeObserver.observe(canvas);
  } else {
    window.addEventListener("resize", resizeCanvas);
  }

  const smoothstep = (edge0, edge1, x) => {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  };

  const angle = 0.35;
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const cell = 7;

  const render = (now) => {
    const t = ((now - startTime) * 0.001) * 0.28;
    ctx.fillStyle = "#fbf9f9";
    ctx.fillRect(0, 0, width, height);

    const aspect = width / Math.max(height, 1);
    const diag = Math.hypot(width, height);
    const steps = Math.ceil(diag / cell) + 2;
    const cx = width * 0.5;
    const cy = height * 0.5;

    for (let gx = -steps; gx <= steps; gx++) {
      for (let gy = -steps; gy <= steps; gy++) {
        const lx = gx * cell;
        const ly = gy * cell;
        const sx = cx + lx * cosA - ly * sinA;
        const sy = cy + lx * sinA + ly * cosA;
        if (sx < -cell || sx > width + cell || sy < -cell || sy > height + cell) continue;

        const uvx = sx / width;
        const uvy = 1 - sy / height;
        let px = (uvx - 0.15) * aspect * 2.15;
        let py = (uvy - 0.1) * 2.15;

        for (let i = 1; i < 5; i++) {
          const nextPx = px + (0.58 / i) * Math.sin(i * 1.85 * py + t + 0.45 * i);
          const nextPy = py + (0.58 / i) * Math.cos(i * 1.85 * px - t * 0.85 + 0.65 * i);
          px = nextPx;
          py = nextPy;
        }

        const waveA = 0.5 + 0.5 * Math.sin(px * 2.1 - py * 1.7 + t * 0.4);
        const waveB = 0.5 + 0.5 * Math.cos(py * 2.6 + px * 1.4 - t * 0.3);
        const ridge = Math.pow(1 - Math.abs(Math.sin(px * 1.45 + py * 1.25)), 2.2);

        let intensity = Math.max(0, Math.min(1, waveA * 0.52 + waveB * 0.28 + ridge * 0.48));
        const bottomLeftFade = smoothstep(0.05, 0.68, Math.hypot(uvx * 0.95, uvy * 1.15));
        intensity *= 0.22 + (1 - 0.22) * bottomLeftFade;

        const alpha = smoothstep(0.08, 0.92, intensity);
        if (alpha <= 0.02) continue;

        const radius = Math.max(0.3, Math.min(cell * 0.44, Math.pow(intensity, 1.25) * (cell * 0.46)));
        const deepMix = smoothstep(0.55, 0.95, intensity);
        const r = Math.round(227 + (181 - 227) * deepMix);
        const g = Math.round(37 + (19 - 37) * deepMix);
        const b = Math.round(47 + (29 - 47) * deepMix);

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    animationFrameId = window.requestAnimationFrame(render);
  };

  animationFrameId = window.requestAnimationFrame(render);

  return () => {
    if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    if (resizeObserver) {
      resizeObserver.disconnect();
    } else {
      window.removeEventListener("resize", resizeCanvas);
    }
  };
}

function HalftoneWaveCanvas() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const createSizedCanvas = () => {
      const c = document.createElement("canvas");
      c.setAttribute("aria-hidden", "true");
      c.className = "absolute inset-0 w-full h-full block pointer-events-none";
      container.replaceChildren(c);
      return c;
    };

    const webglCanvas = createSizedCanvas();
    let cleanup = null;
    try {
      cleanup = startWebGLHalftone(webglCanvas);
    } catch {
      cleanup = null;
    }

    if (!cleanup) {
      const fallbackCanvas = createSizedCanvas();
      cleanup = start2DHalftoneWave(fallbackCanvas);
    }

    return () => {
      if (cleanup) cleanup();
      container.replaceChildren();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

export default function AdminLoginPage({ onLoginSuccess, onBackToDashboard }) {
  const { login, register, authModalMode, closeAuthModal } = useAuth();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [investorProfile, setInvestorProfile] = useState("BEGINNER");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authModalMode === "register" || authModalMode === "login") {
      setMode(authModalMode);
    }
  }, [authModalMode]);

  const validateForm = () => {
    const errors = {};
    const trimmedEmail = email.trim();

    if (mode === "register" && name.trim().length < 2) {
      errors.name = "Nama minimal 2 karakter.";
    }

    if (!trimmedEmail) {
      errors.email = "Email wajib diisi.";
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = "Format email tidak valid.";
    }

    if (!password) {
      errors.password = "Password wajib diisi.";
    } else if (password.length < 6) {
      errors.password = "Password minimal 6 karakter.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: "" }));
    }
    if (errorMessage) setErrorMessage("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: "" }));
    }
    if (errorMessage) setErrorMessage("");
  };

  const handleQuickFill = (demoEmail) => {
    setMode("login");
    setEmail(demoEmail);
    setPassword("Password123!");
    setFieldErrors({});
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      let loggedUser;
      if (mode === "register") {
        loggedUser = await register({
          name: name.trim(),
          email: email.trim(),
          password,
          investorProfile,
        });
      } else {
        loggedUser = await login({
          email: email.trim(),
          password,
        });
      }
      if (closeAuthModal) closeAuthModal();
      if (onLoginSuccess) {
        onLoginSuccess(loggedUser);
      } else if (loggedUser?.role !== "ADMIN" && onBackToDashboard) {
        onBackToDashboard();
      }
    } catch (err) {
      if (Array.isArray(err.details) && err.details.length > 0) {
        const mapped = {};
        for (const item of err.details) {
          if (item.field) mapped[item.field] = item.message;
        }
        setFieldErrors((prev) => ({ ...prev, ...mapped }));
      }
      setErrorMessage(
        err.message || "Autentikasi gagal. Periksa kembali email dan password Anda."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      aria-labelledby="admin-login-heading"
      className="min-h-screen w-full flex items-center justify-center py-6 sm:py-10 px-3 sm:px-6 bg-slate-50 dark:bg-[#080808]"
    >
      <div className="w-full max-w-5xl lg:min-h-[600px] grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden border border-slate-200 dark:border-[#1f1f22] bg-[#09090b]">
        {/* Bagian Kiri: Halftone Wave Visual & Headline */}
        <div className="relative min-h-[220px] sm:min-h-[260px] lg:min-h-full bg-[#fbf9f9] p-6 sm:p-10 lg:p-11 flex flex-col justify-between overflow-hidden">
          <HalftoneWaveCanvas />

          <div className="relative z-10 flex items-center justify-between">
            {onBackToDashboard && (
              <button
                type="button"
                onClick={onBackToDashboard}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/90 hover:bg-white text-slate-800 border border-slate-200/80 shadow-2xs transition-colors cursor-pointer"
              >
                ← Kembali ke Beranda
              </button>
            )}
          </div>

          <div className="relative z-10 max-w-xs sm:max-w-sm space-y-1.5">
            <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold tracking-tight text-[#111315] leading-[1.16]">
              Investpedia Portal
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-700">
              Akses terpadu untuk Investor & Administrator.
            </p>
          </div>
        </div>

        {/* Bagian Kanan: Brand Identity & Form Login */}
        <div className="bg-white dark:bg-[#09090b] p-6 sm:p-10 lg:p-12 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-[#1f1f22]">
          <div className="w-full max-w-[360px] mx-auto space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src="/investpedia-full.png"
                    alt="Investpedia"
                    className="h-7 sm:h-8 w-auto object-contain select-none block dark:hidden"
                  />
                  <img
                    src="/investpedia-full-dark.png"
                    alt="Investpedia"
                    className="h-7 sm:h-8 w-auto object-contain select-none hidden dark:block"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <h2
                  id="admin-login-heading"
                  className="text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900 dark:text-white"
                >
                  {mode === "register" ? "Buat Akun Baru" : "Selamat Datang"}
                </h2>
                <p className="text-sm text-slate-500 dark:text-zinc-400">
                  {mode === "register"
                    ? "Daftar untuk mulai belajar & menganalisis saham."
                    : "Masuk sebagai Investor atau Administrator untuk melanjutkan."}
                </p>
              </div>
            </div>

            {errorMessage && (
              <div
                role="alert"
                aria-live="polite"
                className="px-3.5 py-2.5 rounded-xl bg-rose-50 dark:bg-[#2a0e12] border border-rose-200 dark:border-[#4c151c] text-xs text-rose-700 dark:text-[#f87171]"
              >
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
              {mode === "register" && (
                <div>
                  <label
                    htmlFor="user-name"
                    className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1.5"
                  >
                    Nama Lengkap
                  </label>
                  <input
                    id="user-name"
                    name="name"
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: "" }));
                    }}
                    placeholder="Nama Lengkap"
                    className="w-full h-11 px-4 rounded-xl text-sm bg-slate-100 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-slate-900 dark:focus:border-zinc-400 focus-visible:outline-none"
                  />
                  {fieldErrors.name && (
                    <p className="mt-1.5 text-xs text-rose-600 dark:text-[#f87171]">
                      {fieldErrors.name}
                    </p>
                  )}
                </div>
              )}
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1.5"
                >
                  Email
                </label>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isSubmitting}
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Email"
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? "admin-email-error" : undefined}
                  className={`w-full h-11 px-4 rounded-xl text-sm bg-slate-100 dark:bg-[#18181b] border text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 transition-colors focus-visible:outline-none disabled:opacity-50 ${
                    fieldErrors.email
                      ? "border-rose-500 dark:border-[#f87171] focus:border-rose-600 dark:focus:border-[#f87171]"
                      : "border-slate-200 dark:border-[#27272a] focus:border-slate-900 dark:focus:border-zinc-400"
                  }`}
                />
                {fieldErrors.email && (
                  <p
                    id="admin-email-error"
                    className="mt-1.5 text-xs text-rose-600 dark:text-[#f87171]"
                  >
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    disabled={isSubmitting}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Password"
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={fieldErrors.password ? "admin-password-error" : undefined}
                    className={`w-full h-11 pl-4 pr-10 rounded-xl text-sm bg-slate-100 dark:bg-[#18181b] border text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 transition-colors focus-visible:outline-none disabled:opacity-50 ${
                      fieldErrors.password
                        ? "border-rose-500 dark:border-[#f87171] focus:border-rose-600 dark:focus:border-[#f87171]"
                        : "border-slate-200 dark:border-[#27272a] focus:border-slate-900 dark:focus:border-zinc-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p
                    id="admin-password-error"
                    className="mt-1.5 text-xs text-rose-600 dark:text-[#f87171]"
                  >
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {mode === "register" && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
                    Profil Pengalaman Investor
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "BEGINNER", label: "Pemula" },
                      { id: "EXPERIENCED", label: "Berpengalaman" },
                    ].map((opt) => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setInvestorProfile(opt.id)}
                        className={`h-9 px-3 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                          investorProfile === opt.id
                            ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-zinc-950 dark:border-white"
                            : "bg-slate-100 dark:bg-[#18181b] text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-[#27272a]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-1.5">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 dark:active:bg-zinc-300 transition-colors cursor-pointer"
                >
                  {isSubmitting
                    ? "Memproses..."
                    : mode === "register"
                      ? "Daftar Akun"
                      : "Masuk"}
                </Button>
              </div>

              {/* Switch Login <-> Register */}
              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode((prev) => (prev === "login" ? "register" : "login"));
                    setFieldErrors({});
                    setErrorMessage("");
                  }}
                  className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
                >
                  {mode === "register"
                    ? "Sudah punya akun? Masuk di sini"
                    : "Belum punya akun investor? Daftar sekarang"}
                </button>
              </div>

              {/* Pintasan Akun Demo (Investor & Admin) */}
              {mode === "login" && (
                <div className="pt-3 border-t border-slate-200 dark:border-[#27272a] space-y-2">
                  <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500 block">
                    Akun Demo Cepat (Semua User & Admin):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuickFill("admin@investai.id")}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-[#E5242A] dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFill("fayiz.pemula@example.com")}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 dark:bg-[#062c19] text-emerald-700 dark:text-[#34d399] border border-emerald-200 dark:border-[#0e4429] hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      Investor Pemula
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFill("fayiz.expert@example.com")}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-[#18181b] text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-[#27272a] hover:border-slate-400 transition-colors cursor-pointer"
                    >
                      Investor Expert
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
