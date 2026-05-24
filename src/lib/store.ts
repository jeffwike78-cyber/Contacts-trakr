"use client";

import type { AppData, ContactLens, Prescription, Inventory, ReminderSettings, WearLogEntry } from "./types";

const STORAGE_KEY = "contacts-trakr-data";

const defaultData: AppData = {
  lens: null,
  prescription: null,
  inventory: {
    pairsRemaining: 0,
    lowStockThreshold: 3,
    reorderThreshold: 6,
    lastUpdatedAt: new Date().toISOString(),
  },
  reminders: {
    enableChangeReminders: true,
    enableInventoryReminders: true,
    enableExamReminders: true,
    examReminderDaysBefore: 30,
  },
  wearLog: [],
};

export function loadData(): AppData {
  if (typeof window === "undefined") return defaultData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return { ...defaultData, ...parsed };
  } catch {
    return defaultData;
  }
}

export function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function updateLens(lens: ContactLens | null): void {
  const data = loadData();
  saveData({ ...data, lens });
}

export function updatePrescription(prescription: Prescription | null): void {
  const data = loadData();
  saveData({ ...data, prescription });
}

export function updateInventory(inventory: Inventory): void {
  const data = loadData();
  saveData({ ...data, inventory });
}

export function updateReminders(reminders: ReminderSettings): void {
  const data = loadData();
  saveData({ ...data, reminders });
}

export function addWearLogEntry(entry: WearLogEntry): void {
  const data = loadData();
  saveData({ ...data, wearLog: [entry, ...data.wearLog].slice(0, 90) });
}

export function updateWearLogEntry(id: string, updates: Partial<WearLogEntry>): void {
  const data = loadData();
  saveData({
    ...data,
    wearLog: data.wearLog.map((e) => (e.id === id ? { ...e, ...updates } : e)),
  });
}

export function clearAllData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
