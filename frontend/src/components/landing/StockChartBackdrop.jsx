import React, { useEffect, useMemo, useRef } from "react";

// Bangkitkan seri candlestick & volume deterministik berdasar harga saham IDX aktual
function buildCandleSeries(stocks = [], count = 48) {
  const basePrices = Array.isArray(stocks)
    ? stocks.map((s) => Number(s?.price)).filter((n) => Number.isFinite(n) && n > 0)
    : [];

  const anchor = basePrices.length > 0 ? basePrices[0] : 5775;
  const candles = [];
  let prevClose = anchor * 0.88;

  for (let i = 0; i < count; i += 1) {
    const seed = Math.sin((i + 1) * 1.43) * 0.55 + Math.cos((i + 3) * 0.67) * 0.45;
    const trendBias = i > count * 0.55 ? 0.0045 : 0.0022;
    const stockPull =
      basePrices.length > 0
        ? ((basePrices[i % basePrices.length] % 700) - 350) / 28000
        : 0;

    const deltaPct = seed * 0.022 + trendBias + stockPull;
    const open = prevClose;
    const close = Math.max(anchor * 0.72, open * (1 + deltaPct));
    const spread = Math.abs(close - open) + anchor * (0.008 + Math.abs(Math.sin(i * 2.1)) * 0.012);
    const high = Math.max(open, close) + spread * (0.35 + (i % 3) * 0.14);
    const low = Math.max(anchor * 0.65, Math.min(open, close) - spread * (0.3 + ((i + 1) % 3) * 0.12));
    const volume = 0.25 + ((Math.abs(Math.sin(i * 1.9)) + Math.abs(deltaPct) * 16) % 0.75);

    candles.push({
      open,
      close,
      high,
      low,
      volume,
      isUp: close >= open,
    });
    prevClose = close;
  }

  return candles;
}

