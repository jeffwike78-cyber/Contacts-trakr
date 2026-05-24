"use client";

import { loadData } from "./store";
import { getChangeStatus, getPrescriptionStatus, getPrescriptionDaysLeft } from "./utils";

const LAST_NOTIF_KEY = "contacts-trakr-last-notif";

export async function registerServiceWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("/sw.js");
  } catch {
    // SW registration failed silently
  }
}

function getLastNotified(key: string): number {
  try {
    const raw = localStorage.getItem(LAST_NOTIF_KEY);
    const map = raw ? JSON.parse(raw) : {};
    return map[key] ?? 0;
  } catch {
    return 0;
  }
}

function markNotified(key: string) {
  try {
    const raw = localStorage.getItem(LAST_NOTIF_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[key] = Date.now();
    localStorage.setItem(LAST_NOTIF_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

function shouldNotify(key: string, cooldownHours = 12): boolean {
  const last = getLastNotified(key);
  return Date.now() - last > cooldownHours * 60 * 60 * 1000;
}

function sendNotification(title: string, body: string, tag: string) {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker.ready.then((reg) => {
    reg.showNotification(title, { body, tag, icon: "/favicon.ico" });
  });
  markNotified(tag);
}

export function checkAndFireReminders() {
  if (typeof window === "undefined") return;
  if (Notification.permission !== "granted") return;

  const data = loadData();
  const { lens, prescription, inventory, reminders } = data;

  // Contact change reminder
  if (reminders.enableChangeReminders && lens) {
    const status = getChangeStatus(lens);
    if (status === "overdue" && shouldNotify("change-overdue", 24)) {
      sendNotification(
        "🔴 Contacts overdue!",
        `Your ${lens.brand} ${lens.modelName} are past their replacement date. Put in a fresh pair now.`,
        "change-overdue"
      );
    } else if (status === "warning" && shouldNotify("change-warning", 12)) {
      sendNotification(
        "⚠️ Time to change contacts soon",
        `Your ${lens.brand} ${lens.modelName} are due for a fresh pair in 1–2 days.`,
        "change-warning"
      );
    }
  }

  // Low stock reminder
  if (reminders.enableInventoryReminders) {
    const { pairsRemaining, lowStockThreshold } = inventory;
    if (pairsRemaining === 0 && shouldNotify("stock-empty", 24)) {
      sendNotification(
        "🔴 Out of contacts!",
        "You have no contact lenses left. Order a new supply now.",
        "stock-empty"
      );
    } else if (pairsRemaining > 0 && pairsRemaining <= lowStockThreshold && shouldNotify("stock-low", 48)) {
      sendNotification(
        "📦 Running low on contacts",
        `Only ${pairsRemaining} pair${pairsRemaining === 1 ? "" : "s"} left. Time to reorder.`,
        "stock-low"
      );
    }
  }

  // Eye exam / prescription reminder
  if (reminders.enableExamReminders && prescription) {
    const status = getPrescriptionStatus(prescription);
    const daysLeft = getPrescriptionDaysLeft(prescription);

    if (status === "expired" && shouldNotify("rx-expired", 48)) {
      sendNotification(
        "🔴 Prescription expired",
        "Your contact lens prescription has expired. Schedule an eye exam to renew it.",
        "rx-expired"
      );
    } else if (
      status === "expiring" &&
      daysLeft <= reminders.examReminderDaysBefore &&
      shouldNotify("rx-expiring", 72)
    ) {
      sendNotification(
        "📋 Schedule your eye exam",
        `Your prescription expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}. Call your eye doctor soon.`,
        "rx-expiring"
      );
    }
  }
}
