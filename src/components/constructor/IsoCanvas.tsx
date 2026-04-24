import { useEffect, useRef, forwardRef } from "react";
import type { RoomConfig } from "./useRoomConfig";
import { getAutoPlacement } from "./useRoomConfig";

// ── Цвета пород ──────────────────────────────────────────────
const WOOD: Record<string, { light: string; mid: string; dark: string; grain: string }> = {
  lipa:  { light: "#EFE0B2", mid: "#DCC88A", dark: "#C9AE6A", grain: "#B89A50" },
  olha:  { light: "#D4A06A", mid: "#B8804A", dark: "#9A6030", grain: "#7A4820" },
  abash: { light: "#F5EAC8", mid: "#E2D0A0", dark: "#CEB870", grain: "#BAA050" },
};

// ── Утилиты canvas ───────────────────────────────────────────
function poly(ctx: CanvasRenderingContext2D, pts: [number, number][], fill: string, stroke?: string, lw = 1) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  pts.slice(1).forEach(p => ctx.lineTo(p[0], p[1]));
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

// ── Текстура вагонки ─────────────────────────────────────────
function drawWood(
  ctx: CanvasRenderingContext2D,
  pts: [number, number][],      // 4 точки грани (TL TR BR BL)
  wood: string,
  dir: "h" | "v",
  boardPx: number,
  seed: number
) {
  const [tl, tr, br, bl] = pts;
  const W = WOOD[wood] || WOOD.lipa;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(tl[0], tl[1]);
  ctx.lineTo(tr[0], tr[1]);
  ctx.lineTo(br[0], br[1]);
  ctx.lineTo(bl[0], bl[1]);
  ctx.closePath();
  ctx.clip();

  // Кол-во досок
  const steps = Math.ceil(40 / boardPx) + 2;

  for (let i = 0; i < steps; i++) {
    const t0 = i / steps;
    const t1 = (i + 1) / steps;

    let p0a: [number, number], p0b: [number, number],
        p1a: [number, number], p1b: [number, number];

    if (dir === "h") {
      p0a = [lerp(tl[0], bl[0], t0), lerp(tl[1], bl[1], t0)];
      p0b = [lerp(tr[0], br[0], t0), lerp(tr[1], br[1], t0)];
      p1a = [lerp(tl[0], bl[0], t1), lerp(tl[1], bl[1], t1)];
      p1b = [lerp(tr[0], br[0], t1), lerp(tr[1], br[1], t1)];
    } else {
      p0a = [lerp(tl[0], tr[0], t0), lerp(tl[1], tr[1], t0)];
      p0b = [lerp(bl[0], br[0], t0), lerp(bl[1], br[1], t0)];
      p1a = [lerp(tl[0], tr[0], t1), lerp(tl[1], tr[1], t1)];
      p1b = [lerp(bl[0], br[0], t1), lerp(bl[1], br[1], t1)];
    }

    // Доска — градиент от светлого к тёмному
    const grd = ctx.createLinearGradient(p0a[0], p0a[1], p1a[0], p1a[1]);
    const phase = (i + seed) % 3;
    grd.addColorStop(0,   phase === 0 ? W.light : phase === 1 ? W.mid : W.dark);
    grd.addColorStop(0.5, W.mid);
    grd.addColorStop(1,   phase === 0 ? W.dark  : phase === 1 ? W.light : W.mid);
    poly(ctx, [p0a, p0b, p1b, p1a], "");
    ctx.fillStyle = grd; ctx.fill();

    // Разделитель
    const gap = 0.85;
    const ga = [lerp(p1a[0], p0a[0], 1 - gap), lerp(p1a[1], p0a[1], 1 - gap)] as [number,number];
    const gb = [lerp(p1b[0], p0b[0], 1 - gap), lerp(p1b[1], p0b[1], 1 - gap)] as [number,number];
    ctx.beginPath();
    ctx.moveTo(p1a[0], p1a[1]); ctx.lineTo(p1b[0], p1b[1]);
    ctx.lineTo(gb[0], gb[1]);   ctx.lineTo(ga[0], ga[1]);
    ctx.closePath();
    ctx.fillStyle = "rgba(0,0,0,0.22)"; ctx.fill();

    // Волокна
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = W.grain; ctx.lineWidth = 0.7;
    const rng = (n: number) => Math.sin(seed * 13.7 + i * 7.3 + n * 3.1) * 0.5 + 0.5;
    for (let g = 0; g < 3; g++) {
      const t = rng(g);
      const ga2: [number,number] = [lerp(p0a[0], p0b[0], t), lerp(p0a[1], p0b[1], t)];
      const gb2: [number,number] = [lerp(p1a[0], p1b[0], t), lerp(p1a[1], p1b[1], t)];
      ctx.beginPath();
      ctx.moveTo(ga2[0], ga2[1]);
      ctx.bezierCurveTo(
        lerp(ga2[0], gb2[0], 0.3) + rng(g+5)*6 - 3,
        lerp(ga2[1], gb2[1], 0.3) + rng(g+6)*4 - 2,
        lerp(ga2[0], gb2[0], 0.7) + rng(g+7)*6 - 3,
        lerp(ga2[1], gb2[1], 0.7) + rng(g+8)*4 - 2,
        gb2[0], gb2[1]
      );
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

// ── Гималайская соль (кирпичная кладка) ──────────────────────
function drawSalt(ctx: CanvasRenderingContext2D, pts: [number, number][]) {
  const [tl, tr, br, bl] = pts;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(tl[0], tl[1]); ctx.lineTo(tr[0], tr[1]);
  ctx.lineTo(br[0], br[1]); ctx.lineTo(bl[0], bl[1]);
  ctx.closePath(); ctx.clip();

  // Ширина и высота грани в пикселях (приблизительно)
  const faceW = Math.hypot(tr[0]-tl[0], tr[1]-tl[1]);
  const faceH = Math.hypot(bl[0]-tl[0], bl[1]-tl[1]);

  // Кирпич: 21×6.5 см → соотношение ~3.2:1
  const brickRows = Math.max(4, Math.round(faceH / 14));
  const brickCols = Math.max(3, Math.round(faceW / 20));

  for (let row = 0; row < brickRows; row++) {
    const t0 = row / brickRows;
    const t1 = (row + 1) / brickRows;
    const offset = row % 2 === 0 ? 0 : 0.5 / brickCols;

    for (let col = 0; col < brickCols + 1; col++) {
      const s0 = col / brickCols - offset;
      const s1 = (col + 1) / brickCols - offset;

      // 4 угла кирпича в пространстве грани
      const p00 = quadLerp(tl, tr, bl, br, s0, t0);
      const p10 = quadLerp(tl, tr, bl, br, s1, t0);
      const p11 = quadLerp(tl, tr, bl, br, s1, t1);
      const p01 = quadLerp(tl, tr, bl, br, s0, t1);

      // Цвет кирпича — оттенки соли
      const rng = Math.sin(row * 17.3 + col * 31.7) * 0.5 + 0.5;
      const h = Math.floor(lerp(15, 28, rng));
      const s = Math.floor(lerp(55, 80, rng));
      const l = Math.floor(lerp(52, 72, rng));
      ctx.fillStyle = `hsl(${h},${s}%,${l}%)`;

      const gap = 0.06;
      const ip00 = shrink(p00, p10, p11, p01, gap);
      poly(ctx, ip00, ctx.fillStyle);

      // Кристаллы соли на кирпиче
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(ip00[0][0], ip00[0][1]);
      ip00.slice(1).forEach(p => ctx.lineTo(p[0], p[1]));
      ctx.closePath(); ctx.clip();

      const cx = (ip00[0][0]+ip00[1][0]+ip00[2][0]+ip00[3][0])/4;
      const cy = (ip00[0][1]+ip00[1][1]+ip00[2][1]+ip00[3][1])/4;
      for (let k = 0; k < 6; k++) {
        const kx = cx + (Math.sin(row*3.1+col*7.2+k*2.1) * 0.35) * Math.hypot(ip00[1][0]-ip00[0][0], ip00[1][1]-ip00[0][1]);
        const ky = cy + (Math.cos(row*5.3+col*2.9+k*1.7) * 0.35) * Math.hypot(ip00[3][1]-ip00[0][1], ip00[3][0]-ip00[0][0]);
        const kr = 0.5 + Math.abs(Math.sin(k*3.7+row))*1.5;
        ctx.beginPath(); ctx.arc(kx, ky, kr, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,235,210,${0.3+Math.abs(Math.sin(k*2.1))*0.5})`;
        ctx.fill();
      }
      ctx.restore();

      // Шов
      ctx.strokeStyle = "rgba(180,100,50,0.5)";
      ctx.lineWidth = 0.8;
      poly(ctx, ip00, "transparent", "rgba(120,60,20,0.4)", 0.8);
    }
  }
  ctx.restore();
}

// ── Можжевельник (спилы) ─────────────────────────────────────
function drawJuniper(ctx: CanvasRenderingContext2D, pts: [number, number][], seed: number) {
  const [tl, tr, br, bl] = pts;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(tl[0], tl[1]); ctx.lineTo(tr[0], tr[1]);
  ctx.lineTo(br[0], br[1]); ctx.lineTo(bl[0], bl[1]);
  ctx.closePath(); ctx.clip();

  const faceW = Math.hypot(tr[0]-tl[0], tr[1]-tl[1]);
  const faceH = Math.hypot(bl[0]-tl[0], bl[1]-tl[1]);

  // Генерируем спилы хаотично
  const rng = (n: number) => Math.abs(Math.sin(seed * 13.1 + n * 7.3));
  const count = Math.floor(faceW * faceH / 1800) + 6;

  for (let i = 0; i < count; i++) {
    const sx = rng(i * 3);
    const sy = rng(i * 3 + 1);
    const radiusPct = 0.03 + rng(i * 3 + 2) * 0.11; // 3–14% ширины грани

    const center = quadLerp(tl, tr, bl, br, sx, sy);
    const rx = radiusPct * faceW;
    const ry = rx * 0.55; // изометрическое сплющивание

    // Годовые кольца
    const rings = Math.max(3, Math.floor(rng(i+99) * 7) + 3);
    for (let r = rings; r >= 1; r--) {
      const t2 = r / rings;
      const age = 1 - t2;
      const lightness = Math.floor(lerp(28, 62, age));
      const sat = Math.floor(lerp(25, 55, age));
      ctx.beginPath();
      ctx.ellipse(center[0], center[1], rx * t2, ry * t2, 0, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${Math.floor(lerp(100,140,age))},${sat}%,${lightness}%)`;
      ctx.fill();
    }

    // Сердцевина
    ctx.beginPath();
    ctx.ellipse(center[0], center[1], rx * 0.12, ry * 0.12, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#3A2010"; ctx.fill();

    // Трещины
    ctx.save();
    ctx.strokeStyle = "rgba(50,25,5,0.35)"; ctx.lineWidth = 0.5;
    for (let c = 0; c < 4; c++) {
      const angle = (c / 4) * Math.PI + rng(i + c * 50) * 0.5;
      ctx.beginPath();
      ctx.moveTo(center[0], center[1]);
      ctx.lineTo(center[0] + Math.cos(angle) * rx * 0.85, center[1] + Math.sin(angle) * ry * 0.85);
      ctx.stroke();
    }
    // Контур спила
    ctx.strokeStyle = "rgba(40,20,5,0.5)"; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(center[0], center[1], rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// ── Подсветка LED ────────────────────────────────────────────
function drawLight(ctx: CanvasRenderingContext2D, pts: [number, number][]) {
  const [, , br, bl] = pts;
  ctx.save();
  // Полоса по нижнему краю
  const grd = ctx.createLinearGradient(
    (bl[0]+br[0])/2, Math.min(bl[1],br[1]) - 40,
    (bl[0]+br[0])/2, Math.max(bl[1],br[1])
  );
  grd.addColorStop(0, "rgba(255,150,30,0)");
  grd.addColorStop(0.6, "rgba(255,150,30,0.2)");
  grd.addColorStop(1, "rgba(255,200,60,0.55)");

  ctx.beginPath();
  ctx.moveTo(bl[0], bl[1]);
  ctx.lineTo(br[0], br[1]);
  ctx.lineTo(br[0], br[1] - 50);
  ctx.lineTo(bl[0], bl[1] - 50);
  ctx.closePath();
  ctx.fillStyle = grd; ctx.fill();

  // LED-полоска
  ctx.beginPath();
  ctx.moveTo(bl[0], bl[1] - 2);
  ctx.lineTo(br[0], br[1] - 2);
  ctx.strokeStyle = "#FFE060"; ctx.lineWidth = 2.5; ctx.stroke();

  // Точечные блики
  const steps = 6;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const px = lerp(bl[0], br[0], t);
    const py = lerp(bl[1], br[1], t) - 2;
    const sg = ctx.createRadialGradient(px, py, 0, px, py, 22);
    sg.addColorStop(0, "rgba(255,230,80,0.55)");
    sg.addColorStop(1, "rgba(255,230,80,0)");
    ctx.beginPath(); ctx.arc(px, py, 22, 0, Math.PI*2);
    ctx.fillStyle = sg; ctx.fill();
  }
  ctx.restore();
}

// ── Вспомогательные функции ───────────────────────────────────
function quadLerp(
  tl: [number,number], tr: [number,number],
  bl: [number,number], br: [number,number],
  s: number, t: number
): [number, number] {
  const top:    [number,number] = [lerp(tl[0],tr[0],s), lerp(tl[1],tr[1],s)];
  const bottom: [number,number] = [lerp(bl[0],br[0],s), lerp(bl[1],br[1],s)];
  return [lerp(top[0],bottom[0],t), lerp(top[1],bottom[1],t)];
}

function shrink(
  p00:[number,number], p10:[number,number],
  p11:[number,number], p01:[number,number],
  g: number
): [number,number][] {
  const cx = (p00[0]+p10[0]+p11[0]+p01[0])/4;
  const cy = (p00[1]+p10[1]+p11[1]+p01[1])/4;
  return [p00,p10,p11,p01].map(([x,y]) =>
    [lerp(x,cx,g), lerp(y,cy,g)] as [number,number]
  );
}

// ── Печь ─────────────────────────────────────────────────────
function drawStove(
  ctx: CanvasRenderingContext2D,
  corner: string, stoveType: string,
  isoX: (wx:number,wz:number)=>number,
  isoY: (wx:number,wz:number,wy:number)=>number,
  W: number, D: number, H: number
) {
  const sz = 0.55; // размер печи в метрах
  const sh = 0.85;
  let ox = 0.1, oz = 0.1;
  if (corner === "front-right")  { ox = W - sz - 0.1; oz = 0.1; }
  if (corner === "back-left")    { ox = 0.1;           oz = D - sz - 0.1; }
  if (corner === "back-right")   { ox = W - sz - 0.1; oz = D - sz - 0.1; }

  // Корпус печи — параллелепипед
  const corners: [number,number,number][] = [
    [ox,     0,   oz    ], [ox+sz,  0,   oz    ],
    [ox+sz,  0,   oz+sz ], [ox,     0,   oz+sz ],
    [ox,     sh,  oz    ], [ox+sz,  sh,  oz    ],
    [ox+sz,  sh,  oz+sz ], [ox,     sh,  oz+sz ],
  ];
  const iso = ([x,y,z]: [number,number,number]): [number,number] =>
    [isoX(x,z), isoY(x,z,y)];

  const faces: [number,number,number][][] = [
    [corners[4],corners[5],corners[1],corners[0]], // передняя
    [corners[5],corners[6],corners[2],corners[1]], // правая
    [corners[4],corners[5],corners[6],corners[7]], // верх
  ];
  const faceColors = stoveType === "wood"
    ? ["#5A3020","#4A2010","#6A4030"]
    : ["#3A3A3A","#2A2A2A","#4A4A4A"];

  faces.forEach((face, fi) => {
    const isoFace = face.map(iso) as [number,number][];
    poly(ctx, isoFace, faceColors[fi], "rgba(0,0,0,0.4)", 1);
  });

  // Электро: панель управления
  if (stoveType === "electric") {
    const panelPts = [
      iso(corners[4]), iso(corners[5]),
      iso([ox+sz, sh*0.7, oz]), iso([ox, sh*0.7, oz])
    ] as [number,number][];
    poly(ctx, panelPts, "#222", "rgba(0,0,0,0.3)", 0.5);
    // Индикаторы
    for (let k = 0; k < 3; k++) {
      const tp: [number,number] = [
        lerp(panelPts[0][0], panelPts[1][0], 0.25 + k*0.25),
        lerp(panelPts[0][1], panelPts[1][1], 0.25 + k*0.25) + 3
      ];
      ctx.beginPath(); ctx.arc(tp[0], tp[1], 2.5, 0, Math.PI*2);
      ctx.fillStyle = k === 1 ? "#FF4040" : "#40FF40"; ctx.fill();
    }
  }

  // Дровяная: дверца + труба
  if (stoveType === "wood") {
    const doorPts = [
      iso([ox+0.1,  sh*0.35, oz]),
      iso([ox+sz-0.1, sh*0.35, oz]),
      iso([ox+sz-0.1, sh*0.1,  oz]),
      iso([ox+0.1,  sh*0.1,  oz])
    ] as [number,number][];
    poly(ctx, doorPts, "#2A1808", "rgba(201,147,58,0.5)", 1);
    // Отблеск огня
    const fc = iso([ox+sz/2, sh*0.22, oz]);
    const fg = ctx.createRadialGradient(fc[0], fc[1], 0, fc[0], fc[1], 8);
    fg.addColorStop(0, "rgba(255,200,50,0.7)");
    fg.addColorStop(1, "rgba(255,100,0,0)");
    ctx.beginPath(); ctx.arc(fc[0], fc[1], 8, 0, Math.PI*2);
    ctx.fillStyle = fg; ctx.fill();

    // Труба
    const t0 = iso([ox+sz/2-0.06, sh, oz+0.06]);
    const t1 = iso([ox+sz/2+0.06, sh, oz+0.06]);
    const th = isoY(ox+sz/2, oz+0.06, sh + H*0.35) - isoY(ox+sz/2, oz+0.06, sh);
    ctx.beginPath();
    ctx.moveTo(t0[0], t0[1]); ctx.lineTo(t1[0], t1[1]);
    ctx.lineTo(t1[0], t1[1]+th); ctx.lineTo(t0[0], t0[1]+th);
    ctx.closePath();
    ctx.fillStyle = "#4A3020"; ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 0.5; ctx.stroke();
  }

  // Камни на печи
  const topPts = faces[2].map(iso) as [number,number][];
  for (let k = 0; k < 8; k++) {
    const ks = 0.2 + 0.6 * (k/8);
    const kt = 0.15 + 0.7 * Math.abs(Math.sin(k*2.3));
    const kc = quadLerp(topPts[0], topPts[1], topPts[3], topPts[2], ks, kt);
    const kr = 2 + Math.abs(Math.sin(k*3.7)) * 3;
    ctx.beginPath(); ctx.ellipse(kc[0], kc[1], kr, kr*0.6, 0, 0, Math.PI*2);
    ctx.fillStyle = `hsl(20,15%,${30+k*3}%)`; ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 0.4; ctx.stroke();
  }

  // Подпись
  const labelPos = iso([ox+sz/2, 0, oz+sz/2]);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "bold 9px Arial"; ctx.textAlign = "center";
  ctx.fillText(stoveType === "wood" ? "🔥 Дровяная" : "⚡ Электро", labelPos[0], labelPos[1] + 12);
}

// ── Дверь ────────────────────────────────────────────────────
function drawDoor(
  ctx: CanvasRenderingContext2D,
  wall: string,
  isoX: (wx:number,wz:number)=>number,
  isoY: (wx:number,wz:number,wy:number)=>number,
  W: number, D: number
) {
  const dw = 0.7, dh = 1.9, dt = 0.05;

  let pts: [number,number,number][][] = [];
  if (wall === "front") {
    const cx = W/2;
    pts = [[
      [cx-dw/2, 0, dt], [cx+dw/2, 0, dt],
      [cx+dw/2, dh, dt], [cx-dw/2, dh, dt]
    ]];
  } else if (wall === "left") {
    const cz = D/2;
    pts = [[
      [dt, 0, cz-dw/2], [dt, 0, cz+dw/2],
      [dt, dh, cz+dw/2], [dt, dh, cz-dw/2]
    ]];
  } else {
    const cz = D/2;
    pts = [[
      [W-dt, 0, cz-dw/2], [W-dt, 0, cz+dw/2],
      [W-dt, dh, cz+dw/2], [W-dt, dh, cz-dw/2]
    ]];
  }

  pts.forEach(face => {
    const iso = (p: [number,number,number]): [number,number] =>
      [isoX(p[0],p[2]), isoY(p[0],p[2],p[1])];
    const f = face.map(iso) as [number,number][];

    // Дверное полотно
    poly(ctx, f, "#3A2A18", "rgba(201,147,58,0.6)", 1.5);

    // Панели двери
    const inner = shrink(f[0], f[1], f[2], f[3], 0.08);
    poly(ctx, inner, "#2E2010", "rgba(201,147,58,0.3)", 0.5);
    const mid = [
      quadLerp(f[0],f[1],f[3],f[2],0.5,0.5) as [number,number]
    ];

    // Ручка
    const handle = quadLerp(f[0], f[1], f[3], f[2], 0.82, 0.42);
    ctx.beginPath(); ctx.arc(handle[0], handle[1], 3, 0, Math.PI*2);
    ctx.fillStyle = "#C9933A"; ctx.fill();
    ctx.strokeStyle = "#8A611A"; ctx.lineWidth = 0.5; ctx.stroke();
    void inner; void mid;
  });
}

// ── Главный рендер ───────────────────────────────────────────
interface IsoCanvasProps {
  config: RoomConfig;
}

const IsoCanvas = forwardRef<HTMLCanvasElement, IsoCanvasProps>(({ config }, ref) => {
  const internalRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = (ref as React.RefObject<HTMLCanvasElement>) || internalRef;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const CW = canvas.width;
    const CH = canvas.height;
    ctx.clearRect(0, 0, CW, CH);

    // Фон
    ctx.fillStyle = "#0D0904";
    ctx.fillRect(0, 0, CW, CH);

    const { width: W, depth: D, height: H } = config;

    // ── Изометрическая проекция ──
    // Масштаб: подбираем чтобы комната вписалась в canvas
    const scale = Math.min(
      (CW * 0.38) / (W * 0.5 + D * 0.5),
      (CH * 0.55) / (W * 0.25 + D * 0.25 + H * 0.5)
    );

    const originX = CW * 0.5;
    const originY = CH * 0.62;

    // Изометрические функции (2.5D cabinet projection)
    const isoX = (wx: number, wz: number) =>
      originX + (wx - wz) * scale * 0.5;
    const isoY = (wx: number, wz: number, wy: number) =>
      originY - wy * scale * 0.85 + (wx + wz) * scale * 0.25;

    // 8 вершин комнаты (внутренняя сторона)
    // Нижние: (0,0,0) (W,0,0) (W,0,D) (0,0,D)
    // Верхние: те же + H по Y
    const v = (x:number,z:number,y:number): [number,number] => [isoX(x,z), isoY(x,z,y)];

    // ── Пол ──
    const floorPts: [number,number][] = [v(0,0,0), v(W,0,0), v(W,D,0), v(0,D,0)];
    const floorGrd = ctx.createLinearGradient(v(0,0,0)[0], v(0,0,0)[1], v(W,D,0)[0], v(W,D,0)[1]);
    floorGrd.addColorStop(0, "#2A1E10");
    floorGrd.addColorStop(1, "#1A1208");
    poly(ctx, floorPts, "", "rgba(201,147,58,0.2)", 1);
    ctx.fillStyle = floorGrd; ctx.fill();

    // Доски пола
    const fBoardN = Math.ceil(D * 4);
    for (let i = 0; i < fBoardN; i++) {
      const t = i / fBoardN;
      const t1 = (i+1) / fBoardN;
      const W2 = WOOD[config.wood] || WOOD.lipa;
      ctx.beginPath();
      ctx.moveTo(...v(0,t*D,0)); ctx.lineTo(...v(W,t*D,0));
      ctx.lineTo(...v(W,t1*D,0)); ctx.lineTo(...v(0,t1*D,0));
      ctx.closePath();
      ctx.fillStyle = i%2===0 ? W2.mid : W2.dark;
      ctx.globalAlpha = 0.6; ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle="rgba(0,0,0,0.15)"; ctx.lineWidth=0.4; ctx.stroke();
    }

    // ── Потолок ──
    const ceilPts: [number,number][] = [v(0,0,H), v(W,0,H), v(W,D,H), v(0,D,H)];
    poly(ctx, ceilPts, "rgba(26,18,8,0.7)", "rgba(201,147,58,0.15)", 1);

    // ── Авто-размещение материалов ──
    const { saltWall, juniperWalls } = getAutoPlacement(config);

    // ── Задняя стена (z=D) ──
    {
      const pts: [number,number][] = [v(0,D,H), v(W,D,H), v(W,D,0), v(0,D,0)];
      const hasSalt = saltWall === "back";
      const hasJuniper = juniperWalls.includes("back");
      drawWood(ctx, pts, config.wood, config.direction==="horizontal"?"h":"v", 20, 1);
      if (hasSalt) drawSalt(ctx, pts);
      if (hasJuniper) drawJuniper(ctx, pts, 2);
      if (config.light) drawLight(ctx, pts);
      poly(ctx, pts, "transparent", "rgba(0,0,0,0.25)", 1.5);
    }

    // ── Левая стена (x=0) ──
    {
      const pts: [number,number][] = [v(0,0,H), v(0,D,H), v(0,D,0), v(0,0,0)];
      const hasSalt = saltWall === "left";
      const hasJuniper = juniperWalls.includes("left");
      drawWood(ctx, pts, config.wood, config.direction==="horizontal"?"h":"v", 20, 3);
      if (hasSalt) drawSalt(ctx, pts);
      if (hasJuniper) drawJuniper(ctx, pts, 5);
      if (config.light) drawLight(ctx, pts);
      poly(ctx, pts, "transparent", "rgba(0,0,0,0.2)", 1);
    }

    // ── Правая стена (x=W) ──
    {
      const pts: [number,number][] = [v(W,0,H), v(W,D,H), v(W,D,0), v(W,0,0)];
      const hasSalt = saltWall === "right";
      const hasJuniper = juniperWalls.includes("right");
      drawWood(ctx, pts, config.wood, config.direction==="horizontal"?"h":"v", 20, 7);
      if (hasSalt) drawSalt(ctx, pts);
      if (hasJuniper) drawJuniper(ctx, pts, 11);
      if (config.light) drawLight(ctx, pts);
      poly(ctx, pts, "transparent", "rgba(0,0,0,0.15)", 1);
    }

    // ── Передняя стена (z=0) — полупрозрачная ──
    {
      const pts: [number,number][] = [v(0,0,H), v(W,0,H), v(W,0,0), v(0,0,0)];
      poly(ctx, pts, "rgba(13,9,4,0.18)", "rgba(201,147,58,0.1)", 1);
    }

    // ── Печь ──
    if (config.stoveEnabled) {
      drawStove(ctx, config.stoveCorner, config.stoveType, isoX, isoY, W, D, H);
    }

    // ── Дверь ──
    drawDoor(ctx, config.doorWall, isoX, isoY, W, D);

    // ── Размерные подписи ──
    ctx.fillStyle = "rgba(201,147,58,0.7)";
    ctx.font = "11px Arial"; ctx.textAlign = "center";

    // Ширина
    const wm = v(W/2, 0, 0);
    ctx.fillText(`${W.toFixed(1)}м`, wm[0], wm[1] + 16);
    // Глубина
    const dm = v(0, D/2, 0);
    ctx.fillText(`${D.toFixed(1)}м`, dm[0] - 22, dm[1] + 4);
    // Высота
    const hm = v(0, 0, H/2);
    ctx.fillText(`${H.toFixed(1)}м`, hm[0] - 20, hm[1]);

    // Стрелки рёбер
    ctx.strokeStyle = "rgba(201,147,58,0.35)"; ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    [[v(0,0,0), v(W,0,0)], [v(0,0,0), v(0,D,0)], [v(0,0,0), v(0,0,H)]].forEach(([a,b]) => {
      ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.lineTo(b[0],b[1]); ctx.stroke();
    });
    ctx.setLineDash([]);

    // ── Легенда материалов ──
    const legend: [string, string][] = [
      [{ lipa:"Липа", olha:"Ольха", abash:"Абаш" }[config.wood] || "", "#C9933A"],
    ];
    if (config.salt)    legend.push(["Гим. соль", "#E8956A"]);
    if (config.juniper) legend.push(["Можжевельник", "#4A8A30"]);
    if (config.light)   legend.push(["LED подсветка", "#FFD060"]);
    if (config.stoveEnabled) legend.push([config.stoveType==="wood"?"Дровяная печь":"Электрокаменка", "#A06040"]);

    legend.forEach(([label, color], i) => {
      const lx = 12, ly = 16 + i * 18;
      ctx.fillStyle = color;
      ctx.fillRect(lx, ly, 10, 10);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "10px Arial"; ctx.textAlign = "left";
      ctx.fillText(label, lx + 14, ly + 9);
    });

  }, [config, canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      width={860}
      height={520}
      className="w-full rounded-2xl"
      style={{ maxHeight: "520px", objectFit: "contain" }}
    />
  );
});

IsoCanvas.displayName = "IsoCanvas";
export default IsoCanvas;
