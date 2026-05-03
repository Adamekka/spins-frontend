export type Money = string;

export type SpinType = "BASE" | "FREE_SPIN" | "PURCHASED_FREE_SPINS";

export type SymbolType = "REGULAR" | "SCATTER" | "MULTIPLIER";

export type ResultSource = "live" | "replay";

export type Player = {
  id: number;
  username: string;
  balance: Money;
};

export type SymbolConfig = {
  code: string;
  symbolType: SymbolType;
  payouts?: {
    low: Money;
    mid: Money;
    high: Money;
  };
};

export type Paytable = {
  id: number;
  name: string;
  reelCount: number;
  rowCount: number;
  symbols: SymbolConfig[];
};

export type GridCell = {
  code: string;
  multiplierValue?: number;
};

export type Tumble = {
  sequenceIndex: number;
  grid: GridCell[][];
  winAmount: Money;
  multiplierOnGrid: number;
};

export type SpinResponse = {
  spinId: number;
  spinType: SpinType;
  bet: Money;
  totalWin: Money;
  newBalance: Money;
  tumbles: Tumble[];
  freeSpinsTriggered?: boolean;
  freeSpinsAwarded?: number;
  accumulatedMultiplier?: number;
  remainingFreeSpins?: number;
  retriggered?: boolean;
  retriggerAwarded?: number;
  sessionComplete?: boolean;
};

export type BuyFreeSpinsResponse = {
  spinId: number;
  spinType: SpinType;
  cost: Money;
  newBalance: Money;
  freeSpinsAwarded: number;
  parentSpinId: number;
};

export type SpinHistoryItem = {
  id: number;
  spinType: SpinType;
  bet: Money;
  totalWin: Money;
  spunAt: string;
  tumbleCount: number;
};

export type SpinHistoryListResponse = {
  spins: SpinHistoryItem[];
};

export type SpinDetailResponse = {
  id: number;
  spinType: SpinType;
  bet: Money;
  totalWin: Money;
  spunAt: string;
  accumulatedMultiplier: number;
  remainingFreeSpins: number;
  parentSpinId?: number;
  tumbles: Tumble[];
};

export type GameResult = {
  id: number;
  spinType: SpinType;
  bet: Money;
  totalWin: Money;
  newBalance?: Money;
  spunAt?: string;
  parentSpinId?: number;
  tumbles: Tumble[];
  freeSpinsTriggered?: boolean;
  freeSpinsAwarded?: number;
  accumulatedMultiplier?: number;
  remainingFreeSpins?: number;
  retriggered?: boolean;
  retriggerAwarded?: number;
  sessionComplete?: boolean;
};

export type FreeSpinSession = {
  parentSpinId: number;
  source: "triggered" | "purchased";
  awarded: number;
  remainingFreeSpins: number;
  accumulatedMultiplier: number;
};

export type RenderCell = {
  id: string;
  cell: GridCell;
  rowIndex: number;
  columnIndex: number;
  state: "new" | "moved" | "static";
};
