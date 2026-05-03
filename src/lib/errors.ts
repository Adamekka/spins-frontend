export function messageFromError(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export function friendlyErrorMessage(errorBody: { error?: string; message?: string }) {
  switch (errorBody.error) {
    case "FREE_SPINS_EXHAUSTED":
      return "No free spins remain in this bonus round.";
    case "INSUFFICIENT_BALANCE":
      return "Your balance is too low for that bet.";
    case "INVALID_BET":
      return "Enter a valid bet amount.";
    case "INVALID_FREE_SPIN_PARENT":
      return "That free spin is no longer available.";
    case "INVALID_REQUEST":
      return "Check your bet and try again.";
    case "PAYTABLE_NOT_FOUND":
      return "That game is unavailable. Please refresh and try again.";
    case "PLAYER_NOT_FOUND":
      return "Your game profile could not be loaded.";
    case "SPIN_NOT_FOUND":
      return "That spin is no longer available.";
    default:
      return "Something went wrong. Please try again.";
  }
}
