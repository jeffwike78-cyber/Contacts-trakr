import { differenceInDays, differenceInHours, parseISO, format, addDays, addYears } from "date-fns";
import type { ContactLens, Prescription, ContactSchedule } from "./types";

export function getScheduleLabel(schedule: ContactSchedule): string {
  const labels: Record<ContactSchedule, string> = {
    daily: "Daily disposable",
    biweekly: "2-week disposable",
    monthly: "Monthly disposable",
    extended: "Extended wear",
  };
  return labels[schedule];
}

export function getReplacementDays(schedule: ContactSchedule): number {
  const days: Record<ContactSchedule, number> = {
    daily: 1,
    biweekly: 14,
    monthly: 30,
    extended: 7,
  };
  return days[schedule];
}

export function getDaysWorn(insertedAt: string): number {
  return differenceInDays(new Date(), parseISO(insertedAt));
}

export function getHoursWorn(insertedAt: string): number {
  return differenceInHours(new Date(), parseISO(insertedAt));
}

export function getDaysUntilChange(lens: ContactLens): number | null {
  if (!lens.currentPairInsertedAt) return null;
  const dayWorn = getDaysWorn(lens.currentPairInsertedAt);
  return lens.replacementDays - dayWorn;
}

export function getChangeStatus(lens: ContactLens): "ok" | "warning" | "overdue" | "none" {
  const daysLeft = getDaysUntilChange(lens);
  if (daysLeft === null) return "none";
  if (daysLeft < 0) return "overdue";
  if (daysLeft <= 2) return "warning";
  return "ok";
}

export function getPrescriptionDaysLeft(prescription: Prescription): number {
  return differenceInDays(parseISO(prescription.expiresAt), new Date());
}

export function getPrescriptionStatus(prescription: Prescription): "valid" | "expiring" | "expired" {
  const daysLeft = getPrescriptionDaysLeft(prescription);
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 30) return "expiring";
  return "valid";
}

export function formatDate(isoString: string): string {
  return format(parseISO(isoString), "MMM d, yyyy");
}

export function formatDateShort(isoString: string): string {
  return format(parseISO(isoString), "MM/dd/yyyy");
}

export function formatDateTime(isoString: string): string {
  return format(parseISO(isoString), "MMM d, yyyy h:mm a");
}

export function addYearsToDate(isoString: string, years: number): string {
  return addYears(parseISO(isoString), years).toISOString();
}

export function addDaysToNow(days: number): string {
  return addDays(new Date(), days).toISOString();
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function buildRetailerSearchUrl(
  retailer: string,
  brand: string,
  model: string
): string {
  const query = encodeURIComponent(`${brand} ${model} contact lenses`);
  const urls: Record<string, string> = {
    "1-800 Contacts": `https://www.1800contacts.com/search?q=${query}`,
    "Contacts Direct": `https://www.contactsdirect.com/search?q=${query}`,
    "Lens Direct": `https://www.lensdirect.com/search#q=${query}`,
    "Clearly": `https://www.clearly.ca/contact-lenses?q=${query}`,
    "Walmart Vision": `https://www.walmart.com/search?q=${query}+contact+lenses`,
    "Costco Optical": `https://www.costco.com/contact-lenses.html`,
    "Target Optical": `https://www.targetoptical.com/contact-lenses`,
    "Walgreens": `https://www.walgreens.com/search/results.jsp?Ntt=${query}`,
    "CVS": `https://www.cvs.com/search?searchTerm=${query}`,
    "GlassesUSA": `https://www.glassesusa.com/contacts/search?q=${query}`,
  };
  return urls[retailer] ?? `https://www.google.com/search?q=${query}+buy+online`;
}

export function classNames(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
