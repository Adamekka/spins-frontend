import { symbolSignature } from "./symbols";
import type {
  GameResult,
  Paytable,
  RenderCell,
  SpinDetailResponse,
  SpinResponse,
  Tumble,
} from "./types";

export function normalizeSpinResponse(response: SpinResponse): GameResult {
  return {
    id: response.spinId,
    spinType: response.spinType,
    bet: response.bet,
    totalWin: response.totalWin,
    newBalance: response.newBalance,
    tumbles: response.tumbles,
    freeSpinsTriggered: response.freeSpinsTriggered,
    freeSpinsAwarded: response.freeSpinsAwarded,
    accumulatedMultiplier: response.accumulatedMultiplier,
    remainingFreeSpins: response.remainingFreeSpins,
    retriggered: response.retriggered,
    retriggerAwarded: response.retriggerAwarded,
    sessionComplete: response.sessionComplete,
  };
}

export function normalizeSpinDetail(response: SpinDetailResponse): GameResult {
  return {
    id: response.id,
    spinType: response.spinType,
    bet: response.bet,
    totalWin: response.totalWin,
    spunAt: response.spunAt,
    parentSpinId: response.parentSpinId,
    tumbles: response.tumbles,
    accumulatedMultiplier: response.accumulatedMultiplier,
    remainingFreeSpins: response.remainingFreeSpins,
  };
}

export function buildRenderTumbles(result: GameResult) {
  const renderTumbles: RenderCell[][] = [];
  let previousCells: RenderCell[] = [];

  for (const [tumbleIndex, tumble] of result.tumbles.entries()) {
    const usedPreviousIds = new Set<string>();
    const renderCells: RenderCell[] = [];

    // Game result snapshots do not include per-symbol IDs, so identity is inferred by matching symbols bottom-up within each column.
    for (let rowIndex = tumble.grid.length - 1; rowIndex >= 0; rowIndex -= 1) {
      for (const [columnIndex, cell] of tumble.grid[rowIndex].entries()) {
        const signature = symbolSignature(cell);
        let matchedPrevious: RenderCell | undefined;

        if (tumbleIndex > 0) {
          matchedPrevious = previousCells
            .filter(
              (previousCell) =>
                !usedPreviousIds.has(previousCell.id) &&
                previousCell.columnIndex === columnIndex &&
                previousCell.rowIndex <= rowIndex &&
                symbolSignature(previousCell.cell) === signature,
            )
            .sort((a, b) => b.rowIndex - a.rowIndex)[0];
        }

        if (matchedPrevious) {
          usedPreviousIds.add(matchedPrevious.id);
          renderCells.push({
            id: matchedPrevious.id,
            cell,
            rowIndex,
            columnIndex,
            state: matchedPrevious.rowIndex === rowIndex ? "static" : "moved",
          });
        } else {
          renderCells.push({
            id: `${result.id}-${tumble.sequenceIndex}-${rowIndex}-${columnIndex}-${signature}`,
            cell,
            rowIndex,
            columnIndex,
            state: "new",
          });
        }
      }
    }

    renderCells.sort((a, b) => a.rowIndex - b.rowIndex || a.columnIndex - b.columnIndex);
    renderTumbles.push(renderCells);
    previousCells = renderCells;
  }

  return renderTumbles;
}

export function triggeredSymbolCodes(
  tumble: Tumble,
  result: GameResult,
  paytable: Paytable | null,
) {
  const counts = new Map<string, number>();
  const symbolTypes = new Map(
    paytable?.symbols.map((symbol) => [symbol.code, symbol.symbolType]) ?? [],
  );
  const triggered = new Set<string>();

  for (const row of tumble.grid) {
    for (const cell of row) {
      counts.set(cell.code, (counts.get(cell.code) ?? 0) + 1);
    }
  }

  for (const [code, count] of counts) {
    if (code === "SCATTER") {
      if (count >= (result.spinType === "FREE_SPIN" ? 3 : 4)) {
        triggered.add(code);
      }
      continue;
    }

    const symbolType = symbolTypes.get(code);
    if (
      code !== "MULTIPLIER" &&
      (symbolType === "REGULAR" || symbolType === undefined) &&
      count >= 8
    ) {
      triggered.add(code);
    }
  }

  const isFinalDrop =
    result.tumbles[result.tumbles.length - 1]?.sequenceIndex === tumble.sequenceIndex;
  if (isFinalDrop && tumble.multiplierOnGrid > 0 && Number(result.totalWin) > 0) {
    triggered.add("MULTIPLIER");
  }

  return triggered;
}
