import type { Money, SpinType, SymbolType } from "./types";

export function formatMoney(value: Money | number | undefined) {
  if (value === undefined) {
    return "--";
  }

  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue.toFixed(2) : String(value);
}

export function formatSpinType(spinType: SpinType) {
  switch (spinType) {
    case "BASE":
      return "Paid Spin";
    case "FREE_SPIN":
      return "Free Spin";
    case "PURCHASED_FREE_SPINS":
      return "Bought Bonus";
  }
}

export function formatSymbolType(symbolType: SymbolType) {
  switch (symbolType) {
    case "MULTIPLIER":
      return "Multiplier";
    case "SCATTER":
      return "Free spins symbol";
    case "REGULAR":
      return "Paying symbol";
  }
}

export function formatDate(value: string) {
  return value.replace("T", " ");
}
