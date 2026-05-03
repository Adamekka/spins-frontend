<script lang="ts">
  import { formatDate, formatMoney, formatSpinType } from "../format";
  import type { SpinHistoryItem } from "../types";

  export let history: SpinHistoryItem[];
  export let canUseControls: boolean;
  export let reloadHistory: () => void;
  export let replaySpin: (spinId: number) => void;
</script>

<section class="history-card" aria-labelledby="history-title">
  <div class="section-header">
    <div>
      <p class="eyebrow">Recent plays</p>
      <h2 id="history-title">Previous Spins</h2>
    </div>
    <button type="button" disabled={!canUseControls} onclick={reloadHistory}>
      Refresh
    </button>
  </div>

  {#if history.length === 0}
    <p class="empty-state">Your recent spins will appear here.</p>
  {:else}
    <div class="history-list">
      {#each history as spin}
        <button
          type="button"
          class="history-row"
          disabled={!canUseControls}
          onclick={() => replaySpin(spin.id)}
        >
          <span>
            <strong>#{spin.id}</strong>
            <small>{formatSpinType(spin.spinType)}</small>
          </span>
          <span>
            <strong>{formatMoney(spin.totalWin)}</strong>
            <small>{spin.tumbleCount} drops</small>
          </span>
          <small>{formatDate(spin.spunAt)}</small>
        </button>
      {/each}
    </div>
  {/if}
</section>
