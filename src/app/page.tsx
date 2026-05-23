"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Eye,
  Package,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import NavBar from "@/components/NavBar";
import { loadData } from "@/lib/store";
import type { AppData } from "@/lib/types";
import {
  getChangeStatus,
  getDaysUntilChange,
  getDaysWorn,
  getHoursWorn,
  getPrescriptionDaysLeft,
  getPrescriptionStatus,
  formatDate,
  getScheduleLabel,
} from "@/lib/utils";

export default function Dashboard() {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    setData(loadData());
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen pb-20">
        <NavBar />
      </div>
    );
  }

  const { lens, prescription, inventory } = data;
  const changeStatus = lens ? getChangeStatus(lens) : "none";
  const daysUntilChange = lens ? getDaysUntilChange(lens) : null;
  const daysWorn = lens?.currentPairInsertedAt ? getDaysWorn(lens.currentPairInsertedAt) : null;
  const hoursWorn = lens?.currentPairInsertedAt ? getHoursWorn(lens.currentPairInsertedAt) : null;
  const rxDaysLeft = prescription ? getPrescriptionDaysLeft(prescription) : null;
  const rxStatus = prescription ? getPrescriptionStatus(prescription) : null;
  const lowStock = inventory.pairsRemaining <= inventory.lowStockThreshold;
  const reorderNeeded = inventory.pairsRemaining <= inventory.reorderThreshold;

  const alerts: { message: string; level: "error" | "warn" }[] = [];
  if (changeStatus === "overdue") alerts.push({ message: "Your contacts are overdue for a change!", level: "error" });
  if (changeStatus === "warning") alerts.push({ message: `Change your contacts soon — only ${daysUntilChange} day${daysUntilChange === 1 ? "" : "s"} left.`, level: "warn" });
  if (rxStatus === "expired") alerts.push({ message: "Your prescription has expired. Schedule an eye exam.", level: "error" });
  if (rxStatus === "expiring") alerts.push({ message: `Prescription expires in ${rxDaysLeft} days. Schedule your exam soon.`, level: "warn" });
  if (lowStock && inventory.pairsRemaining > 0) alerts.push({ message: `Only ${inventory.pairsRemaining} pair${inventory.pairsRemaining === 1 ? "" : "s"} of contacts left!`, level: "warn" });
  if (inventory.pairsRemaining === 0) alerts.push({ message: "You have no contact lenses left. Order now!", level: "error" });

  return (
    <div className="min-h-screen pb-20">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 pt-4 pb-6">

        {alerts.length > 0 && (
          <div className="space-y-2 mb-4">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-xl border text-sm font-medium ${
                  alert.level === "error"
                    ? "bg-red-50 border-red-200 text-red-700"
                    : "bg-amber-50 border-amber-200 text-amber-700"
                }`}
              >
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                {alert.message}
              </div>
            ))}
          </div>
        )}

        {/* Current Contacts Status */}
        <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-500" />
              <h2 className="font-bold text-gray-900">Current Contacts</h2>
            </div>
            <Link href="/lenses" className="text-blue-500 hover:text-blue-600 flex items-center gap-1 text-sm font-medium">
              Manage <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {lens ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{lens.brand} {lens.modelName}</p>
                  <p className="text-sm text-gray-500">{getScheduleLabel(lens.schedule)}</p>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                  changeStatus === "overdue" ? "bg-red-100 text-red-700" :
                  changeStatus === "warning" ? "bg-amber-100 text-amber-700" :
                  changeStatus === "ok" ? "bg-green-100 text-green-700" :
                  "bg-gray-100 text-gray-500"
                }`}>
                  {changeStatus === "none" ? "Not started" :
                   changeStatus === "overdue" ? "Change now!" :
                   `${daysUntilChange}d left`}
                </div>
              </div>

              {lens.currentPairInsertedAt ? (
                <div className="bg-blue-50 rounded-xl p-3 grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Days worn</p>
                    <p className="text-2xl font-bold text-blue-600">{daysWorn}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Total hours</p>
                    <p className="text-2xl font-bold text-blue-600">{hoursWorn}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-3 text-center text-sm text-gray-500">
                  No active pair tracked. Log when you put in a new pair!
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/lenses"
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Log New Pair
                </Link>
                <Link
                  href="/shop"
                  className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Shop Contacts
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm mb-3">No contact lens profile set up yet.</p>
              <Link
                href="/lenses"
                className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Set Up Lenses
              </Link>
            </div>
          )}
        </section>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Link href="/inventory" className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <Package className={`w-4 h-4 ${lowStock ? "text-amber-500" : "text-blue-500"}`} />
              <span className="text-sm font-semibold text-gray-700">Supply</span>
            </div>
            <p className={`text-3xl font-bold ${lowStock ? "text-amber-600" : "text-gray-900"}`}>
              {inventory.pairsRemaining}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {inventory.pairsRemaining === 1 ? "pair" : "pairs"} remaining
            </p>
            {reorderNeeded && inventory.pairsRemaining > 0 && (
              <p className="text-xs text-amber-600 font-medium mt-1">Time to reorder!</p>
            )}
          </Link>

          <Link href="/prescription" className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <FileText className={`w-4 h-4 ${rxStatus === "expired" ? "text-red-500" : rxStatus === "expiring" ? "text-amber-500" : "text-blue-500"}`} />
              <span className="text-sm font-semibold text-gray-700">Prescription</span>
            </div>
            {prescription ? (
              <>
                <p className={`text-3xl font-bold ${rxStatus === "expired" ? "text-red-600" : rxStatus === "expiring" ? "text-amber-600" : "text-green-600"}`}>
                  {rxDaysLeft !== null && rxDaysLeft >= 0 ? rxDaysLeft : "!"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {rxDaysLeft !== null && rxDaysLeft >= 0 ? "days until expiry" : "Expired"}
                </p>
              </>
            ) : (
              <>
                <p className="text-lg text-gray-400 mt-1">—</p>
                <p className="text-xs text-blue-500 font-medium mt-1">Add prescription →</p>
              </>
            )}
          </Link>
        </div>

        {/* Recent Wear Log */}
        {data.wearLog.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <h2 className="font-bold text-gray-900">Recent Wear</h2>
              </div>
              <Link href="/lenses" className="text-blue-500 hover:text-blue-600 flex items-center gap-1 text-sm font-medium">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-1">
              {data.wearLog.slice(0, 3).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                  <span className="text-gray-600">{formatDate(entry.insertedAt)}</span>
                  <span className="text-gray-400">
                    {!entry.removedAt
                      ? <span className="text-green-500 font-medium">Active</span>
                      : `${getDaysWorn(entry.insertedAt) || "<1"} day(s)`}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Setup Checklist */}
        <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-blue-500" />
            <h2 className="font-bold text-gray-900">Setup Checklist</h2>
          </div>
          <div className="space-y-1">
            {[
              { done: !!lens, label: "Set up contact lens profile", href: "/lenses" },
              { done: !!prescription, label: "Add your prescription", href: "/prescription" },
              { done: inventory.pairsRemaining > 0, label: "Log your current supply", href: "/inventory" },
              { done: !!(lens?.currentPairInsertedAt), label: "Log when you put contacts in", href: "/lenses" },
            ].map(({ done, label, href }) => (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${done ? "opacity-60" : "hover:bg-blue-50"}`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  done ? "bg-green-500 border-green-500" : "border-gray-300"
                }`}>
                  {done && <CheckCircle className="w-3 h-3 text-white fill-white" />}
                </div>
                <span className={`text-sm ${done ? "line-through text-gray-400" : "text-gray-700 font-medium"}`}>
                  {label}
                </span>
                {!done && <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
