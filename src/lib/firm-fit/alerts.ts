export interface BreachAlertDetails {
  firm: string;
  rule: string;
  value: string;
}

export const BREACH_ALERT_EVENT = "propfident:breach-detected";

export function triggerBreachAlert(details: BreachAlertDetails) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent<BreachAlertDetails>(BREACH_ALERT_EVENT, { detail: details }));
  }
}
