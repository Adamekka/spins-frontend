<script lang="ts">
  import { flip } from "svelte/animate";
  import { formatMoney, formatSpinType } from "../format";
  import {
    symbolAsset,
    symbolClass,
    symbolLabel,
    symbolName,
  } from "../symbols";
  import type {
    GameResult,
    Money,
    RenderCell,
    ResultSource,
    Tumble,
  } from "../types";

  export let activeResult: GameResult | null;
  export let activeResultSource: ResultSource;
  export let displayedTumble: Tumble | null;
  export let displayedTumbleIndex: number;
  export let displayedRenderCells: RenderCell[];
  export let triggeredSymbols: Set<string>;
  export let displayedPayout: Money | null;
  export let gridColumnCount: number;
  export let placeholderRows: number;
  export let placeholderColumns: number;
  export let selectTumble: (index: number) => void;
</script>

<section class="machine-card" aria-labelledby="machine-title">
  <div class="machine-header">
    <div>
      <p class="eyebrow">
        {activeResultSource === "replay" ? "Previous spin" : "Latest spin"}
      </p>
      <h2 id="machine-title">
        {activeResult ? formatSpinType(activeResult.spinType) : "Ready to spin"}
      </h2>
    </div>

    <div class="win-display">
      <span>Total win</span>
      <strong>{formatMoney(activeResult?.totalWin)}</strong>
    </div>
  </div>

  {#if displayedTumble}
    <div class="reel-frame">
      <div
        class="slot-grid falling-grid"
        style={`--columns: ${gridColumnCount}`}
        aria-label="Current reels"
      >
        {#each displayedRenderCells as renderCell (renderCell.id)}
          <div
            animate:flip={{ duration: 430 }}
            class={`symbol-cell ${symbolClass(renderCell.cell.code)} ${renderCell.state === "new" ? "is-new" : ""} ${renderCell.state === "moved" ? "is-moved" : ""} ${triggeredSymbols.has(renderCell.cell.code) ? "is-triggered" : ""}`}
            style={`grid-row: ${renderCell.rowIndex + 1}; grid-column: ${renderCell.columnIndex + 1}; --fall-delay: ${renderCell.rowIndex * 54 + renderCell.columnIndex * 16}ms`}
            title={symbolName(renderCell.cell)}
          >
            <img
              src={symbolAsset(renderCell.cell.code)}
              alt={symbolName(renderCell.cell)}
              loading="eager"
            />
            {#if renderCell.cell.code === "MULTIPLIER"}
              <span class="multiplier-badge"
                >{symbolLabel(renderCell.cell)}</span
              >
            {/if}
          </div>
        {/each}
      </div>
      {#if displayedPayout}
        {#key `${activeResult?.id ?? "spin"}-${displayedTumble.sequenceIndex}-${displayedPayout}`}
          <div class="payout-burst" aria-live="polite">
            <span>Win</span>
            <strong>{formatMoney(displayedPayout)}</strong>
          </div>
        {/key}
      {/if}
    </div>
  {:else}
    <div class="reel-frame placeholder-frame">
      <div
        class="slot-grid placeholder-grid"
        style={`--columns: ${placeholderColumns}`}
        aria-hidden="true"
      >
        {#each Array(placeholderRows) as _row}
          {#each Array(placeholderColumns) as _column}
            <div class="symbol-cell placeholder-cell"><span>--</span></div>
          {/each}
        {/each}
      </div>
    </div>
  {/if}

  <div class="result-strip">
    <div>
      <span>Spin</span>
      <strong>{activeResult?.id ?? "--"}</strong>
    </div>
    <div>
      <span>Bet</span>
      <strong>{formatMoney(activeResult?.bet)}</strong>
    </div>
    <div>
      <span>Cascade win</span>
      <strong>{formatMoney(displayedTumble?.winAmount)}</strong>
    </div>
    <div>
      <span>Multiplier</span>
      <strong>{displayedTumble?.multiplierOnGrid ?? 0}x</strong>
    </div>
  </div>

  {#if activeResult?.tumbles.length}
    <div class="tumble-toolbar" aria-label="Cascade steps">
      <span
        >Drop {displayedTumbleIndex + 1} of {activeResult.tumbles.length}</span
      >
      <div class="tumble-buttons">
        {#each activeResult.tumbles as tumble, index}
          <button
            type="button"
            class:active={index === displayedTumbleIndex}
            onclick={() => selectTumble(index)}
          >
            {tumble.sequenceIndex + 1}
          </button>
        {/each}
      </div>
    </div>
  {/if}

  {#if activeResult?.freeSpinsTriggered}
    <div class="feature-callout">
      Free spins won: {activeResult.freeSpinsAwarded ?? 0}
    </div>
  {/if}

  {#if activeResult?.retriggered}
    <div class="feature-callout">
      Extra free spins: {activeResult.retriggerAwarded ?? 0}
    </div>
  {/if}
</section>
