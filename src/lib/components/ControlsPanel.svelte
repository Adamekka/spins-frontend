<script lang="ts">
  import { BET_OPTIONS } from "../constants";
  import type {
    BuyFreeSpinsResponse,
    FreeSpinSession,
    Paytable,
  } from "../types";

  export let paytables: Paytable[];
  export let selectedPaytableId: string;
  export let bet: string;
  export let isBetValid: boolean;
  export let canUseControls: boolean;
  export let canStartPaidSpin: boolean;
  export let hasActiveFreeSpinSession: boolean;
  export let freeSpinSession: FreeSpinSession | null;
  export let canPlayFreeSpin: boolean;
  export let lastPurchase: BuyFreeSpinsResponse | null;
  export let buyCostPreview: string;
  export let runBaseSpin: (event?: SubmitEvent) => void;
  export let buyFreeSpins: () => void;
  export let playFreeSpin: () => void;
  export let resetPlayer: () => void;
</script>

<aside class="control-card" aria-labelledby="controls-title">
  <h2 id="controls-title">Play</h2>

  <form class="spin-form" onsubmit={runBaseSpin}>
    <label>
      Game
      <select
        bind:value={selectedPaytableId}
        disabled={!canUseControls || paytables.length === 0}
      >
        {#each paytables as paytable}
          <option value={String(paytable.id)}>{paytable.name}</option>
        {/each}
      </select>
    </label>

    <label>
      Bet
      <input
        bind:value={bet}
        type="number"
        min="0.01"
        step="0.01"
        inputmode="decimal"
        disabled={!canUseControls}
      />
    </label>

    <div class="quick-bets" aria-label="Quick bets">
      {#each BET_OPTIONS as option}
        <button
          type="button"
          class:active={bet === option}
          disabled={!canUseControls}
          onclick={() => (bet = option)}>{option}</button
        >
      {/each}
    </div>

    {#if !isBetValid}
      <p class="field-error">Enter a bet above 0 with up to 2 decimals.</p>
    {/if}

    <button class="primary-action" type="submit" disabled={!canStartPaidSpin}>
      Spin
    </button>
    <button
      class="secondary-action"
      type="button"
      disabled={!canStartPaidSpin}
      onclick={buyFreeSpins}
    >
      Buy Bonus ({buyCostPreview})
    </button>
  </form>

  {#if hasActiveFreeSpinSession && freeSpinSession !== null}
    <div class="session-card">
      <p class="eyebrow">
        {freeSpinSession.source === "purchased" ? "Bonus bought" : "Bonus won"}
      </p>
      <strong>{freeSpinSession.remainingFreeSpins} free spins left</strong>
      <span>Bonus multiplier: {freeSpinSession.accumulatedMultiplier}x</span>
      <button
        class="primary-action"
        type="button"
        disabled={!canPlayFreeSpin}
        onclick={playFreeSpin}>Play Free Spin</button
      >
    </div>
  {/if}

  {#if lastPurchase}
    <div class="purchase-card">
      <strong>Free spins ready</strong>
      <span>Bonus cost: {lastPurchase.cost}</span>
    </div>
  {/if}

  <button
    class="ghost-action"
    type="button"
    disabled={!canUseControls}
    onclick={resetPlayer}>Reset Balance</button
  >
</aside>
