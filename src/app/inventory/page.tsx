"use client";

import { useEffect, useState } from "react";
import { Package, Plus, Minus, Save, ShoppingCart, AlertTriangle } from "lucide-react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import { loadData, updateInventory } from "@/lib/store";
import type { AppData, Inventory } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function InventoryPage() {
  const [data, setData] = useState<AppData | null>(null);
  const [form, setForm] = useState<Inventory | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const d = loadData();
    setData(d);
    setForm({ ...d.inventory });
  }, []);

  if (!data || !form) return null;

  const lowStock = form.pairsRemaining <= form.lowStockThreshold;
  const reorderNeeded = form.pairsRemaining <= form.reorderThreshold;

  function adjust(delta: number) {
    setForm((f) => f ? { ...f, pairsRemaining: Math.max(0, f.pairsRemaining + delta), lastUpdatedAt: new Date().toISOString() } : f);
  }

  function handleSave() {
    if (!form) return;
    const updated = { ...form, lastUpdatedAt: new Date().toISOString() };
    updateInventory(updated);
    setData(loadData());
    setForm(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const supplyWeeks = data.lens
    ? Math.floor((form.pairsRemaining * data.lens.replacementDays) / 7)
    : null;

  return (
    <div className="min-h-screen pb-20">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 pt-4 pb-6 space-y-4">

        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-500" />
          <h1 className="text-xl font-bold text-gray-900">Contact Supply</h1>
        </div>

        {/* Alert */}
        {form.pairsRemaining === 0 && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            You&apos;re out of contacts! Order now.
          </div>
        )}
        {lowStock && form.pairsRemaining > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Running low — only {form.pairsRemaining} pair{form.pairsRemaining === 1 ? "" : "s"} remaining.
          </div>
        )}

        {/* Main Count */}
        <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
          <p className="text-sm text-gray-500 text-center mb-2">Pairs remaining</p>
          <div className="flex items-center justify-center gap-6 mb-4">
            <button
              onClick={() => adjust(-1)}
              className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <Minus className="w-6 h-6 text-gray-600" />
            </button>
            <span className={`text-6xl font-bold tabular-nums ${lowStock ? "text-amber-600" : "text-gray-900"}`}>
              {form.pairsRemaining}
            </span>
            <button
              onClick={() => adjust(1)}
              className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors"
            >
              <Plus className="w-6 h-6 text-white" />
            </button>
          </div>

          {supplyWeeks !== null && (
            <p className="text-center text-sm text-gray-500 mb-4">
              ~{supplyWeeks} week{supplyWeeks === 1 ? "" : "s"} of supply based on your schedule
            </p>
          )}

          {/* Quick add buttons */}
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {[6, 12, 24, 90].map((n) => (
              <button
                key={n}
                onClick={() => setForm((f) => f ? { ...f, pairsRemaining: f.pairsRemaining + n, lastUpdatedAt: new Date().toISOString() } : f)}
                className="px-3 py-1.5 rounded-full border border-blue-200 text-blue-600 text-sm hover:bg-blue-50 transition-colors"
              >
                +{n} pack
              </button>
            ))}
          </div>

          {/* Manual input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Set exact count</label>
            <input
              type="number"
              min={0}
              value={form.pairsRemaining}
              onChange={(e) => setForm((f) => f ? { ...f, pairsRemaining: Math.max(0, parseInt(e.target.value) || 0) } : f)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saved ? "Saved!" : "Save"}
          </button>

          {data.inventory.lastUpdatedAt && (
            <p className="text-xs text-gray-400 text-center mt-2">
              Last updated {formatDate(data.inventory.lastUpdatedAt)}
            </p>
          )}
        </section>

        {/* Thresholds */}
        <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4">
          <h2 className="font-bold text-gray-900 mb-3">Alert Thresholds</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Low stock alert at (pairs)
              </label>
              <input
                type="number"
                min={1}
                value={form.lowStockThreshold}
                onChange={(e) => setForm((f) => f ? { ...f, lowStockThreshold: parseInt(e.target.value) || 1 } : f)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <p className="text-xs text-gray-400 mt-1">Show a warning when supply drops to this level</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reorder reminder at (pairs)
              </label>
              <input
                type="number"
                min={1}
                value={form.reorderThreshold}
                onChange={(e) => setForm((f) => f ? { ...f, reorderThreshold: parseInt(e.target.value) || 1 } : f)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <p className="text-xs text-gray-400 mt-1">When to suggest reordering contacts</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className="mt-3 w-full text-sm text-blue-600 font-medium hover:underline"
          >
            Save thresholds
          </button>
        </section>

        {/* Shop CTA */}
        {reorderNeeded && (
          <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="w-5 h-5" />
              <h2 className="font-bold">Time to Reorder!</h2>
            </div>
            <p className="text-sm opacity-90 mb-3">
              Find the best price on {data.lens ? `${data.lens.brand} ${data.lens.modelName}` : "your contacts"} from top retailers.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-white text-blue-700 rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-blue-50 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              Find Best Price
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}
