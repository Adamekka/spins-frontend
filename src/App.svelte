<script lang="ts">
  import { onMount } from "svelte";
  import {
    buyFreeSpins as requestBuyFreeSpins,
    createSpin,
    fetchHistory,
    fetchPaytables,
    fetchPlayer,
    fetchSpinDetail,
    playFreeSpin as requestPlayFreeSpin,
    resetPlayerBalance,
  } from "./lib/api";
  import { BUY_FREE_SPINS_MULTIPLIER } from "./lib/constants";
  import ControlsPanel from "./lib/components/ControlsPanel.svelte";
  import HeroPanel from "./lib/components/HeroPanel.svelte";
  import HistoryPanel from "./lib/components/HistoryPanel.svelte";
  import MachinePanel from "./lib/components/MachinePanel.svelte";
  import PrizePanel from "./lib/components/PrizePanel.svelte";
  import { messageFromError } from "./lib/errors";
  import {
    buildRenderTumbles,
    normalizeSpinDetail,
    normalizeSpinResponse,
    triggeredSymbolCodes,
  } from "./lib/results";
  import type {
    BuyFreeSpinsResponse,
    FreeSpinSession,
    GameResult,
    Paytable,
    Player,
    RenderCell,
    ResultSource,
    SpinHistoryItem,
    SpinDetailResponse,
    Tumble,
  } from "./lib/types";

  let player: Player | null = null;
  let paytables: Paytable[] = [];
  let selectedPaytableId = "";
  let bet = "1.00";
  let history: SpinHistoryItem[] = [];
  let activeResult: GameResult | null = null;
  let activeResultSource: ResultSource = "live";
  let displayedTumble: Tumble | null = null;
  let displayedTumbleIndex = 0;
  let activeRenderTumbles: RenderCell[][] = [];
  let freeSpinSession: FreeSpinSession | null = null;
  let lastPurchase: BuyFreeSpinsResponse | null = null;
  let isLoading = true;
  let isBusy = false;
  let isAnimating = false;
  let statusMessage = "";
  let errorMessage = "";
  let animationToken = 0;

  $: selectedPaytable =
    paytables.find((paytable) => paytable.id === Number(selectedPaytableId)) ??
    null;
  $: betAmount = Number.parseFloat(bet);
  $: isBetValid =
    /^\d+(\.\d{1,2})?$/.test(bet.trim()) &&
    Number.isFinite(betAmount) &&
    betAmount > 0;
  $: normalizedBet = isBetValid ? betAmount.toFixed(2) : "";
  $: buyCostPreview = isBetValid
    ? (betAmount * BUY_FREE_SPINS_MULTIPLIER).toFixed(2)
    : "--";
  $: hasActiveFreeSpinSession =
    freeSpinSession !== null && freeSpinSession.remainingFreeSpins > 0;
  $: canUseControls = !isLoading && !isBusy && !isAnimating;
  $: canStartPaidSpin =
    canUseControls &&
    selectedPaytable !== null &&
    isBetValid &&
    !hasActiveFreeSpinSession;
  $: canPlayFreeSpin = canUseControls && hasActiveFreeSpinSession;
  $: gridColumnCount =
    displayedTumble?.grid[0]?.length ?? selectedPaytable?.reelCount ?? 6;
  $: displayedRenderCells = activeRenderTumbles[displayedTumbleIndex] ?? [];
  $: triggeredSymbols =
    displayedTumble && activeResult
      ? triggeredSymbolCodes(displayedTumble, activeResult, selectedPaytable)
      : new Set<string>();
  $: displayedPayout =
    displayedTumble && Number(displayedTumble.winAmount) > 0
      ? displayedTumble.winAmount
      : null;
  $: placeholderRows = selectedPaytable?.rowCount ?? 5;
  $: placeholderColumns = selectedPaytable?.reelCount ?? 6;

  onMount(() => {
    void loadInitialData();
  });

  async function loadInitialData() {
    isLoading = true;
    errorMessage = "";

    try {
      const [playerResponse, paytableResponse, historyResponse] =
        await Promise.all([fetchPlayer(), fetchPaytables(), fetchHistory()]);

      player = playerResponse;
      paytables = paytableResponse;
      history = historyResponse.spins;

      if (paytables.length > 0 && selectedPaytableId === "") {
        selectedPaytableId = String(paytables[0].id);
      }

      const restoredSession = await recoverFreeSpinSession(
        historyResponse.spins,
      );
      statusMessage = restoredSession
        ? "Your free spins are ready."
        : "Game ready.";
    } catch (error) {
      errorMessage = messageFromError(error);
    } finally {
      isLoading = false;
    }
  }

  async function refreshHistory() {
    const historyResponse = await fetchHistory();
    history = historyResponse.spins;
    return historyResponse.spins;
  }

  async function recoverFreeSpinSession(spins: SpinHistoryItem[]) {
    for (const spin of spins) {
      if (spin.spinType === "FREE_SPIN") {
        continue;
      }

      const detail = await fetchSpinDetail(spin.id);

      if (restoreFreeSpinSessionFromDetail(detail)) {
        return true;
      }
    }

    freeSpinSession = null;
    return false;
  }

  async function reloadHistory() {
    if (!canUseControls) {
      return;
    }

    isBusy = true;
    errorMessage = "";
    statusMessage = "Refreshing recent spins...";

    try {
      const spins = await refreshHistory();
      const restoredSession = await recoverFreeSpinSession(spins);
      statusMessage = restoredSession
        ? "Recent spins refreshed. Your free spins are ready."
        : "Recent spins refreshed.";
    } catch (error) {
      errorMessage = messageFromError(error);
      statusMessage = "";
    } finally {
      isBusy = false;
    }
  }

  async function runBaseSpin(event?: SubmitEvent) {
    event?.preventDefault();

    if (!canStartPaidSpin || selectedPaytable === null) {
      return;
    }

    isBusy = true;
    errorMessage = "";
    statusMessage = "Spinning...";
    lastPurchase = null;

    try {
      const response = await createSpin(selectedPaytable.id, normalizedBet);

      if (player !== null) {
        player = { ...player, balance: response.newBalance };
      }

      if (response.freeSpinsTriggered && (response.freeSpinsAwarded ?? 0) > 0) {
        freeSpinSession = {
          parentSpinId: response.spinId,
          source: "triggered",
          awarded: response.freeSpinsAwarded ?? 0,
          remainingFreeSpins: response.freeSpinsAwarded ?? 0,
          accumulatedMultiplier: response.accumulatedMultiplier ?? 0,
        };
      }

      await showResult(normalizeSpinResponse(response), "live");
      await refreshHistory();
      statusMessage = response.freeSpinsTriggered
        ? "Free spins won!"
        : "Spin complete.";
    } catch (error) {
      errorMessage = messageFromError(error);
      statusMessage = "";
    } finally {
      isBusy = false;
    }
  }

  async function buyFreeSpins() {
    if (!canStartPaidSpin || selectedPaytable === null) {
      return;
    }

    isBusy = true;
    errorMessage = "";
    statusMessage = "Opening the bonus round...";

    try {
      const response = await requestBuyFreeSpins(
        selectedPaytable.id,
        normalizedBet,
      );

      if (player !== null) {
        player = { ...player, balance: response.newBalance };
      }

      lastPurchase = response;
      activeResultSource = "live";
      activeResult = null;
      displayedTumble = null;
      displayedTumbleIndex = 0;
      activeRenderTumbles = [];
      animationToken += 1;
      isAnimating = false;
      freeSpinSession = {
        parentSpinId: response.parentSpinId,
        source: "purchased",
        awarded: response.freeSpinsAwarded,
        remainingFreeSpins: response.freeSpinsAwarded,
        accumulatedMultiplier: 0,
      };

      await refreshHistory();
      statusMessage = `${response.freeSpinsAwarded} free spins ready. Cost: ${response.cost}.`;
    } catch (error) {
      errorMessage = messageFromError(error);
      statusMessage = "";
    } finally {
      isBusy = false;
    }
  }

  async function playFreeSpin() {
    if (!canPlayFreeSpin || freeSpinSession === null) {
      return;
    }

    isBusy = true;
    errorMessage = "";
    statusMessage = "Playing free spin...";
    lastPurchase = null;

    try {
      const response = await requestPlayFreeSpin(freeSpinSession.parentSpinId);

      if (player !== null) {
        player = { ...player, balance: response.newBalance };
      }

      if (response.sessionComplete || (response.remainingFreeSpins ?? 0) <= 0) {
        freeSpinSession = null;
      } else {
        freeSpinSession = {
          ...freeSpinSession,
          remainingFreeSpins:
            response.remainingFreeSpins ??
            freeSpinSession.remainingFreeSpins - 1,
          accumulatedMultiplier:
            response.accumulatedMultiplier ??
            freeSpinSession.accumulatedMultiplier,
        };
      }

      await showResult(normalizeSpinResponse(response), "live");
      await refreshHistory();
      statusMessage = response.sessionComplete
        ? "Bonus round complete."
        : "Free spin complete.";
    } catch (error) {
      errorMessage = messageFromError(error);
      statusMessage = "";
    } finally {
      isBusy = false;
    }
  }

  async function resetPlayer() {
    isBusy = true;
    errorMessage = "";
    statusMessage = "Resetting your balance...";

    try {
      player = await resetPlayerBalance();
      freeSpinSession = null;
      activeResult = null;
      displayedTumble = null;
      displayedTumbleIndex = 0;
      activeRenderTumbles = [];
      lastPurchase = null;
      animationToken += 1;
      await refreshHistory();
      statusMessage = "Balance reset. Bonus round cleared.";
    } catch (error) {
      errorMessage = messageFromError(error);
      statusMessage = "";
    } finally {
      isBusy = false;
      isAnimating = false;
    }
  }

  async function replaySpin(spinId: number) {
    if (!canUseControls) {
      return;
    }

    isBusy = true;
    errorMessage = "";
    statusMessage = `Opening spin #${spinId}...`;
    lastPurchase = null;

    try {
      const response = await fetchSpinDetail(spinId);
      restoreFreeSpinSessionFromDetail(response);
      await showResult(normalizeSpinDetail(response), "replay");
      statusMessage = `Showing spin #${spinId}.`;
    } catch (error) {
      errorMessage = messageFromError(error);
      statusMessage = "";
    } finally {
      isBusy = false;
    }
  }

  async function showResult(result: GameResult, source: ResultSource) {
    animationToken += 1;
    const token = animationToken; // Ignores stale timers if a new replay/spin starts before the prior animation finishes.

    activeResult = result;
    activeResultSource = source;
    displayedTumbleIndex = 0;
    activeRenderTumbles = buildRenderTumbles(result);

    if (result.tumbles.length === 0) {
      displayedTumble = null;
      activeRenderTumbles = [];
      isAnimating = false;
      return;
    }

    isAnimating = true;

    for (const [index, tumble] of result.tumbles.entries()) {
      if (token !== animationToken) {
        return;
      }

      displayedTumble = tumble;
      displayedTumbleIndex = index;

      await new Promise<void>((resolve) =>
        setTimeout(resolve, index === result.tumbles.length - 1 ? 900 : 950),
      );
    }

    if (token === animationToken) {
      isAnimating = false;
    }
  }

  function selectTumble(index: number) {
    if (activeResult === null || activeResult.tumbles[index] === undefined) {
      return;
    }

    animationToken += 1;
    isAnimating = false;
    displayedTumble = activeResult.tumbles[index];
    displayedTumbleIndex = index;
  }

  function restoreFreeSpinSessionFromDetail(response: SpinDetailResponse) {
    if (response.spinType === "FREE_SPIN" || response.remainingFreeSpins <= 0) {
      return false;
    }

    freeSpinSession = {
      parentSpinId: response.id,
      source:
        response.spinType === "PURCHASED_FREE_SPINS"
          ? "purchased"
          : "triggered",
      awarded: response.remainingFreeSpins,
      remainingFreeSpins: response.remainingFreeSpins,
      accumulatedMultiplier: response.accumulatedMultiplier,
    };

    return true;
  }
