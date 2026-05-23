"use client";

import { useEffect, useState, useRef } from "react";
import { FileText, Camera, Save, Trash2, Calendar, Eye, Upload } from "lucide-react";
import NavBar from "@/components/NavBar";
import { loadData, updatePrescription } from "@/lib/store";
import type { AppData, Prescription } from "@/lib/types";
import {
  getPrescriptionDaysLeft,
  getPrescriptionStatus,
  formatDate,
  addYearsToDate,
  generateId,
} from "@/lib/utils";

const EMPTY_RX: Omit<Prescription, "id" | "createdAt" | "photoDataUrl"> = {
  expiresAt: addYearsToDate(new Date().toISOString(), 1),
  odSphere: "",
  odCylinder: "",
  odAxis: "",
  odAdd: "",
  odBc: "",
  odDia: "",
  osSphere: "",
  osCylinder: "",
  osAxis: "",
  osAdd: "",
  osBc: "",
  osDia: "",
  doctorName: "",
  clinicName: "",
  notes: "",
};

export default function PrescriptionPage() {
  const [data, setData] = useState<AppData | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Prescription>>({});
  const [saved, setSaved] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const d = loadData();
    setData(d);
    if (!d.prescription) {
      setEditing(true);
      setForm({ ...EMPTY_RX });
    } else {
      setForm(d.prescription);
      setPhotoPreview(d.prescription.photoDataUrl);
    }
  }, []);

  if (!data) return null;

  const { prescription } = data;
  const rxDaysLeft = prescription ? getPrescriptionDaysLeft(prescription) : null;
  const rxStatus = prescription ? getPrescriptionStatus(prescription) : null;

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPhotoPreview(dataUrl);
      setForm((f) => ({ ...f, photoDataUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    const rx: Prescription = {
      id: form.id ?? generateId(),
      createdAt: form.createdAt ?? new Date().toISOString(),
      expiresAt: form.expiresAt ?? addYearsToDate(new Date().toISOString(), 1),
      odSphere: form.odSphere ?? "",
      odCylinder: form.odCylinder ?? "",
      odAxis: form.odAxis ?? "",
      odAdd: form.odAdd ?? "",
      odBc: form.odBc ?? "",
      odDia: form.odDia ?? "",
      osSphere: form.osSphere ?? "",
      osCylinder: form.osCylinder ?? "",
      osAxis: form.osAxis ?? "",
      osAdd: form.osAdd ?? "",
      osBc: form.osBc ?? "",
      osDia: form.osDia ?? "",
      doctorName: form.doctorName ?? "",
      clinicName: form.clinicName ?? "",
      photoDataUrl: form.photoDataUrl ?? null,
      notes: form.notes ?? "",
    };
    updatePrescription(rx);
    setData(loadData());
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleDelete() {
    if (!confirm("Delete your prescription?")) return;
    updatePrescription(null);
    setData(loadData());
    setEditing(true);
    setForm({ ...EMPTY_RX });
    setPhotoPreview(null);
  }

  const statusColor =
    rxStatus === "expired" ? "text-red-600 bg-red-50 border-red-200" :
    rxStatus === "expiring" ? "text-amber-600 bg-amber-50 border-amber-200" :
    "text-green-600 bg-green-50 border-green-200";

  return (
    <div className="min-h-screen pb-20">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 pt-4 pb-6 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <h1 className="text-xl font-bold text-gray-900">Prescription</h1>
          </div>
          {prescription && !editing && (
            <div className="flex gap-2">
              <button onClick={() => { setEditing(true); setForm(prescription); setPhotoPreview(prescription.photoDataUrl); }} className="text-sm text-blue-500 hover:text-blue-600 font-medium">Edit</button>
              <button onClick={handleDelete} className="text-sm text-red-400 hover:text-red-500 font-medium">Delete</button>
            </div>
          )}
        </div>

        {/* Status Banner */}
        {prescription && !editing && (
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${statusColor}`}>
            <Calendar className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">
                {rxStatus === "expired" ? "Prescription Expired" :
                 rxStatus === "expiring" ? "Prescription Expiring Soon" :
                 "Prescription Valid"}
              </p>
              <p className="text-xs opacity-80">
                {rxStatus === "expired"
                  ? `Expired ${Math.abs(rxDaysLeft!)} day${Math.abs(rxDaysLeft!) === 1 ? "" : "s"} ago — schedule an eye exam`
                  : `Expires ${formatDate(prescription.expiresAt)} (${rxDaysLeft} days remaining)`}
              </p>
            </div>
          </div>
        )}

        {/* Prescription Details View */}
        {prescription && !editing && (
          <>
            {/* Photo */}
            {prescription.photoDataUrl && (
              <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Camera className="w-4 h-4 text-blue-500" />
                  <h2 className="font-bold text-gray-900">Prescription Photo</h2>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={prescription.photoDataUrl}
                  alt="Prescription"
                  className="w-full rounded-xl object-contain max-h-64 border border-gray-100"
                />
              </section>
            )}

            {/* Rx Values */}
            <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-blue-500" />
                <h2 className="font-bold text-gray-900">Lens Values</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 uppercase">
                      <th className="text-left pb-2 pr-3">Eye</th>
                      <th className="pb-2 px-2">Sphere</th>
                      <th className="pb-2 px-2">Cyl</th>
                      <th className="pb-2 px-2">Axis</th>
                      <th className="pb-2 px-2">Add</th>
                      <th className="pb-2 px-2">BC</th>
                      <th className="pb-2 px-2">DIA</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-50">
                      <td className="py-2.5 pr-3 font-semibold text-gray-700">OD (R)</td>
                      <td className="py-2.5 px-2 text-center">{prescription.odSphere || "—"}</td>
                      <td className="py-2.5 px-2 text-center">{prescription.odCylinder || "—"}</td>
                      <td className="py-2.5 px-2 text-center">{prescription.odAxis || "—"}</td>
                      <td className="py-2.5 px-2 text-center">{prescription.odAdd || "—"}</td>
                      <td className="py-2.5 px-2 text-center">{prescription.odBc || "—"}</td>
                      <td className="py-2.5 px-2 text-center">{prescription.odDia || "—"}</td>
                    </tr>
                    <tr className="border-t border-gray-50">
                      <td className="py-2.5 pr-3 font-semibold text-gray-700">OS (L)</td>
                      <td className="py-2.5 px-2 text-center">{prescription.osSphere || "—"}</td>
                      <td className="py-2.5 px-2 text-center">{prescription.osCylinder || "—"}</td>
                      <td className="py-2.5 px-2 text-center">{prescription.osAxis || "—"}</td>
                      <td className="py-2.5 px-2 text-center">{prescription.osAdd || "—"}</td>
                      <td className="py-2.5 px-2 text-center">{prescription.osBc || "—"}</td>
                      <td className="py-2.5 px-2 text-center">{prescription.osDia || "—"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Doctor Info */}
            {(prescription.doctorName || prescription.clinicName) && (
              <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4">
                <h2 className="font-bold text-gray-900 mb-2">Doctor / Clinic</h2>
                {prescription.doctorName && <p className="text-sm text-gray-700 font-medium">{prescription.doctorName}</p>}
                {prescription.clinicName && <p className="text-sm text-gray-500">{prescription.clinicName}</p>}
              </section>
            )}

            {prescription.notes && (
              <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4">
                <h2 className="font-bold text-gray-900 mb-2">Notes</h2>
                <p className="text-sm text-gray-600">{prescription.notes}</p>
              </section>
            )}
          </>
        )}

        {/* Edit Form */}
        {editing && (
          <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4">
            <h2 className="font-bold text-gray-900 mb-4">{prescription ? "Edit Prescription" : "Add Prescription"}</h2>

            <div className="space-y-5">
              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prescription Photo</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-blue-300 rounded-xl text-sm text-blue-600 font-medium hover:bg-blue-50 transition-colors flex-1 justify-center"
                    >
                      <Camera className="w-4 h-4" />
                      Take Photo
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 font-medium hover:bg-gray-50 transition-colors flex-1 justify-center"
                    >
                      <Upload className="w-4 h-4" />
                      Upload
                    </button>
                  </div>
                  {photoPreview && (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photoPreview} alt="Preview" className="w-full rounded-xl object-contain max-h-40 border border-gray-100" />
                      <button
                        onClick={() => { setPhotoPreview(null); setForm((f) => ({ ...f, photoDataUrl: null })); }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiration Date</label>
                <input
                  type="date"
                  value={form.expiresAt ? form.expiresAt.slice(0, 10) : ""}
                  onChange={(e) => setForm((f) => ({ ...f, expiresAt: new Date(e.target.value).toISOString() }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <div className="flex gap-2 mt-2">
                  {[1, 2].map((yr) => (
                    <button
                      key={yr}
                      onClick={() => setForm((f) => ({ ...f, expiresAt: addYearsToDate(new Date().toISOString(), yr) }))}
                      className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      +{yr} year{yr > 1 ? "s" : ""}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Eye */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">R</span>
                  Right Eye (OD)
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "odSphere", label: "Sphere" },
                    { key: "odCylinder", label: "Cylinder" },
                    { key: "odAxis", label: "Axis" },
                    { key: "odAdd", label: "Add" },
                    { key: "odBc", label: "BC" },
                    { key: "odDia", label: "DIA" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs text-gray-500 mb-1">{label}</label>
                      <input
                        type="text"
                        placeholder="—"
                        value={(form as Record<string, string>)[key] ?? ""}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-center"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Left Eye */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs flex items-center justify-center font-bold">L</span>
                  Left Eye (OS)
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "osSphere", label: "Sphere" },
                    { key: "osCylinder", label: "Cylinder" },
                    { key: "osAxis", label: "Axis" },
                    { key: "osAdd", label: "Add" },
                    { key: "osBc", label: "BC" },
                    { key: "osDia", label: "DIA" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs text-gray-500 mb-1">{label}</label>
                      <input
                        type="text"
                        placeholder="—"
                        value={(form as Record<string, string>)[key] ?? ""}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-center"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Doctor Info */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Doctor Name</label>
                  <input
                    type="text"
                    placeholder="Dr. Smith"
                    value={form.doctorName ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, doctorName: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Clinic / Practice</label>
                  <input
                    type="text"
                    placeholder="Vision Care Center"
                    value={form.clinicName ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, clinicName: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                <textarea
                  rows={2}
                  value={form.notes ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  placeholder="Additional notes about your prescription..."
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {saved ? "Saved!" : "Save Prescription"}
                </button>
                {prescription && (
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
      </main>
    </div>
  );
}
