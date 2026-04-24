import { useEffect, useRef } from "react";

export type WoodType = "lipa" | "olha" | "abash";
export type Direction = "horizontal" | "vertical";
export type WallConfig = {
  wood: WoodType;
  direction: Direction;
  salt: boolean;
  juniper: boolean;
  light: boolean;
};

const WOOD_COLORS: Record<WoodType, { base: string; stripe: string; grain: string }> = {
  lipa:  { base: "#E8D5A3", stripe: "#D4BC82", grain: "#C9A96A" },
  olha:  { base: "#C4956A", stripe: "#A87A52", grain: "#8D6040" },
  abash: { base: "#F0E0B8", stripe: "#DEC898", grain: "#CCB070" },
};

const WOOD_LABELS: Record<WoodType, string> = {
  lipa: "Липа",
  olha: "Ольха",
  abash: "Абаш",
};

interface WallCanvasProps {
  config: WallConfig;
  wallWidth: number;
  wallHeight: number;
  label: string;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
}

export default function WallCanvas({ config, wallWidth, wallHeight, label, canvasRef: externalRef }: WallCanvasProps) {
  const internalRef = useRef<HTMLCanvasElement>(null);
  const ref = externalRef || internalRef;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const colors = WOOD_COLORS[config.wood];
    const BOARD = config.direction === "horizontal" ? 28 : 22;

    ctx.clearRect(0, 0, W, H);

    // --- фон дерева ---
    ctx.fillStyle = colors.base;
    ctx.fillRect(0, 0, W, H);

    // --- вагонка ---
    ctx.save();
    if (config.direction === "horizontal") {
      for (let y = 0; y < H; y += BOARD) {
        // доска
        const grad = ctx.createLinearGradient(0, y, 0, y + BOARD);
        grad.addColorStop(0, colors.base);
        grad.addColorStop(0.5, colors.stripe);
        grad.addColorStop(1, colors.base);
        ctx.fillStyle = grad;
        ctx.fillRect(0, y, W, BOARD - 2);

        // тень разделителя
        ctx.fillStyle = "rgba(0,0,0,0.18)";
        ctx.fillRect(0, y + BOARD - 2, W, 2);

        // волокна
        ctx.strokeStyle = colors.grain;
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.35;
        for (let gx = 0; gx < W; gx += 60 + (y % 40)) {
          ctx.beginPath();
          ctx.moveTo(gx, y);
          ctx.bezierCurveTo(gx + 15, y + BOARD * 0.3, gx - 10, y + BOARD * 0.7, gx + 5, y + BOARD - 2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
    } else {
      for (let x = 0; x < W; x += BOARD) {
        const grad = ctx.createLinearGradient(x, 0, x + BOARD, 0);
        grad.addColorStop(0, colors.base);
        grad.addColorStop(0.5, colors.stripe);
        grad.addColorStop(1, colors.base);
        ctx.fillStyle = grad;
        ctx.fillRect(x, 0, BOARD - 2, H);

        ctx.fillStyle = "rgba(0,0,0,0.18)";
        ctx.fillRect(x + BOARD - 2, 0, 2, H);

        ctx.strokeStyle = colors.grain;
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.35;
        for (let gy = 0; gy < H; gy += 60 + (x % 40)) {
          ctx.beginPath();
          ctx.moveTo(x, gy);
          ctx.bezierCurveTo(x + BOARD * 0.3, gy + 15, x + BOARD * 0.7, gy - 10, x + BOARD - 2, gy + 5);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
    }
    ctx.restore();

    // --- гималайская соль ---
    if (config.salt) {
      // панно 40% ширины по центру
      const pw = Math.floor(W * 0.38);
      const ph = Math.floor(H * 0.52);
      const px = Math.floor((W - pw) / 2);
      const py = Math.floor((H - ph) / 2);

      // фон панно
      const saltGrad = ctx.createRadialGradient(px + pw / 2, py + ph / 2, 10, px + pw / 2, py + ph / 2, pw * 0.7);
      saltGrad.addColorStop(0, "#FFCBA4");
      saltGrad.addColorStop(0.4, "#E8956A");
      saltGrad.addColorStop(1, "#C06030");
      ctx.fillStyle = saltGrad;
      ctx.fillRect(px, py, pw, ph);

      // кристаллы соли
      ctx.save();
      for (let i = 0; i < 220; i++) {
        const cx2 = px + Math.random() * pw;
        const cy2 = py + Math.random() * ph;
        const r = 1.5 + Math.random() * 3.5;
        const alpha = 0.3 + Math.random() * 0.6;
        ctx.beginPath();
        ctx.arc(cx2, cy2, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,230,200,${alpha})`;
        ctx.fill();
      }
      // прожилки
      ctx.strokeStyle = "rgba(255,200,150,0.25)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 18; i++) {
        ctx.beginPath();
        ctx.moveTo(px + Math.random() * pw, py + Math.random() * ph);
        ctx.lineTo(px + Math.random() * pw, py + Math.random() * ph);
        ctx.stroke();
      }
      ctx.restore();

      // рамка
      ctx.strokeStyle = "rgba(201,147,58,0.7)";
      ctx.lineWidth = 2;
      ctx.strokeRect(px, py, pw, ph);

      // подпись
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = "bold 11px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Гим. соль", px + pw / 2, py + ph + 14);
    }

    // --- можжевельник ---
    if (config.juniper) {
      const jw = 18;
      // полосы по краям
      [[4, 4, jw, H - 8], [W - jw - 4, 4, jw, H - 8]].forEach(([jx, jy, jW, jH]) => {
        ctx.fillStyle = "#2D5A1B";
        ctx.fillRect(jx, jy, jW, jH);

        // текстура хвои
        ctx.save();
        for (let fy = jy + 4; fy < jy + jH - 4; fy += 7) {
          for (let fx = jx + 2; fx < jx + jW - 2; fx += 5) {
            ctx.beginPath();
            ctx.moveTo(fx, fy);
            ctx.lineTo(fx - 4, fy + 5);
            ctx.lineTo(fx + 4, fy + 5);
            ctx.closePath();
            ctx.fillStyle = fy % 14 === 0 ? "#3D7A25" : "#245015";
            ctx.fill();
          }
        }
        ctx.restore();

        ctx.strokeStyle = "rgba(201,147,58,0.5)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(jx, jy, jW, jH);
      });

      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.font = "bold 9px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Мож.", W / 2, H - 6);
    }

    // --- подсветка ---
    if (config.light) {
      // плинтус снизу
      const glowH = 18;
      const glowGrad = ctx.createLinearGradient(0, H - glowH * 2, 0, H);
      glowGrad.addColorStop(0, "rgba(255,140,30,0)");
      glowGrad.addColorStop(0.6, "rgba(255,140,30,0.25)");
      glowGrad.addColorStop(1, "rgba(255,180,60,0.55)");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, H - glowH * 2, W, glowH * 2);

      // светодиодная полоса
      ctx.fillStyle = "#FFD060";
      ctx.fillRect(0, H - glowH, W, 4);

      // боковое свечение
      [0, W - 8].forEach((lx) => {
        const sideGrad = ctx.createLinearGradient(lx, 0, lx + (lx === 0 ? 40 : -40), 0);
        sideGrad.addColorStop(0, "rgba(255,160,30,0.3)");
        sideGrad.addColorStop(1, "rgba(255,160,30,0)");
        ctx.fillStyle = sideGrad;
        ctx.fillRect(lx, 0, lx === 0 ? 40 : 8, H);
      });

      // точечный блик
      for (let lx2 = W * 0.15; lx2 < W * 0.9; lx2 += W * 0.18) {
        const spotGrad = ctx.createRadialGradient(lx2, H - glowH, 0, lx2, H - glowH, 35);
        spotGrad.addColorStop(0, "rgba(255,220,80,0.6)");
        spotGrad.addColorStop(1, "rgba(255,220,80,0)");
        ctx.fillStyle = spotGrad;
        ctx.fillRect(lx2 - 35, H - glowH - 35, 70, 70);
      }
    }

    // --- рамка стены ---
    ctx.strokeStyle = "rgba(201,147,58,0.4)";
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, W - 3, H - 3);

    // --- подпись стены ---
    ctx.fillStyle = "rgba(26,18,8,0.75)";
    ctx.fillRect(0, 0, W, 26);
    ctx.fillStyle = "#C9933A";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`${label}  ·  ${wallWidth}м × ${wallHeight}м  ·  ${WOOD_LABELS[config.wood]}`, 10, 17);

  }, [config, wallWidth, wallHeight, label, ref]);

  return (
    <canvas
      ref={ref}
      width={420}
      height={260}
      className="rounded-xl w-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
