import type { GridCell, SymbolConfig } from "./types";

export const SYMBOL_META: Record<
  string,
  { label: string; name: string; asset: string }
> = {
  CROWN: { label: "CR", name: "Crown", asset: "/symbols/crown.svg" },
  RING: { label: "RG", name: "Ring", asset: "/symbols/ring.svg" },
  CUP: { label: "CP", name: "Cup", asset: "/symbols/cup.svg" },
  HOURGLASS: {
    label: "HG",
    name: "Hourglass",
    asset: "/symbols/hourglass.svg",
  },
  GEM_BLUE: { label: "BL", name: "Blue Gem", asset: "/symbols/gem-blue.svg" },
  GEM_GREEN: {
    label: "GN",
    name: "Green Gem",
    asset: "/symbols/gem-green.svg",
  },
  GEM_PURPLE: {
    label: "PR",
    name: "Purple Gem",
    asset: "/symbols/gem-purple.svg",
  },
  GEM_YELLOW: {
    label: "YL",
    name: "Yellow Gem",
    asset: "/symbols/gem-yellow.svg",
  },
  SCATTER: { label: "SC", name: "Scatter", asset: "/symbols/scatter.svg" },
  MULTIPLIER: {
    label: "MX",
    name: "Multiplier",
    asset: "/symbols/multiplier.svg",
  },
};

export function symbolLabel(cell: GridCell) {
  if (cell.code === "MULTIPLIER") {
    return `${cell.multiplierValue ?? 0}x`;
  }

  return SYMBOL_META[cell.code]?.label ?? cell.code.slice(0, 3);
}

export function symbolName(cell: GridCell | SymbolConfig) {
  return SYMBOL_META[cell.code]?.name ?? cell.code.replaceAll("_", " ");
}

export function symbolSignature(cell: GridCell) {
  return `${cell.code}:${cell.multiplierValue ?? ""}`;
}

export function symbolAsset(code: string) {
  return SYMBOL_META[code]?.asset ?? "/symbols/scatter.svg";
}

export function symbolClass(code: string) {
  return `symbol-${code.toLowerCase().replaceAll("_", "-")}`;
}