</script>

<svelte:head>
  <title>Spins</title>
</svelte:head>

<main class="app-shell">
  <HeroPanel {player} />

  {#if errorMessage}
    <aside class="notice error" role="alert">{errorMessage}</aside>
  {/if}

  {#if statusMessage && !errorMessage}
    <aside class="notice" aria-live="polite">{statusMessage}</aside>
  {/if}

  <div class="game-layout">
    <MachinePanel
      {activeResult}
      {activeResultSource}
      {displayedTumble}
      {displayedTumbleIndex}
      {displayedRenderCells}
      {triggeredSymbols}
      {displayedPayout}
      {gridColumnCount}
      {placeholderRows}
      {placeholderColumns}
      {selectTumble}
    />

    <ControlsPanel
      {paytables}
      bind:selectedPaytableId
      bind:bet
      {isBetValid}
      {canUseControls}
      {canStartPaidSpin}
      {hasActiveFreeSpinSession}
      {freeSpinSession}
      {canPlayFreeSpin}
      {lastPurchase}
      {buyCostPreview}
      {runBaseSpin}
      {buyFreeSpins}
      {playFreeSpin}
      {resetPlayer}
    />
  </div>

  <div class="support-layout">
    <HistoryPanel {history} {canUseControls} {reloadHistory} {replaySpin} />
    <PrizePanel {selectedPaytable} />
  </div>
</main>
