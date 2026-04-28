import { useState, useCallback } from "react";

export type WoodType = "lipa" | "olha" | "abash";
export type Direction = "horizontal" | "vertical";
export type StoveType = "wood" | "electric";
export type Corner = "front-left" | "front-right" | "back-left" | "back-right";
export type DoorWall = "front" | "left" | "right";

export interface RoomConfig {
  // Размеры (метры)
  width: number;
  depth: number;
  height: number;

  // Материалы
  wood: WoodType;
  direction: Direction;

  // Добавки
  salt: boolean;
  saltPanelWidth: number;   // ширина панно соли, метры
  saltPanelHeight: number;  // высота панно соли, метры
  juniper: boolean;
  juniperPanelWidth: number;  // ширина панно можжевельника на потолке, метры
  juniperPanelDepth: number;  // глубина панно можжевельника на потолке, метры
  light: boolean;

  // Печь
  stoveEnabled: boolean;
  stoveType: StoveType;
  stoveCorner: Corner;

  // Дверь
  doorWall: DoorWall;

  // Лавки
  benches: boolean;
}

export const DEFAULT_CONFIG: RoomConfig = {
  width: 2.4,
  depth: 3.0,
  height: 2.2,
  wood: "lipa",
  direction: "horizontal",
  salt: false,
  saltPanelWidth: 1.2,
  saltPanelHeight: 1.0,
  juniper: false,
  juniperPanelWidth: 1.0,
  juniperPanelDepth: 0.8,
  light: false,
  stoveEnabled: false,
  stoveType: "wood",
  stoveCorner: "back-right",
  doorWall: "front",
  benches: true,
};

// Авто-размещение соли (стена) и можжевельника (потолок)
export function getAutoPlacement(config: RoomConfig): {
  saltWall: "back" | "left" | "right" | null;
  juniperCeiling: boolean;
} {
  const stoveBack = config.stoveCorner.startsWith("back");
  const saltWall = config.salt
    ? stoveBack ? "left" : "back"
    : null;

  const juniperCeiling = config.juniper;

  return { saltWall, juniperCeiling };
}

export function useRoomConfig() {
  const [config, setConfig] = useState<RoomConfig>(DEFAULT_CONFIG);
  const [setupDone, setSetupDone] = useState(false);

  const update = useCallback((patch: Partial<RoomConfig>) => {
    setConfig(prev => ({ ...prev, ...patch }));
  }, []);

  return { config, update, setupDone, setSetupDone };
}
