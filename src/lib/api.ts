import { friendlyErrorMessage } from "./errors";
import type {
  BuyFreeSpinsResponse,
  Player,
  Paytable,
  SpinDetailResponse,
  SpinHistoryListResponse,
  SpinResponse,
} from "./types";

const API_BASE = "http://localhost:8080/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string> | undefined),
      },
    });
  } catch {
    throw new Error("The game is unavailable right now. Please try again in a moment.");
  }

  const text = await response.text();
  let body: unknown = null;

  if (text.length > 0) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    if (body !== null && typeof body === "object" && "message" in body) {
      throw new Error(friendlyErrorMessage(body as { error?: string; message?: string }));
    }

    throw new Error("Something went wrong. Please try again.");
  }

  return body as T;
}

export function fetchPlayer() {
  return request<Player>("/player");
}

export function resetPlayerBalance() {
  return request<Player>("/player/reset", { method: "POST" });
}

export function fetchPaytables() {
  return request<Paytable[]>("/paytables");
}

export function fetchHistory() {
  return request<SpinHistoryListResponse>("/player/history?limit=20");
}

export function createSpin(paytableId: number, bet: string) {
  return request<SpinResponse>("/spin", {
    method: "POST",
    body: JSON.stringify({ paytableId, bet }),
  });
}

export function buyFreeSpins(paytableId: number, bet: string) {
  return request<BuyFreeSpinsResponse>("/spin/buy", {
    method: "POST",
    body: JSON.stringify({ paytableId, bet }),
  });
}

export function playFreeSpin(parentSpinId: number) {
  return request<SpinResponse>("/spin/free", {
    method: "POST",
    body: JSON.stringify({ parentSpinId }),
  });
}

export function fetchSpinDetail(spinId: number) {
  return request<SpinDetailResponse>(`/spin/${spinId}`);
}
