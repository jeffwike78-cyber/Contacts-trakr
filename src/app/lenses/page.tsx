"use client";

import { useEffect, useState } from "react";
import { Eye, Plus, RefreshCw, Clock, Save, Trash2, LogIn } from "lucide-react";
import NavBar from "@/components/NavBar";
import NumberInput from "@/components/NumberInput";
import { loadData, saveData, updateLens, addWearLogEntry } from "@/lib/store";
import type { AppData, ContactLens, ContactSchedule } from "@/lib/types";
import {
  getScheduleLabel,
  getReplacementDays,
  getChangeStatus,
  getDaysUntilChange,
  getDaysWorn,
  formatDateTime,
  formatDate,
  generateId,
} from "@/lib/utils";

const SCHEDULES: ContactSchedule[] = ["daily", "biweekly", "monthly", "extended"];

const POPULAR_BRANDS = [
  "Acuvue",
  "Bausch + Lomb",
  "CooperVision",
  "Alcon",
  "Johnson & Johnson",
  "Other",
];

export default function LensesPage() {
  const [data, setData] = useState<AppData | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<ContactLens>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const d = loadData();
    setData(d);
    if (!d.lens) {
      setEditing(true);
      setForm({ schedule: "monthly", replacementDays: 30 });
    } else {
      setForm(d.lens);
    }
  }, []);

  if (!data) return null;

  const { lens } = data;
  const changeStatus = lens ? getChangeStatus(lens) : "none";
  const daysLeft = lens ? getDaysUntilChange(lens) : null;

  function handleScheduleChange(schedule: ContactSchedule) {
    setForm((f) => ({ ...f, schedule, replacementDays: getReplacementDays(schedule) }));
  }

  function handleSave() {
    if (!form.brand || !form.modelName || !form.schedule) return;
    const newLens: ContactLens = {
      id: form.id ?? generateId(),
      brand: form.brand!,
      modelName: form.modelName!,
      schedule: form.schedule!,
      replacementDays: form.replacementDays ?? getReplacementDays(form.schedule!),
      currentPairInsertedAt: form.currentPairInsertedAt ?? null,
      notes: form.notes ?? "",
    };
    updateLens(newLens);
    setData(loadData());
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleLogNewPair() {
    if (!lens) return;
    const now = new Date().toISOString();
    // Close previous entry if open
    const d = loadData();
    const openEntry = d.wearLog.find((e) => !e.removedAt);
    if (openEntry) {
      const updated = {
        ...d,
        wearLog: d.wearLog.map((e) => e.id === openEntry.id ? { ...e, removedAt: now } : e),
      };
      saveData(updated);
    }
    // Log new pair
    addWearLogEntry({ id: generateId(), insertedAt: now, removedAt: null, notes: "" });
    updateLens({ ...lens, currentPairInsertedAt: now });
    setData(loadData());
  }

  function handleRemoveCurrentPair() {
    if (!lens) return;
    const now = new Date().toISOString();
    const d = loadData();
    const openEntry = d.wearLog.find((e) => !e.removedAt);
    if (openEntry) {
      const updated = {
        ...d,
        wearLog: d.wearLog.map((e) => e.id === openEntry.id ? { ...e, removedAt: now } : e),
      };
      saveData(updated);
    }
    updateLens({ ...lens, currentPairInsertedAt: null });
    setData(loadData());
  }

  return (
    <div className="min-h-screen pb-20">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 pt-4 pb-6 space-y-4">

        {/* Status card */}
        {lens && !editing && (
          <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-500" />
                <h2 className="font-bold text-gray-900">{lens.brand} {lens.modelName}</h2>
              </div>
              <button
                onClick={() => { setEditing(true); setForm(lens); }}
                className="text-sm text-blue-500 hover:text-blue-600 font-medium"
              >
                Edit
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-gray-500">{getScheduleLabel(lens.schedule)}</span>
              <span className="text-gray-300">•</span>
              <span className={`text-sm font-semibold px-2.5 py-0.5 rounded-full ${
                changeStatus === "overdue" ? "bg-red-100 text-red-700" :
                changeStatus === "warning" ? "bg-amber-100 text-amber-700" :
                changeStatus === "ok" ? "bg-green-100 text-green-700" :
                "bg-gray-100 text-gray-500"
              }`}>
                {changeStatus === "none" ? "No active pair" :
                 changeStatus === "overdue" ? `Overdue by ${Math.abs(daysLeft!)} day${Math.abs(daysLeft!) === 1 ? "" : "s"}` :
                 `${daysLeft} day${daysLeft === 1 ? "" : "s"} until change`}
              </span>
            </div>

            {lens.currentPairInsertedAt ? (
              <div className="bg-blue-50 rounded-xl p-3 mb-3">
                <p className="text-xs text-gray-500 mb-0.5">Inserted on</p>
                <p className="font-semibold text-gray-800">{formatDateTime(lens.currentPairInsertedAt)}</p>
                <p className="text-sm text-blue-600 mt-1 font-medium">{getDaysWorn(lens.currentPairInsertedAt)} day{getDaysWorn(lens.currentPairInsertedAt) === 1 ? "" : "s"} worn</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-3 mb-3 text-center text-sm text-gray-500">
                No active pair — log when you put in a new pair
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleLogNewPair}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                {lens.currentPairInsertedAt ? "New Pair (replace)" : "Log New Pair"}
              </button>
              {lens.currentPairInsertedAt && (
                <button
                  onClick={handleRemoveCurrentPair}
                  className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              )}
            </div>
          </section>
        )}

        {/* Edit / Setup Form */}
        {editing && (
          <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-blue-500" />
              <h2 className="font-bold text-gray-900">{lens ? "Edit Lens Profile" : "Set Up Your Lenses"}</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Brand</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {POPULAR_BRANDS.map((b) => (
                    <button
                      key={b}
                      onClick={() => setForm((f) => ({ ...f, brand: b === "Other" ? "" : b }))}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        form.brand === b || (b === "Other" && form.brand !== undefined && !POPULAR_BRANDS.includes(form.brand))
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="e.g. Acuvue, Bausch + Lomb"
                  value={form.brand ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Model / Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Oasys 1-Day, Ultra, Dailies Total1"
                  value={form.modelName ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, modelName: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Replacement Schedule</label>
                <div className="grid grid-cols-2 gap-2">
                  {SCHEDULES.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleScheduleChange(s)}
                      className={`px-3 py-2.5 rounded-xl text-sm border text-left transition-colors ${
                        form.schedule === s
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <span className="font-medium">{getScheduleLabel(s)}</span>
                      <br />
                      <span className={`text-xs ${form.schedule === s ? "text-blue-100" : "text-gray-400"}`}>
                        Every {getReplacementDays(s)} day{getReplacementDays(s) === 1 ? "" : "s"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Custom replacement interval (days)
                </label>
                <NumberInput
                  min={1}
                  max={90}
                  value={form.replacementDays ?? 1}
                  onChange={(n) => setForm((f) => ({ ...f, replacementDays: n }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
                <textarea
                  rows={2}
                  value={form.notes ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  placeholder="Any special notes about your lenses..."
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSave}
                  disabled={!form.brand || !form.modelName}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {saved ? "Saved!" : "Save Profile"}
                </button>
                {lens && (
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Wear Log */}
        {data.wearLog.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-blue-500" />
              <h2 className="font-bold text-gray-900">Wear History</h2>
            </div>
            <div className="space-y-1">
              {data.wearLog.map((entry, i) => (
                <div key={entry.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {i === 0 && !entry.removedAt ? (
                        <span className="text-green-600">Current pair</span>
                      ) : (
                        `Pair #${data.wearLog.length - i}`
                      )}
                    </p>
                    <p className="text-xs text-gray-400">Started {formatDate(entry.insertedAt)}</p>
                  </div>
                  <div className="text-right">
                    {entry.removedAt ? (
                      <p className="text-sm text-gray-500">{getDaysWorn(entry.insertedAt) || "<1"} day(s)</p>
                    ) : (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Active</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty log state */}
        {data.wearLog.length === 0 && lens && !editing && (
          <div className="text-center py-6 text-gray-400">
            <RefreshCw className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No wear history yet. Log your first pair above!</p>
          </div>
        )}
      </main>
    </div>
  );
}
