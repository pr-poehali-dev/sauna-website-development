import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import type { RoomConfig } from "./useRoomConfig";
import { getAutoPlacement } from "./useRoomConfig";

const WOOD_COLORS: Record<string, { light: string; mid: string; dark: string; grain: string }> = {
  lipa:  { light: "#F2E4BE", mid: "#DDC88C", dark: "#C8AC60", grain: "#B49840" },
  olha:  { light: "#D8A870", mid: "#BC8048", dark: "#9C6028", grain: "#7C4818" },
  abash: { light: "#F8EED2", mid: "#E4D4A8", dark: "#D0BA7C", grain: "#BCA058" },
};

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function poly(ctx: CanvasRenderingContext2D, pts: [number,number][], fill: string, stroke?: string, lw = 1) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}

function quadLerp(
  tl: [number,number], tr: [number,number],
  bl: [number,number], br: [number,number],
  s: number, t: number
): [number,number] {
  return [
    lerp(lerp(tl[0], tr[0], s), lerp(bl[0], br[0], s), t),
    lerp(lerp(tl[1], tr[1], s), lerp(bl[1], br[1], s), t),
  ];
}

function rng(seed: number) {
  const x = Math.sin(seed + 1) * 43758.5453;
  return x - Math.floor(x);
}

// ─────────────────────────────────────────────
//  Текстура вагонки
// ─────────────────────────────────────────────
function drawWoodWall(
  ctx: CanvasRenderingContext2D,
  pts: [number,number][],
  wood: string,
  dir: "h" | "v",
  seed: number,
  brightness = 1
) {
  const [tl, tr, br, bl] = pts;
  const W = WOOD_COLORS[wood] || WOOD_COLORS.lipa;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(tl[0], tl[1]); ctx.lineTo(tr[0], tr[1]);
  ctx.lineTo(br[0], br[1]); ctx.lineTo(bl[0], bl[1]);
  ctx.closePath(); ctx.clip();

  const N = 28;
  for (let i = 0; i < N; i++) {
    const t0 = i / N, t1 = (i + 1) / N;
    let p0a: [number,number], p0b: [number,number], p1a: [number,number], p1b: [number,number];
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

    const phase = (i + seed) % 4;
    const baseColors = [W.light, W.mid, W.dark, W.mid];
    ctx.globalAlpha = brightness;
    poly(ctx, [p0a, p0b, p1b, p1a], baseColors[phase]);

    const shadow = 0.04;
    const sa: [number,number] = [lerp(p1a[0], p0a[0], shadow), lerp(p1a[1], p0a[1], shadow)];
    const sb: [number,number] = [lerp(p1b[0], p0b[0], shadow), lerp(p1b[1], p0b[1], shadow)];
    poly(ctx, [sa, sb, p1b, p1a], "rgba(0,0,0,0.22)");

    ctx.save();
    ctx.strokeStyle = W.grain; ctx.lineWidth = 0.5; ctx.globalAlpha = brightness * 0.12;
    for (let g = 0; g < 2; g++) {
      const gt = rng(seed * 100 + i * 7 + g * 13);
      const gA: [number,number] = [lerp(p0a[0], p0b[0], gt), lerp(p0a[1], p0b[1], gt)];
      const gB: [number,number] = [lerp(p1a[0], p1b[0], gt), lerp(p1a[1], p1b[1], gt)];
      ctx.beginPath();
      ctx.moveTo(gA[0], gA[1]);
      ctx.bezierCurveTo(
        lerp(gA[0], gB[0], 0.3) + (rng(seed+i*3+g)*8-4),
        lerp(gA[1], gB[1], 0.3) + (rng(seed+i*3+g+1)*4-2),
        lerp(gA[0], gB[0], 0.7) + (rng(seed+i*3+g+2)*8-4),
        lerp(gA[1], gB[1], 0.7) + (rng(seed+i*3+g+3)*4-2),
        gB[0], gB[1]
      );
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ─────────────────────────────────────────────
//  Гималайская соль — панно с настраиваемым размером
// ─────────────────────────────────────────────
function drawSaltPanel(
  ctx: CanvasRenderingContext2D,
  pts: [number,number][],   // полные координаты стены (4 угла: tl,tr,br,bl)
  panelW: number,           // ширина панно (0..1 от стены)
  panelH: number            // высота панно (0..1 от стены)
) {
  const [tl, tr, br, bl] = pts;
  // Центрируем панно на стене, прижимаем к низу (уровень пола + отступ)
  const pw = Math.min(panelW, 0.98);
  const ph = Math.min(panelH, 0.98);
  const sL = (1 - pw) / 2, sR = sL + pw;
  const tTop = 1 - ph - 0.04;   // отступ снизу 4%
  const tBot = 1 - 0.04;

  const ptl = quadLerp(tl,tr,bl,br, sL, tTop);
  const ptr2 = quadLerp(tl,tr,bl,br, sR, tTop);
  const pbr = quadLerp(tl,tr,bl,br, sR, tBot);
  const pbl = quadLerp(tl,tr,bl,br, sL, tBot);
  const panelPts: [number,number][] = [ptl, ptr2, pbr, pbl];

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(ptl[0],ptl[1]); ctx.lineTo(ptr2[0],ptr2[1]);
  ctx.lineTo(pbr[0],pbr[1]); ctx.lineTo(pbl[0],pbl[1]);
  ctx.closePath(); ctx.clip();

  const rows = 12, cols = 7;
  for (let row = 0; row < rows; row++) {
    const t0 = row / rows, t1 = (row+1) / rows;
    const offset = (row % 2) * (0.5 / cols);
    for (let col = 0; col < cols + 1; col++) {
      const s0 = col / cols - offset, s1 = (col+1) / cols - offset;
      const g = 0.04;
      const c00 = quadLerp(ptl,ptr2,pbl,pbr, s0+g, t0+g);
      const c10 = quadLerp(ptl,ptr2,pbl,pbr, s1-g, t0+g);
      const c11 = quadLerp(ptl,ptr2,pbl,pbr, s1-g, t1-g);
      const c01 = quadLerp(ptl,ptr2,pbl,pbr, s0+g, t1-g);
      const hue = lerp(12, 28, rng(row*53+col*17));
      const sat = lerp(55, 80, rng(row*31+col*97));
      const lit = lerp(48, 70, rng(row*7+col*11));
      poly(ctx, [c00,c10,c11,c01], `hsl(${hue},${sat}%,${lit}%)`);
      const cx2 = (c00[0]+c10[0]+c11[0]+c01[0])/4;
      const cy2 = (c00[1]+c10[1]+c11[1]+c01[1])/4;
      const bw = Math.hypot(c10[0]-c00[0], c10[1]-c00[1]);
      const bh = Math.hypot(c01[1]-c00[1], c01[0]-c00[0]);
      for (let k = 0; k < 5; k++) {
        const kx = cx2 + (rng(row*5+col*3+k*7)-0.5)*bw*0.7;
        const ky = cy2 + (rng(row*5+col*3+k*7+1)-0.5)*bh*0.7;
        const kr = 0.5 + rng(k*11+row)*1.5;
        ctx.beginPath(); ctx.arc(kx,ky,kr,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,230,200,${0.25+rng(k*3)*0.5})`; ctx.fill();
      }
      poly(ctx,[c00,c10,c11,c01],"transparent","rgba(100,40,10,0.35)",0.7);
    }
  }
  ctx.restore();

  // Рамка панно
  ctx.save();
  ctx.strokeStyle = "rgba(201,147,58,0.7)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(panelPts[0][0], panelPts[0][1]);
  panelPts.forEach(p => ctx.lineTo(p[0], p[1]));
  ctx.closePath(); ctx.stroke();
  ctx.restore();
}

// Для обратной совместимости (плоские виды)
function drawSaltWall(ctx: CanvasRenderingContext2D, pts: [number,number][], panelW = 1.0, panelH = 1.0) {
  drawSaltPanel(ctx, pts, panelW, panelH);
}

// ─────────────────────────────────────────────
//  МОЖЖЕВЕЛЬНИК — панно на потолке
// ─────────────────────────────────────────────
function drawJuniperCeiling(
  ctx: CanvasRenderingContext2D,
  ceilPts: [number,number][],  // tl,tr,br,bl потолка
  panelW: number,              // ширина панно (0..1 от потолка)
  panelD: number,              // глубина панно (0..1 от потолка)
  seed: number
) {
  const [tl, tr, br, bl] = ceilPts;
  // Центрируем панно на потолке
  const pw = Math.min(panelW, 0.98);
  const pd = Math.min(panelD, 0.98);
  const sL = (1 - pw) / 2, sR = sL + pw;
  const tF = (1 - pd) / 2, tB = tF + pd;

  const ptl = quadLerp(tl,tr,bl,br, sL, tF);
  const ptr2 = quadLerp(tl,tr,bl,br, sR, tF);
  const pbr = quadLerp(tl,tr,bl,br, sR, tB);
  const pbl = quadLerp(tl,tr,bl,br, sL, tB);
  const panelPts: [number,number][] = [ptl, ptr2, pbr, pbl];

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(ptl[0],ptl[1]); ctx.lineTo(ptr2[0],ptr2[1]);
  ctx.lineTo(pbr[0],pbr[1]); ctx.lineTo(pbl[0],pbl[1]);
  ctx.closePath(); ctx.clip();

  poly(ctx, panelPts, "#1C1008");

  const faceW = Math.hypot(ptr2[0]-ptl[0], ptr2[1]-ptl[1]);
  const faceH = Math.hypot(pbl[0]-ptl[0], pbl[1]-ptl[1]);
  const minR = faceW * 0.04;
  const maxR = faceW * 0.09;
  const gridStep = minR * 2.2;
  const cols = Math.ceil(faceW / gridStep) + 2;
  const rows2 = Math.ceil(faceH / gridStep) + 2;

  for (let row = 0; row < rows2; row++) {
    for (let col = 0; col < cols; col++) {
      const idx = row * cols + col;
      const jx = rng(seed*7+idx*13)*0.6-0.3;
      const jy = rng(seed*11+idx*17)*0.6-0.3;
      const offsetRow = (row%2)*0.5;
      const s = (col+offsetRow+jx)/(cols-1);
      const t = (row+jy)/(rows2-1);
      const center = quadLerp(ptl,ptr2,pbl,pbr,s,t);
      const r = minR + rng(seed*3+idx*19)*(maxR-minR);
      const ry = r * 0.52;
      drawJuniperSlice(ctx,center[0],center[1],r,ry,seed+idx);
    }
  }

  // Виньетка
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(ptl[0],ptl[1]); ctx.lineTo(ptr2[0],ptr2[1]);
  ctx.lineTo(pbr[0],pbr[1]); ctx.lineTo(pbl[0],pbl[1]);
  ctx.closePath(); ctx.clip();
  const eg = ctx.createLinearGradient(ptl[0],ptl[1],pbl[0],pbl[1]);
  eg.addColorStop(0,"rgba(0,0,0,0.35)"); eg.addColorStop(0.1,"rgba(0,0,0,0)");
  eg.addColorStop(0.9,"rgba(0,0,0,0)"); eg.addColorStop(1,"rgba(0,0,0,0.25)");
  ctx.fillStyle=eg; ctx.fill();
  ctx.restore();

  // Рамка панно
  ctx.save();
  ctx.strokeStyle = "rgba(100,160,80,0.7)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4,3]);
  ctx.beginPath();
  ctx.moveTo(panelPts[0][0], panelPts[0][1]);
  panelPts.forEach(p => ctx.lineTo(p[0], p[1]));
  ctx.closePath(); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawJuniperSlice(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, seed: number) {
  ctx.save();
  ctx.beginPath(); ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);
  ctx.fillStyle="#3A2A10"; ctx.fill();
  ctx.strokeStyle="#2A1A08"; ctx.lineWidth=rx*0.12; ctx.stroke();
  ctx.strokeStyle="#4A3A18"; ctx.lineWidth=rx*0.06; ctx.stroke();

  ctx.beginPath(); ctx.ellipse(cx,cy,rx*0.88,ry*0.88,0,0,Math.PI*2);
  ctx.fillStyle="#C8A860"; ctx.fill();

  const rings = 4+Math.floor(rng(seed)*5);
  for (let r=rings; r>=1; r--) {
    const t=r/rings, age=1-t;
    const h=lerp(38,20,age), s=lerp(60,45,age), l=lerp(62,22,age);
    ctx.beginPath(); ctx.ellipse(cx,cy,rx*0.87*t,ry*0.87*t,0,0,Math.PI*2);
    ctx.fillStyle=`hsl(${h},${s}%,${l}%)`; ctx.fill();
    ctx.strokeStyle=`rgba(0,0,0,${0.15+age*0.1})`; ctx.lineWidth=0.5; ctx.stroke();
  }

  ctx.beginPath(); ctx.ellipse(cx,cy,rx*0.1,ry*0.1,0,0,Math.PI*2);
  ctx.fillStyle="#1A0C04"; ctx.fill();

  ctx.save();
  ctx.beginPath(); ctx.ellipse(cx,cy,rx*0.87,ry*0.87,0,0,Math.PI*2); ctx.clip();
  const rayCount=4+Math.floor(rng(seed*3)*4);
  for (let r=0; r<rayCount; r++) {
    const angle=(r/rayCount)*Math.PI*2+rng(seed*5+r)*0.3;
    ctx.beginPath(); ctx.moveTo(cx,cy);
    ctx.lineTo(cx+Math.cos(angle)*rx*0.85,cy+Math.sin(angle)*ry*0.85);
    ctx.strokeStyle=`rgba(220,190,120,${0.07+rng(seed+r)*0.08})`;
    ctx.lineWidth=0.4+rng(seed*2+r)*0.6; ctx.stroke();
  }
  ctx.restore();

  const crackCount=Math.floor(rng(seed*7)*3);
  for (let c=0; c<crackCount; c++) {
    const angle=rng(seed*11+c*17)*Math.PI*2;
    const len=0.3+rng(seed*13+c)*0.5;
    ctx.beginPath(); ctx.moveTo(cx,cy);
    ctx.lineTo(cx+Math.cos(angle)*rx*len,cy+Math.sin(angle)*ry*len);
    ctx.strokeStyle="rgba(20,8,0,0.4)"; ctx.lineWidth=0.5; ctx.stroke();
  }

  const sx=cx-rx*0.25, sy=cy-ry*0.3;
  const shine=ctx.createRadialGradient(sx,sy,0,sx,sy,rx*0.5);
  shine.addColorStop(0,"rgba(255,240,180,0.18)"); shine.addColorStop(1,"rgba(255,240,180,0)");
  ctx.beginPath(); ctx.ellipse(cx,cy,rx*0.87,ry*0.87,0,0,Math.PI*2);
  ctx.fillStyle=shine; ctx.fill();
  ctx.restore();
}

// ─────────────────────────────────────────────
//  LED подсветка
// ─────────────────────────────────────────────
function drawLED(ctx: CanvasRenderingContext2D, pts: [number,number][]) {
  const [,,br,bl]=pts;
  ctx.save();
  const grd=ctx.createLinearGradient((bl[0]+br[0])/2,Math.min(bl[1],br[1])-60,(bl[0]+br[0])/2,Math.max(bl[1],br[1]));
  grd.addColorStop(0,"rgba(255,140,20,0)"); grd.addColorStop(0.5,"rgba(255,140,20,0.15)"); grd.addColorStop(1,"rgba(255,200,50,0.5)");
  ctx.beginPath(); ctx.moveTo(bl[0],bl[1]); ctx.lineTo(br[0],br[1]); ctx.lineTo(br[0],br[1]-60); ctx.lineTo(bl[0],bl[1]-60);
  ctx.closePath(); ctx.fillStyle=grd; ctx.fill();
  ctx.beginPath(); ctx.moveTo(bl[0],bl[1]-2); ctx.lineTo(br[0],br[1]-2);
  ctx.strokeStyle="#FFE060"; ctx.lineWidth=2; ctx.stroke();
  for (let i=0; i<=8; i++) {
    const t=i/8;
    const px=lerp(bl[0],br[0],t), py=lerp(bl[1],br[1],t)-2;
    const sg=ctx.createRadialGradient(px,py,0,px,py,18);
    sg.addColorStop(0,"rgba(255,220,60,0.6)"); sg.addColorStop(1,"rgba(255,220,60,0)");
    ctx.beginPath(); ctx.arc(px,py,18,0,Math.PI*2); ctx.fillStyle=sg; ctx.fill();
  }
  ctx.restore();
}

// ─────────────────────────────────────────────
//  Печь
// ─────────────────────────────────────────────
function drawStove(
  ctx: CanvasRenderingContext2D,
  corner: string, stoveType: string,
  isoX: (x:number,z:number)=>number,
  isoY: (x:number,z:number,y:number)=>number,
  W: number, D: number, H: number
) {
  const sz=0.6, sh=0.9;
  let ox=0.15, oz=0.15;
  if (corner==="front-right") { ox=W-sz-0.15; oz=0.15; }
  if (corner==="back-left")   { ox=0.15;       oz=D-sz-0.15; }
  if (corner==="back-right")  { ox=W-sz-0.15;  oz=D-sz-0.15; }
  const v=(x:number,z:number,y:number):[number,number]=>[isoX(x,z),isoY(x,z,y)];
  const metal=stoveType==="wood"?["#6A3820","#4A2810","#7A5040"]:["#484848","#303030","#585858"];
  const faces=[
    [v(ox,oz,sh),v(ox+sz,oz,sh),v(ox+sz,oz,0),v(ox,oz,0)],
    [v(ox+sz,oz,sh),v(ox+sz,oz+sz,sh),v(ox+sz,oz+sz,0),v(ox+sz,oz,0)],
    [v(ox,oz,sh),v(ox+sz,oz,sh),v(ox+sz,oz+sz,sh),v(ox,oz+sz,sh)],
  ];
  faces.forEach((f,fi)=>poly(ctx,f as [number,number][],metal[fi],"rgba(0,0,0,0.3)",1));
  if (stoveType==="wood") {
    const d=[v(ox+0.1,oz,sh*0.55),v(ox+sz-0.1,oz,sh*0.55),v(ox+sz-0.1,oz,sh*0.1),v(ox+0.1,oz,sh*0.1)];
    poly(ctx,d as [number,number][],"#2A1208","rgba(201,147,58,0.5)",1);
    const fc=v(ox+sz/2,oz,sh*0.3);
    const fg=ctx.createRadialGradient(fc[0],fc[1],0,fc[0],fc[1],9);
    fg.addColorStop(0,"rgba(255,200,50,0.8)"); fg.addColorStop(1,"rgba(255,80,0,0)");
    ctx.beginPath(); ctx.arc(fc[0],fc[1],9,0,Math.PI*2); ctx.fillStyle=fg; ctx.fill();
    const tp0=v(ox+sz/2-0.07,oz+0.08,sh), tp1=v(ox+sz/2+0.07,oz+0.08,sh);
    const ph=isoY(ox+sz/2,oz+0.08,sh+H*0.4)-isoY(ox+sz/2,oz+0.08,sh);
    ctx.beginPath(); ctx.moveTo(tp0[0],tp0[1]); ctx.lineTo(tp1[0],tp1[1]);
    ctx.lineTo(tp1[0],tp1[1]+ph); ctx.lineTo(tp0[0],tp0[1]+ph);
    ctx.closePath(); ctx.fillStyle="#3A2010"; ctx.fill();
    ctx.strokeStyle="rgba(0,0,0,0.4)"; ctx.lineWidth=0.5; ctx.stroke();
  } else {
    const panel=[v(ox,oz,sh),v(ox+sz,oz,sh),v(ox+sz,oz,sh*0.75),v(ox,oz,sh*0.75)];
    poly(ctx,panel as [number,number][],"#222","rgba(0,0,0,0.3)",0.5);
    for(let k=0;k<3;k++){
      const tp=v(ox+sz*(0.25+k*0.25),oz,sh*0.87);
      ctx.beginPath(); ctx.arc(tp[0],tp[1],2.5,0,Math.PI*2);
      ctx.fillStyle=k===1?"#FF3030":"#30FF50"; ctx.fill();
    }
  }
  const tf=faces[2] as [number,number][];
  for(let k=0;k<9;k++){
    const ks=0.15+rng(k*7)*0.7, kt=0.15+rng(k*11)*0.7;
    const kc=quadLerp(tf[0],tf[1],tf[3],tf[2],ks,kt);
    const kr=2.5+rng(k*5)*3;
    ctx.beginPath(); ctx.ellipse(kc[0],kc[1],kr,kr*0.55,0,0,Math.PI*2);
    ctx.fillStyle=`hsl(20,12%,${28+k*3}%)`; ctx.fill();
    ctx.strokeStyle="rgba(0,0,0,0.35)"; ctx.lineWidth=0.4; ctx.stroke();
  }
  const lbl=v(ox+sz/2,oz+sz/2,0);
  ctx.fillStyle="rgba(255,255,255,0.75)"; ctx.font="bold 9px Arial"; ctx.textAlign="center";
  ctx.fillText(stoveType==="wood"?"🔥 Дровяная":"⚡ Электро",lbl[0],lbl[1]+14);
}

// ─────────────────────────────────────────────
//  Дверь — стеклянная прозрачная
// ─────────────────────────────────────────────
function drawDoor(
  ctx: CanvasRenderingContext2D,
  wall: string,
  isoX: (x:number,z:number)=>number,
  isoY: (x:number,z:number,y:number)=>number,
  W: number, D: number
) {
  const dw=0.75, dh=1.95, e=0.03;
  const v=(x:number,z:number,y:number):[number,number]=>[isoX(x,z),isoY(x,z,y)];
  let face:[number,number,number][];
  if (wall==="front")     face=[[W/2-dw/2,e,0],[W/2+dw/2,e,0],[W/2+dw/2,e,dh],[W/2-dw/2,e,dh]];
  else if (wall==="left") face=[[e,D/2-dw/2,0],[e,D/2+dw/2,0],[e,D/2+dw/2,dh],[e,D/2-dw/2,dh]];
  else                    face=[[W-e,D/2-dw/2,0],[W-e,D/2+dw/2,0],[W-e,D/2+dw/2,dh],[W-e,D/2-dw/2,dh]];
  const f=face.map(([x,z,y])=>v(x,z,y)) as [number,number][];

  // Рамка двери (тонкий металл/алюминий)
  poly(ctx,f,"transparent","rgba(180,200,220,0.85)",2.5);

  // Стекло — полупрозрачное синеватое
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(f[0][0],f[0][1]);
  f.forEach(p=>ctx.lineTo(p[0],p[1]));
  ctx.closePath();
  ctx.fillStyle="rgba(140,190,220,0.18)"; ctx.fill();

  // Блик на стекле — диагональная полоса
  const gx0=lerp(f[0][0],f[1][0],0.15), gy0=lerp(f[0][1],f[3][1],0.1);
  const gx1=lerp(f[0][0],f[1][0],0.45), gy1=lerp(f[0][1],f[3][1],0.55);
  const glassShine=ctx.createLinearGradient(gx0,gy0,gx1,gy1);
  glassShine.addColorStop(0,"rgba(255,255,255,0)");
  glassShine.addColorStop(0.4,"rgba(255,255,255,0.18)");
  glassShine.addColorStop(1,"rgba(255,255,255,0)");
  ctx.fillStyle=glassShine; ctx.fill();
  ctx.restore();

  // Импост — горизонтальный профиль посередине
  const midL=quadLerp(f[0],f[1],f[3],f[2],0,0.48);
  const midR=quadLerp(f[0],f[1],f[3],f[2],1,0.48);
  ctx.beginPath(); ctx.moveTo(midL[0],midL[1]); ctx.lineTo(midR[0],midR[1]);
  ctx.strokeStyle="rgba(180,200,220,0.7)"; ctx.lineWidth=1.5; ctx.stroke();

  // Ручка
  const handle=quadLerp(f[0],f[1],f[3],f[2],0.82,0.42);
  ctx.beginPath(); ctx.arc(handle[0],handle[1],3.5,0,Math.PI*2);
  ctx.fillStyle="#B0C8D8"; ctx.fill();
  ctx.strokeStyle="rgba(100,140,160,0.8)"; ctx.lineWidth=0.8; ctx.stroke();
}

// ─────────────────────────────────────────────
//  Лавки — верхний 70cm/90cm, нижний 100cm/45cm
// ─────────────────────────────────────────────
function drawBenches(
  ctx: CanvasRenderingContext2D,
  isoX: (x:number,z:number)=>number,
  isoY: (x:number,z:number,y:number)=>number,
  W: number, D: number, wood: string
) {
  const W2=WOOD_COLORS[wood]||WOOD_COLORS.lipa;
  const v=(x:number,z:number,y:number):[number,number]=>[isoX(x,z),isoY(x,z,y)];

  // Нижний полок: ширина 1.0м, высота 0.45м
  const lowerW = Math.min(1.0, W - 0.2);
  const lowerH = 0.45;
  const lowerDepth = 0.55;  // глубина сиденья
  const lowerX = (W - lowerW) / 2;

  // Верхний полок: ширина 0.70м, высота 0.90м (верхняя грань)
  const upperW = Math.min(0.70, W - 0.2);
  const upperH = 0.90;
  const upperDepth = 0.45;  // глубина сиденья
  const upperX = (W - upperW) / 2;
  const upperY0 = 0.48;  // нижняя кромка

  const drawBench=(x0:number,w:number,depth:number,y0:number,y1:number,stripes:number)=>{
    const z0=D-depth, z1=D;
    const faces:[number,number,number][][][]=[
      [[[x0,z0,y1],[x0+w,z0,y1],[x0+w,z1,y1],[x0,z1,y1]]],       // верх
      [[[x0,z0,y0],[x0+w,z0,y0],[x0+w,z0,y1],[x0,z0,y1]]],        // перед
      [[[x0+w,z0,y0],[x0+w,z1,y0],[x0+w,z1,y1],[x0+w,z0,y1]]],    // право
    ];
    const faceColors=[W2.mid,W2.dark,W2.light];
    faces.forEach((faceGroup,fi)=>{
      faceGroup.forEach(face=>{
        const pts=face.map(([fx,fz,fy])=>v(fx,fz,fy)) as [number,number][];
        poly(ctx,pts,faceColors[fi],"rgba(0,0,0,0.22)",0.7);
        if (fi===0) {
          for(let i=0;i<stripes;i++){
            const t0=i/stripes,t1=(i+1)/stripes;
            const p=[quadLerp(pts[0],pts[1],pts[3],pts[2],t0+0.01,0.05),
                     quadLerp(pts[0],pts[1],pts[3],pts[2],t1-0.01,0.05),
                     quadLerp(pts[0],pts[1],pts[3],pts[2],t1-0.01,0.95),
                     quadLerp(pts[0],pts[1],pts[3],pts[2],t0+0.01,0.95)] as [number,number][];
            poly(ctx,p,i%2===0?W2.light:W2.mid);
            poly(ctx,p,"transparent","rgba(0,0,0,0.12)",0.3);
          }
        }
      });
    });
    // Ноги
    [[x0+0.08,z0+0.06],[x0+w-0.08,z0+0.06],[x0+0.08,z1-0.08],[x0+w-0.08,z1-0.08]].forEach(([lx,lz])=>{
      const top=v(lx,lz,y0+0.02), bot=v(lx,lz,0);
      ctx.beginPath(); ctx.moveTo(top[0],top[1]); ctx.lineTo(bot[0],bot[1]);
      ctx.strokeStyle=W2.dark; ctx.lineWidth=3; ctx.stroke();
    });
  };

  drawBench(lowerX, lowerW, lowerDepth, 0, lowerH, 4);          // нижний: 100cm ширина, 45cm высота
  drawBench(upperX, upperW, upperDepth, upperY0, upperH, 3);     // верхний: 70cm ширина, 90cm высота
}

// ─────────────────────────────────────────────
//  Главная функция рендера
// ─────────────────────────────────────────────
export function renderRoom(
  ctx: CanvasRenderingContext2D,
  config: RoomConfig,
  cw: number, ch: number,
  view: "iso"|"front"|"back"|"left"|"right"|"top" = "iso"
) {
  ctx.clearRect(0,0,cw,ch);
  ctx.fillStyle="#0D0904"; ctx.fillRect(0,0,cw,ch);

  const { width: W, depth: D, height: H } = config;
  const { saltWall, juniperCeiling } = getAutoPlacement(config);
  const dir = config.direction==="horizontal"?"h":"v";

  if (view==="iso") {
    const scale=Math.min((cw*0.36)/(W*0.5+D*0.5),(ch*0.52)/(W*0.25+D*0.25+H*0.5));
    const ox2=cw*0.5, oy=ch*0.62;
    const isoX=(x:number,z:number)=>ox2+(x-z)*scale*0.5;
    const isoY=(x:number,z:number,y:number)=>oy-y*scale*0.82+(x+z)*scale*0.25;
    const v=(x:number,z:number,y:number):[number,number]=>[isoX(x,z),isoY(x,z,y)];

    // Пол
    const floor=[v(0,0,0),v(W,0,0),v(W,D,0),v(0,D,0)];
    const fg2=ctx.createLinearGradient(v(0,0,0)[0],v(0,0,0)[1],v(W,D,0)[0],v(W,D,0)[1]);
    fg2.addColorStop(0,"#2A1E10"); fg2.addColorStop(1,"#1A1208");
    poly(ctx,floor,fg2 as unknown as string,"rgba(201,147,58,0.15)",1);
    ctx.fillStyle=fg2; ctx.fill();
    const rows2=Math.ceil(D*5);
    for(let i=0;i<rows2;i++){
      const t0=i/rows2,t1=(i+1)/rows2;
      const Wc=WOOD_COLORS[config.wood]||WOOD_COLORS.lipa;
      const p=[v(0,t0*D,0),v(W,t0*D,0),v(W,t1*D,0),v(0,t1*D,0)];
      poly(ctx,p,i%2===0?Wc.dark+"99":Wc.mid+"88");
      poly(ctx,p,"transparent","rgba(0,0,0,0.1)",0.4);
    }

    // Потолок — сначала дерево
    const ceilPts:[number,number][]=[v(0,0,H),v(W,0,H),v(W,D,H),v(0,D,H)];
    drawWoodWall(ctx,ceilPts,config.wood,dir,13,0.55);
    // Можжевельник на потолке
    if(juniperCeiling) {
      const jw = Math.min(config.juniperPanelWidth / W, 0.95);
      const jd = Math.min(config.juniperPanelDepth / D, 0.95);
      drawJuniperCeiling(ctx, ceilPts, jw, jd, 7);
    }
    // Затемнение потолка сверху
    poly(ctx,ceilPts,"rgba(13,9,4,0.45)","rgba(201,147,58,0.12)",1);

    // Задняя стена
    { const pts:[number,number][]=[v(0,D,H),v(W,D,H),v(W,D,0),v(0,D,0)];
      drawWoodWall(ctx,pts,config.wood,dir,1,0.78);
      if(saltWall==="back") {
        const pw = Math.min(config.saltPanelWidth / W, 0.95);
        const ph = Math.min(config.saltPanelHeight / H, 0.95);
        drawSaltPanel(ctx,pts,pw,ph);
      }
      if(config.light) drawLED(ctx,pts);
      poly(ctx,pts,"transparent","rgba(0,0,0,0.2)",1.5); }

    // Левая стена
    { const pts:[number,number][]=[v(0,0,H),v(0,D,H),v(0,D,0),v(0,0,0)];
      drawWoodWall(ctx,pts,config.wood,dir,3,0.65);
      if(saltWall==="left") {
        const pw = Math.min(config.saltPanelWidth / D, 0.95);
        const ph = Math.min(config.saltPanelHeight / H, 0.95);
        drawSaltPanel(ctx,pts,pw,ph);
      }
      if(config.light) drawLED(ctx,pts);
      poly(ctx,pts,"transparent","rgba(0,0,0,0.15)",1); }

    // Правая стена
    { const pts:[number,number][]=[v(W,0,H),v(W,D,H),v(W,D,0),v(W,0,0)];
      drawWoodWall(ctx,pts,config.wood,dir,7,0.88);
      if(saltWall==="right") {
        const pw = Math.min(config.saltPanelWidth / D, 0.95);
        const ph = Math.min(config.saltPanelHeight / H, 0.95);
        drawSaltPanel(ctx,pts,pw,ph);
      }
      if(config.light) drawLED(ctx,pts);
      poly(ctx,pts,"transparent","rgba(0,0,0,0.12)",1); }

    // Передняя (прозрачная)
    poly(ctx,[v(0,0,H),v(W,0,H),v(W,0,0),v(0,0,0)],"rgba(13,9,4,0.12)","rgba(201,147,58,0.08)",1);

    // Лавки
    if(config.benches) drawBenches(ctx,isoX,isoY,W,D,config.wood);

    // Печь и дверь
    if(config.stoveEnabled) drawStove(ctx,config.stoveCorner,config.stoveType,isoX,isoY,W,D,H);
    drawDoor(ctx,config.doorWall,isoX,isoY,W,D);

    // Рёбра
    ctx.strokeStyle="rgba(201,147,58,0.25)"; ctx.lineWidth=1; ctx.setLineDash([3,3]);
    [[v(0,0,0),v(W,0,0)],[v(0,0,0),v(0,D,0)],[v(0,0,0),v(0,0,H)]].forEach(([a,b])=>{
      ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.lineTo(b[0],b[1]); ctx.stroke();
    });
    ctx.setLineDash([]);

    // Подписи размеров
    ctx.fillStyle="rgba(201,147,58,0.8)"; ctx.font="11px Arial"; ctx.textAlign="center";
    const wm=v(W/2,0,0); ctx.fillText(`${W.toFixed(1)}м`,wm[0],wm[1]+16);
    const dm=v(0,D/2,0); ctx.fillText(`${D.toFixed(1)}м`,dm[0]-24,dm[1]+4);
    const hm=v(0,0,H/2); ctx.fillText(`${H.toFixed(1)}м`,hm[0]-20,hm[1]);

    // Легенда
    const legend:[string,string][]=[[ {lipa:"Липа",olha:"Ольха",abash:"Абаш"}[config.wood]||"","#C9933A"]];
    if(config.salt)         legend.push([`Гим. соль ${config.saltPanelWidth}×${config.saltPanelHeight}м`,"#E8906A"]);
    if(config.juniper)      legend.push([`Можжевельник на потолке ${config.juniperPanelWidth}×${config.juniperPanelDepth}м`,"#5A9A40"]);
    if(config.light)        legend.push(["LED подсветка","#FFD060"]);
    if(config.stoveEnabled) legend.push([config.stoveType==="wood"?"Дровяная печь":"Электрокаменка","#A06040"]);
    if(config.benches)      legend.push(["Полки: 70×90 / 100×45 см","#8A6030"]);
    legend.forEach(([label,color],i)=>{
      ctx.fillStyle=color; ctx.fillRect(12,16+i*18,10,10);
      ctx.fillStyle="rgba(255,255,255,0.75)"; ctx.font="10px Arial"; ctx.textAlign="left";
      ctx.fillText(label,26,16+i*18+9);
    });
  } else {
    renderFlatView(ctx,config,cw,ch,view);
  }
}

// ─────────────────────────────────────────────
//  Плоские виды для PDF
// ─────────────────────────────────────────────
function renderFlatView(
  ctx: CanvasRenderingContext2D,
  config: RoomConfig,
  cw: number, ch: number,
  view: "front"|"back"|"left"|"right"|"top"
) {
  const { width: W, depth: D, height: H } = config;
  const { saltWall } = getAutoPlacement(config);
  const dir=config.direction==="horizontal"?"h":"v";
  const pad=60;

  if (view==="top") {
    const sc=Math.min((cw-pad*2)/W,(ch-pad*2)/D);
    const offX=(cw-W*sc)/2, offZ=(ch-D*sc)/2;
    const toX=(x:number)=>offX+x*sc, toZ=(z:number)=>offZ+z*sc;

    ctx.fillStyle="#2A1E10"; ctx.fillRect(toX(0),toZ(0),W*sc,D*sc);

    if(config.benches){
      const Wc=WOOD_COLORS[config.wood]||WOOD_COLORS.lipa;
      // Нижний полок
      const lw=Math.min(1.0,W-0.2);
      const lx=(W-lw)/2;
      ctx.fillStyle=Wc.mid;
      ctx.fillRect(toX(lx),toZ(D-0.55),lw*sc,0.55*sc);
      ctx.strokeStyle="rgba(0,0,0,0.3)"; ctx.lineWidth=1;
      ctx.strokeRect(toX(lx),toZ(D-0.55),lw*sc,0.55*sc);
      // Верхний полок
      const uw=Math.min(0.70,W-0.2);
      const ux=(W-uw)/2;
      ctx.fillStyle=Wc.light;
      ctx.fillRect(toX(ux),toZ(D-0.45-0.45),uw*sc,0.45*sc);
      ctx.strokeStyle="rgba(0,0,0,0.3)"; ctx.lineWidth=1;
      ctx.strokeRect(toX(ux),toZ(D-0.45-0.45),uw*sc,0.45*sc);
    }

    if(config.stoveEnabled){
      let sx=0.15,sz2=0.15; const ss=0.6;
      if(config.stoveCorner==="front-right"){sx=W-ss-0.15;sz2=0.15;}
      if(config.stoveCorner==="back-left") {sx=0.15;sz2=D-ss-0.15;}
      if(config.stoveCorner==="back-right"){sx=W-ss-0.15;sz2=D-ss-0.15;}
      ctx.fillStyle="#5A3020"; ctx.fillRect(toX(sx),toZ(sz2),ss*sc,ss*sc);
      ctx.strokeStyle="#C9933A"; ctx.lineWidth=1; ctx.strokeRect(toX(sx),toZ(sz2),ss*sc,ss*sc);
      ctx.fillStyle="rgba(255,255,255,0.6)"; ctx.font="10px Arial"; ctx.textAlign="center";
      ctx.fillText("ПЕЧЬ",toX(sx+ss/2),toZ(sz2+ss/2)+4);
    }

    // Дверь
    ctx.strokeStyle="#B0C8D8"; ctx.lineWidth=5;
    if(config.doorWall==="front"){ctx.beginPath();ctx.moveTo(toX(W/2-0.375),toZ(0));ctx.lineTo(toX(W/2+0.375),toZ(0));ctx.stroke();}
    else if(config.doorWall==="left"){ctx.beginPath();ctx.moveTo(toX(0),toZ(D/2-0.375));ctx.lineTo(toX(0),toZ(D/2+0.375));ctx.stroke();}
    else{ctx.beginPath();ctx.moveTo(toX(W),toZ(D/2-0.375));ctx.lineTo(toX(W),toZ(D/2+0.375));ctx.stroke();}

    ctx.strokeStyle="#C9933A"; ctx.lineWidth=3; ctx.strokeRect(toX(0),toZ(0),W*sc,D*sc);

    drawDimLabel(ctx,toX(0),ch-30,toX(W),ch-30,`${W.toFixed(1)} м`,false);
    drawDimLabel(ctx,pad/2,toZ(0),pad/2,toZ(D),`${D.toFixed(1)} м`,true);
    drawViewTitle(ctx,"ВИД СВЕРХУ (ПЛАН)",cw);
    return;
  }

  const isHorizontal=(view==="front"||view==="back");
  const wallW=isHorizontal?W:D, wallH=H;
  const wallNames:{[k:string]:string}={front:"ПЕРЕДНЯЯ СТЕНА",back:"ЗАДНЯЯ СТЕНА",left:"ЛЕВАЯ СТЕНА",right:"ПРАВАЯ СТЕНА"};
  const hasSalt=(view==="back"&&saltWall==="back")||(view==="left"&&saltWall==="left")||(view==="right"&&saltWall==="right");

  const sc=Math.min((cw-pad*2)/wallW,(ch-pad*2)/wallH);
  const offX=(cw-wallW*sc)/2, offY=ch-pad-wallH*sc;
  const tl:[number,number]=[offX,offY], tr:[number,number]=[offX+wallW*sc,offY];
  const br:[number,number]=[offX+wallW*sc,offY+wallH*sc], bl:[number,number]=[offX,offY+wallH*sc];

  drawWoodWall(ctx,[tl,tr,br,bl],config.wood,dir,1,1);
  if(hasSalt) {
    const pw = Math.min(config.saltPanelWidth / wallW, 0.95);
    const ph = Math.min(config.saltPanelHeight / H, 0.95);
    drawSaltWall(ctx,[tl,tr,br,bl],pw,ph);
  }
  if(config.light) drawLED(ctx,[tl,tr,br,bl]);

  // Лавки
  if(config.benches&&view!=="front"){
    const Wc=WOOD_COLORS[config.wood]||WOOD_COLORS.lipa;
    const lowerH=0.45*sc, upperH=0.90*sc;
    ctx.fillStyle=Wc.mid;
    ctx.fillRect(offX+5, offY+wallH*sc-lowerH, wallW*sc-10, 0.06*sc);
    ctx.fillRect(offX+5, offY+wallH*sc-upperH, wallW*sc-10, 0.06*sc);
    ctx.strokeStyle="rgba(0,0,0,0.2)"; ctx.lineWidth=0.5;
    ctx.strokeRect(offX+5, offY+wallH*sc-lowerH, wallW*sc-10, 0.06*sc);
    ctx.strokeRect(offX+5, offY+wallH*sc-upperH, wallW*sc-10, 0.06*sc);
    // Подпись
    ctx.fillStyle="rgba(201,147,58,0.7)"; ctx.font="9px Arial"; ctx.textAlign="left";
    ctx.fillText("▸ 45 см",offX+wallW*sc+4,offY+wallH*sc-lowerH+4);
    ctx.fillText("▸ 90 см",offX+wallW*sc+4,offY+wallH*sc-upperH+4);
  }

  // Дверь на передней — стеклянная
  if(view==="front"&&config.doorWall==="front"){
    const dw2=0.75*sc,dh2=1.95*sc;
    const dx=offX+(wallW/2-0.375)*sc, dy=offY+wallH*sc-dh2;
    ctx.fillStyle="rgba(140,190,220,0.22)"; ctx.fillRect(dx,dy,dw2,dh2);
    ctx.strokeStyle="rgba(180,200,220,0.9)"; ctx.lineWidth=2; ctx.strokeRect(dx,dy,dw2,dh2);
    // Импост
    ctx.beginPath(); ctx.moveTo(dx,dy+dh2*0.48); ctx.lineTo(dx+dw2,dy+dh2*0.48);
    ctx.strokeStyle="rgba(180,200,220,0.6)"; ctx.lineWidth=1.2; ctx.stroke();
    ctx.beginPath(); ctx.arc(dx+dw2*0.85,dy+dh2*0.44,3.5,0,Math.PI*2);
    ctx.fillStyle="#B0C8D8"; ctx.fill();
  }

  ctx.strokeStyle="rgba(201,147,58,0.5)"; ctx.lineWidth=2;
  ctx.strokeRect(offX,offY,wallW*sc,wallH*sc);

  drawDimLabel(ctx,offX,ch-25,offX+wallW*sc,ch-25,`${wallW.toFixed(1)} м`,false);
  drawDimLabel(ctx,pad/2,offY,pad/2,offY+wallH*sc,`${wallH.toFixed(1)} м`,true);
  drawViewTitle(ctx,wallNames[view],cw);
}

function drawDimLabel(ctx: CanvasRenderingContext2D, x1:number,y1:number,x2:number,y2:number,label:string,vertical:boolean){
  ctx.strokeStyle="rgba(201,147,58,0.6)"; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  const angle=vertical?0:Math.PI/2;
  [[x1,y1],[x2,y2]].forEach(([x,y])=>{
    ctx.beginPath(); ctx.moveTo(x+Math.cos(angle)*5,y+Math.sin(angle)*5);
    ctx.lineTo(x-Math.cos(angle)*5,y-Math.sin(angle)*5); ctx.stroke();
  });
  ctx.fillStyle="rgba(201,147,58,0.9)"; ctx.font="bold 12px Arial";
  if(vertical){
    ctx.save(); ctx.translate((x1+x2)/2,(y1+y2)/2); ctx.rotate(-Math.PI/2);
    ctx.textAlign="center"; ctx.fillText(label,0,-6); ctx.restore();
  } else {
    ctx.textAlign="center"; ctx.fillText(label,(x1+x2)/2,y1-6);
  }
}

function drawViewTitle(ctx: CanvasRenderingContext2D, title:string, cw:number){
  ctx.fillStyle="rgba(201,147,58,0.9)"; ctx.font="bold 14px Arial"; ctx.textAlign="center";
  ctx.fillText(title,cw/2,30);
}

export interface IsoCanvasHandle {
  getViewDataURL: (view:"iso"|"front"|"back"|"left"|"right"|"top")=>string;
}

interface IsoCanvasProps { config: RoomConfig; }

const IsoCanvas = forwardRef<IsoCanvasHandle, IsoCanvasProps>(({ config }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useImperativeHandle(ref, () => ({
    getViewDataURL: (view) => {
      const tmp=document.createElement("canvas");
      tmp.width=860; tmp.height=520;
      const ctx2=tmp.getContext("2d");
      if(ctx2) renderRoom(ctx2,config,860,520,view);
      return tmp.toDataURL("image/png");
    },
  }));

  useEffect(()=>{
    const canvas=canvasRef.current;
    if(!canvas) return;
    const ctx2=canvas.getContext("2d");
    if(!ctx2) return;
    renderRoom(ctx2,config,canvas.width,canvas.height,"iso");
  },[config]);

  return (
    <canvas
      ref={canvasRef}
      width={860}
      height={520}
      className="w-full rounded-2xl"
      style={{ maxHeight:"520px", objectFit:"contain" }}
    />
  );
});

IsoCanvas.displayName="IsoCanvas";
export default IsoCanvas;