export default function StockChartBackdrop({ stocks, pointer, reducedMotion }) {
  const canvasRef = useRef(null);
  const pointerRef = useRef(pointer);
  const candles = useMemo(() => buildCandleSeries(stocks, 52), [stocks]);

  useEffect(() => {
    pointerRef.current = pointer;
  }, [pointer]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let rafId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let smoothX = -1;
    let smoothY = -1;
    let hoverAlpha = 0;

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(canvas);

    const draw = (time) => {
      ctx.clearRect(0, 0, width, height);

      const t = reducedMotion ? 0 : time * 0.001;
      const ptr = pointerRef.current;
      const isHovered = Boolean(ptr?.active);

      hoverAlpha += ((isHovered ? 1 : 0) - hoverAlpha) * (reducedMotion ? 1 : 0.12);
      if (isHovered) {
        if (smoothX < 0) {
          smoothX = ptr.x;
          smoothY = ptr.y;
        } else {
          smoothX += (ptr.x - smoothX) * 0.2;
          smoothY += (ptr.y - smoothY) * 0.2;
        }
      }

      // Hitung domain harga termasuk sedikit gelombang bernapas halus saat idle
      const animatedCandles = candles.map((c, idx) => {
        const wave = reducedMotion ? 0 : Math.sin(t * 1.15 + idx * 0.28) * (c.close * 0.0055);
        return {
          open: c.open + wave,
          close: c.close + wave,
          high: c.high + wave,
          low: c.low + wave,
          volume: c.volume,
          isUp: c.close >= c.open,
        };
      });

      let minLow = Infinity;
      let maxHigh = -Infinity;
      for (const c of animatedCandles) {
        if (c.low < minLow) minLow = c.low;
        if (c.high > maxHigh) maxHigh = c.high;
      }
      const pad = (maxHigh - minLow) * 0.16 || 1;
      const domainMin = minLow - pad;
      const domainMax = maxHigh + pad;
      const domainSpan = domainMax - domainMin || 1;

      const chartTop = height * 0.1;
      const chartBottom = height * 0.88;
      const chartHeight = chartBottom - chartTop;
      const toY = (val) => chartBottom - ((val - domainMin) / domainSpan) * chartHeight;

      // 1. Grid harga & waktu tipis khas terminal saham
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.075)";
      ctx.lineWidth = 1;
      const hRows = 4;
      for (let r = 1; r <= hRows; r += 1) {
        const y = Math.round((height / (hRows + 1)) * r) + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      const vCols = 8;
      for (let col = 1; col < vCols; col += 1) {
        const x = Math.round((width / vCols) * col) + 0.5;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      ctx.restore();

      const step = width / animatedCandles.length;
      const candleWidth = Math.max(3, Math.min(9, step * 0.5));
      const activeIdx =
        hoverAlpha > 0.02
          ? Math.max(0, Math.min(animatedCandles.length - 1, Math.floor(smoothX / step)))
          : -1;

      // 2. Volume bars di tepi bawah
      for (let i = 0; i < animatedCandles.length; i += 1) {
        const c = animatedCandles[i];
        const cx = (i + 0.5) * step;
        const distFactor =
          activeIdx >= 0 ? Math.max(0, 1 - Math.abs(cx - smoothX) / (width * 0.25)) * hoverAlpha : 0;
        const volH = c.volume * (height * 0.19);
        ctx.fillStyle = c.isUp
          ? `rgba(52, 211, 153, ${(0.18 + distFactor * 0.26).toFixed(3)})`
          : `rgba(251, 113, 133, ${(0.16 + distFactor * 0.24).toFixed(3)})`;
        ctx.fillRect(cx - candleWidth * 0.45, height - volH, candleWidth * 0.9, volH);
      }

      // 3. Area & garis tren harga penutupan yang lebih terang
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < animatedCandles.length; i += 1) {
        const x = (i + 0.5) * step;
        const y = toY(animatedCandles[i].close);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.save();
      ctx.shadowColor = "rgba(52, 211, 153, 0.5)";
      ctx.shadowBlur = 12;
      ctx.strokeStyle = `rgba(110, 231, 183, ${(0.62 + hoverAlpha * 0.3).toFixed(3)})`;
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.restore();

      ctx.lineTo((animatedCandles.length - 0.5) * step, height);
      ctx.lineTo(0.5 * step, height);
      ctx.closePath();
      const areaGrad = ctx.createLinearGradient(0, chartTop, 0, height);
      areaGrad.addColorStop(0, "rgba(52, 211, 153, 0.26)");
      areaGrad.addColorStop(0.65, "rgba(52, 211, 153, 0.07)");
      areaGrad.addColorStop(1, "rgba(52, 211, 153, 0)");
      ctx.fillStyle = areaGrad;
      ctx.fill();
      ctx.restore();

      // 4. Candlestick OHLC (terang dan responsif saat didekati kursor)
      for (let i = 0; i < animatedCandles.length; i += 1) {
        const c = animatedCandles[i];
        const cx = (i + 0.5) * step;
        const dist = hoverAlpha > 0.02 ? Math.abs(cx - smoothX) : Infinity;
        const proximity = Math.max(0, 1 - dist / (width * 0.24)) * hoverAlpha;
        const isNearest = i === activeIdx && hoverAlpha > 0.05;

        const bodyAlpha = 0.48 + proximity * 0.45 + (isNearest ? 0.12 : 0);
        const wickAlpha = 0.58 + proximity * 0.38;

        const yHigh = toY(c.high);
        const yLow = toY(c.low);
        const yOpen = toY(c.open);
        const yClose = toY(c.close);
        const bodyTop = Math.min(yOpen, yClose);
        const bodyHeight = Math.max(2.5, Math.abs(yClose - yOpen));

        ctx.strokeStyle = c.isUp
          ? `rgba(110, 231, 183, ${Math.min(1, wickAlpha).toFixed(3)})`
          : `rgba(253, 164, 175, ${Math.min(1, wickAlpha).toFixed(3)})`;
        ctx.lineWidth = isNearest ? 1.7 : 1.15;
        ctx.beginPath();
        ctx.moveTo(cx, yHigh);
        ctx.lineTo(cx, yLow);
        ctx.stroke();

        ctx.fillStyle = c.isUp
          ? `rgba(52, 211, 153, ${Math.min(1, bodyAlpha).toFixed(3)})`
          : `rgba(251, 113, 133, ${Math.min(1, bodyAlpha).toFixed(3)})`;
        ctx.fillRect(cx - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      }

      // 5. Crosshair & label level harga interaktif mengikuti kursor
      if (hoverAlpha > 0.03 && activeIdx >= 0) {
        const activeCandle = animatedCandles[activeIdx];
        const focusX = (activeIdx + 0.5) * step;
        const focusY = toY(activeCandle.close);

        ctx.save();
        ctx.globalAlpha = hoverAlpha;

        // Glow radial lembut di sekitar kursor
        const spot = ctx.createRadialGradient(focusX, focusY, 0, focusX, focusY, 170);
        spot.addColorStop(0, "rgba(52, 211, 153, 0.28)");
        spot.addColorStop(1, "rgba(52, 211, 153, 0)");
        ctx.fillStyle = spot;
        ctx.fillRect(0, 0, width, height);

        // Garis crosshair putus-putus horizontal & vertikal
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(focusX, 0);
        ctx.lineTo(focusX, height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, focusY);
        ctx.lineTo(width, focusY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Penanda presisi berbentuk kotak terminal (tanpa label harga atau titik dekoratif)
        ctx.strokeStyle = activeCandle.isUp ? "#34d399" : "#fb7185";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(focusX - 5, focusY - 5, 10, 10);

        ctx.restore();
      }

      if (!reducedMotion) {
        rafId = window.requestAnimationFrame(draw);
      }
    };

    if (reducedMotion) {
      draw(0);
    } else {
      rafId = window.requestAnimationFrame(draw);
    }

    return () => {
      ro.disconnect();
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [candles, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 w-full h-full"
    />
  );
}
