import { useState, useCallback } from "react";

export type WoodType = "lipa" | "olha" | "kedr" | "abash";
export type Direction = "horizontal" | "vertical";
export type StoveType = "wood" | "electric";
export type Corner = "front-left" | "front-right" | "back-left" | "back-right";
export type DoorWall = "front" | "left" | "right";
export type SaltWall = "back" | "left" | "right";
export type GiftItem = "ladle" | "hat" | "broom" | "towel" | "aroma-set" | "thermometer";

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
  saltWall: SaltWall;          // стена для соли — выбор пользователя
  saltPanelWidth: number;
  saltPanelHeight: number;
  juniper: boolean;
  juniperPanelWidth: number;
  juniperPanelDepth: number;
  light: boolean;

  // Печь
  stoveEnabled: boolean;
  stoveType: StoveType;
  stoveCorner: Corner;

  // Дверь
  doorWall: DoorWall;

  // Лавки
  benches: boolean;

  // Подарки
  gifts: GiftItem[];
}

export const DEFAULT_CONFIG: RoomConfig = {
  width: 2.4,
  depth: 3.0,
  height: 2.2,
  wood: "lipa",
  direction: "horizontal",
  salt: false,
  saltWall: "back",
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
  gifts: [],
};

export function getAutoPlacement(config: RoomConfig): {
  saltWall: SaltWall | null;
  juniperCeiling: boolean;
} {
  const saltWall = config.salt ? config.saltWall : null;
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
