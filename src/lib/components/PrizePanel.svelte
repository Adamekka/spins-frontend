<script lang="ts">
  import { formatMoney, formatSymbolType } from "../format";
  import { symbolAsset, symbolClass, symbolName } from "../symbols";
  import type { Paytable } from "../types";

  export let selectedPaytable: Paytable | null;
</script>

<section class="paytable-card" aria-labelledby="paytable-title">
  <div class="section-header">
    <div>
      <p class="eyebrow">Prizes</p>
      <h2 id="paytable-title">{selectedPaytable?.name ?? "Prize Details"}</h2>
    </div>
    <span
      >{selectedPaytable?.reelCount ?? 6}x{selectedPaytable?.rowCount ??
        5}</span
    >
  </div>

  {#if selectedPaytable}
    <div class="symbol-list">
      {#each selectedPaytable.symbols as symbol}
        <div class="symbol-row">
          <div class={`symbol-chip ${symbolClass(symbol.code)}`}>
            <img
              src={symbolAsset(symbol.code)}
              alt={symbolName(symbol)}
              loading="lazy"
            />
          </div>
          <div>
            <strong>{symbolName(symbol)}</strong>
            <small>{formatSymbolType(symbol.symbolType)}</small>
          </div>
          <div class="payouts">
            {#if symbol.payouts}
              <span>8-9: {formatMoney(symbol.payouts.low)}x</span>
              <span>10-11: {formatMoney(symbol.payouts.mid)}x</span>
              <span>12+: {formatMoney(symbol.payouts.high)}x</span>
            {:else}
              <span>Bonus feature symbol</span>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <p class="empty-state">Prize details will appear when the game is ready.</p>
  {/if}
</section>
