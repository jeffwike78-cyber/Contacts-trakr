"use client";

import { useEffect, useState } from "react";
import { Bell, Eye, Package, FileText, RefreshCw, Save, ExternalLink } from "lucide-react";
import NavBar from "@/components/NavBar";
import { loadData, updateReminders } from "@/lib/store";
import type { AppData, ReminderSettings } from "@/lib/types";
import { getChangeStatus, getDaysUntilChange, getPrescriptionDaysLeft, getPrescriptionStatus } from "@/lib/utils";

interface ToggleProps {
  enabled: boolean;
  onChange: (v: boolean) => void;
}
function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? "bg-blue-600" : "bg-gray-200"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

export default function RemindersPage() {
  const [data, setData] = useState<AppData | null>(null);
  const [form, setForm] = useState<ReminderSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    const d = loadData();
    setData(d);
    setForm({ ...d.reminders });
    if (typeof Notification !== "undefined") {
      setNotifPermission(Notification.permission);
    }
  }, []);

  if (!data || !form) return null;

  const { lens, prescription, inventory } = data;
  const changeStatus = lens ? getChangeStatus(lens) : "none";
  const daysLeft = lens ? getDaysUntilChange(lens) : null;
  const rxDaysLeft = prescription ? getPrescriptionDaysLeft(prescription) : null;
  const rxStatus = prescription ? getPrescriptionStatus(prescription) : null;

  async function requestNotifications() {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setNotifPermission(result);
  }

  function handleSave() {
    if (!form) return;
    updateReminders(form);
    setData(loadData());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const calUrl = (title: string, dateStr: string, notes: string) => {
    const start = dateStr.replace(/[-:]/g, "").replace("T", "T").slice(0, 15) + "Z";
    const end = start;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(notes)}`;
  };

  return (
    <div className="min-h-screen pb-20">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 pt-4 pb-6 space-y-4">

        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-500" />
          <h1 className="text-xl font-bold text-gray-900">Reminders & Alerts</h1>
        </div>

        {/* Status Summary */}
        <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4 space-y-3">
          <h2 className="font-bold text-gray-900">Current Status</h2>

          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-700">Contact lenses</span>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              changeStatus === "overdue" ? "bg-red-100 text-red-600" :
              changeStatus === "warning" ? "bg-amber-100 text-amber-600" :
              changeStatus === "ok" ? "bg-green-100 text-green-600" :
              "bg-gray-100 text-gray-400"
            }`}>
              {changeStatus === "none" ? "Not tracking" :
               changeStatus === "overdue" ? "Overdue!" :
               changeStatus === "warning" ? `${daysLeft}d left` :
               `${daysLeft}d left`}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-700">Prescription</span>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              rxStatus === "expired" ? "bg-red-100 text-red-600" :
              rxStatus === "expiring" ? "bg-amber-100 text-amber-600" :
              rxStatus === "valid" ? "bg-green-100 text-green-600" :
              "bg-gray-100 text-gray-400"
            }`}>
              {!prescription ? "Not set" :
               rxStatus === "expired" ? "Expired!" :
               rxStatus === "expiring" ? `${rxDaysLeft}d left` :
               `${rxDaysLeft}d left`}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-700">Supply</span>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              inventory.pairsRemaining === 0 ? "bg-red-100 text-red-600" :
              inventory.pairsRemaining <= inventory.lowStockThreshold ? "bg-amber-100 text-amber-600" :
              "bg-green-100 text-green-600"
            }`}>
              {inventory.pairsRemaining} pair{inventory.pairsRemaining === 1 ? "" : "s"}
            </span>
          </div>
        </section>

        {/* Calendar Links */}
        <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4">
          <h2 className="font-bold text-gray-900 mb-3">Add to Calendar</h2>
          <div className="space-y-2">
            {lens?.currentPairInsertedAt && daysLeft !== null && daysLeft > 0 && (
              <a
                href={calUrl(
                  "Change Contact Lenses",
                  new Date(Date.now() + daysLeft * 86400000).toISOString(),
                  `Time to put in a fresh pair of ${lens.brand} ${lens.modelName}`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-blue-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Change Contacts Reminder</p>
                    <p className="text-xs text-gray-400">In {daysLeft} day{daysLeft === 1 ? "" : "s"}</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-blue-400" />
              </a>
            )}

            {prescription && rxDaysLeft !== null && rxDaysLeft > 0 && (
              <a
                href={calUrl(
                  "Schedule Eye Exam — Prescription Expiring",
                  new Date(Date.now() + Math.max(0, rxDaysLeft - form.examReminderDaysBefore) * 86400000).toISOString(),
                  `Your contact lens prescription expires on ${prescription.expiresAt.slice(0, 10)}. Schedule your eye exam!`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-blue-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Eye Exam Reminder</p>
                    <p className="text-xs text-gray-400">{form.examReminderDaysBefore} days before expiry</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-blue-400" />
              </a>
            )}

            {(!lens?.currentPairInsertedAt && !prescription) && (
              <p className="text-sm text-gray-400 text-center py-2">
                Set up your lens profile and prescription to generate calendar reminders.
              </p>
            )}
          </div>
        </section>

        {/* Browser Notifications */}
        <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4">
          <h2 className="font-bold text-gray-900 mb-1">Browser Notifications</h2>
          <p className="text-xs text-gray-500 mb-3">
            Allow notifications to get in-browser reminders when you visit the app.
          </p>
          {notifPermission === "granted" ? (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <Bell className="w-4 h-4" />
              Notifications enabled
            </div>
          ) : notifPermission === "denied" ? (
            <p className="text-sm text-red-500">
              Notifications blocked. Enable them in your browser settings.
            </p>
          ) : (
            <button
              onClick={requestNotifications}
              className="flex items-center gap-2 bg-blue-600 text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              <Bell className="w-4 h-4" />
              Enable Notifications
            </button>
          )}
        </section>

        {/* Reminder Settings */}
        <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4">
          <h2 className="font-bold text-gray-900 mb-3">Reminder Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">Contact change reminders</p>
                <p className="text-xs text-gray-400">Alert when it&apos;s time to replace lenses</p>
              </div>
              <Toggle enabled={form.enableChangeReminders} onChange={(v) => setForm((f) => f ? { ...f, enableChangeReminders: v } : f)} />
            </div>

            <div className="flex items-center justify-between border-t border-gray-50 pt-3">
              <div>
                <p className="text-sm font-medium text-gray-800">Low inventory reminders</p>
                <p className="text-xs text-gray-400">Alert when supply is running low</p>
              </div>
              <Toggle enabled={form.enableInventoryReminders} onChange={(v) => setForm((f) => f ? { ...f, enableInventoryReminders: v } : f)} />
            </div>

            <div className="flex items-center justify-between border-t border-gray-50 pt-3">
              <div>
                <p className="text-sm font-medium text-gray-800">Eye exam reminders</p>
                <p className="text-xs text-gray-400">Alert before prescription expires</p>
              </div>
              <Toggle enabled={form.enableExamReminders} onChange={(v) => setForm((f) => f ? { ...f, enableExamReminders: v } : f)} />
            </div>

            {form.enableExamReminders && (
              <div className="border-t border-gray-50 pt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Remind me (days before expiry)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {[14, 30, 60, 90].map((d) => (
                    <button
                      key={d}
                      onClick={() => setForm((f) => f ? { ...f, examReminderDaysBefore: d } : f)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        form.examReminderDaysBefore === d
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {d} days
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={7}
                  max={180}
                  value={form.examReminderDaysBefore}
                  onChange={(e) => setForm((f) => f ? { ...f, examReminderDaysBefore: parseInt(e.target.value) || 30 } : f)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saved ? "Saved!" : "Save Settings"}
          </button>
        </section>
      </main>
    </div>
  );
}
