import { useState, useCallback } from "react";

export type WoodType = "lipa" | "olha" | "abash";
export type Direction = "horizontal" | "vertical";
export type StoveType = "wood" | "electric";
export type Corner = "front-left" | "front-right" | "back-left" | "back-right";
export type DoorWall = "front" | "left" | "right";

export interface RoomConfig {
  // Размеры (метры)
  width: number;   // левая-правая
  depth: number;   // передняя-задняя
  height: number;  // высота

  // Материалы (применяются ко всем стенам)
  wood: WoodType;
  direction: Direction;

  // Добавки
  salt: boolean;
  juniper: boolean;
  light: boolean;

  // Печь
  stoveEnabled: boolean;
  stoveType: StoveType;
  stoveCorner: Corner;

  // Дверь
  doorWall: DoorWall;
}

export const DEFAULT_CONFIG: RoomConfig = {
  width: 2.4,
  depth: 3.0,
  height: 2.2,
  wood: "lipa",
  direction: "horizontal",
  salt: false,
  juniper: false,
  light: false,
  stoveEnabled: false,
  stoveType: "wood",
  stoveCorner: "back-right",
  doorWall: "front",
};

// Авто-размещение соли и можжевельника
export function getAutoPlacement(config: RoomConfig): {
  saltWall: "back" | "left" | "right" | null;
  juniperWalls: Array<"back" | "left" | "right">;
} {
  // Соль — на самую длинную стену напротив входа (задняя)
  // но не туда, где печь
  const stoveBack = config.stoveCorner.startsWith("back");
  const saltWall = config.salt
    ? stoveBack ? "left" : "back"
    : null;

  // Можжевельник — на боковые стены (не там где дверь и не где соль)
  const juniperWalls: Array<"back" | "left" | "right"> = [];
  if (config.juniper) {
    if (config.doorWall !== "left" && saltWall !== "left") juniperWalls.push("left");
    if (config.doorWall !== "right" && saltWall !== "right") juniperWalls.push("right");
    if (juniperWalls.length === 0 && saltWall !== "back") juniperWalls.push("back");
  }

  return { saltWall, juniperWalls };
}

export function useRoomConfig() {
  const [config, setConfig] = useState<RoomConfig>(DEFAULT_CONFIG);
  const [setupDone, setSetupDone] = useState(false);

  const update = useCallback((patch: Partial<RoomConfig>) => {
    setConfig(prev => ({ ...prev, ...patch }));
  }, []);

  return { config, update, setupDone, setSetupDone };
}
