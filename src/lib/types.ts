export type ContactSchedule = "daily" | "biweekly" | "monthly" | "extended";

export interface ContactLens {
  id: string;
  brand: string;
  modelName: string;
  schedule: ContactSchedule;
  replacementDays: number; // how many days until replace
  currentPairInsertedAt: string | null; // ISO date string
  notes: string;
}

export interface Prescription {
  id: string;
  createdAt: string;
  expiresAt: string;
  // Right eye (OD)
  odSphere: string;
  odCylinder: string;
  odAxis: string;
  odAdd: string;
  odBc: string;
  odDia: string;
  // Left eye (OS)
  osSphere: string;
  osCylinder: string;
  osAxis: string;
  osAdd: string;
  osBc: string;
  osDia: string;
  doctorName: string;
  clinicName: string;
  photoDataUrl: string | null;
  notes: string;
}

export interface Inventory {
  pairsRemaining: number;
  lowStockThreshold: number;
  reorderThreshold: number;
  lastUpdatedAt: string;
}

export interface ReminderSettings {
  enableChangeReminders: boolean;
  enableInventoryReminders: boolean;
  enableExamReminders: boolean;
  examReminderDaysBefore: number; // days before expiry to remind
}

export interface AppData {
  lens: ContactLens | null;
  prescription: Prescription | null;
  inventory: Inventory;
  reminders: ReminderSettings;
  wearLog: WearLogEntry[];
}

export interface WearLogEntry {
  id: string;
  insertedAt: string;
  removedAt: string | null;
  notes: string;
}

export interface RetailerLink {
  name: string;
  logo: string;
  searchUrl: string;
  baseUrl: string;
  note: string;
}
