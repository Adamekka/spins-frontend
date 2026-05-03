<script lang="ts">
  import { formatMoney } from "../format";
  import type { Player } from "../types";

  export let player: Player | null;
</script>

<section class="hero-panel" aria-labelledby="game-title">
  <div>
    <p class="eyebrow">Bonus reels</p>
    <h1 id="game-title">Spins</h1>
    <p class="hero-copy">
      Spin the reels, chase cascading wins, collect multipliers, and unlock free
      spins.
    </p>
  </div>

  <div class="wallet-card" aria-live="polite">
    <span class="wallet-label">Profile</span>
    <strong>{player?.username ?? "Loading..."}</strong>
    <span class="wallet-label">Balance</span>
    <strong class="balance">{formatMoney(player?.balance)}</strong>
  </div>
</section>
