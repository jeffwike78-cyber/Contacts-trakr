"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, ExternalLink, Star, Tag, Eye, ChevronRight } from "lucide-react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import { loadData } from "@/lib/store";
import type { AppData } from "@/lib/types";

interface Retailer {
  name: string;
  tagline: string;
  highlight: string;
  color: string;
  textColor: string;
  rating: number;
  buildUrl: (brand: string, model: string) => string;
}

const RETAILERS: Retailer[] = [
  {
    name: "1-800 Contacts",
    tagline: "Price match guarantee",
    highlight: "Best for: Price match + convenience",
    color: "bg-red-50",
    textColor: "text-red-700",
    rating: 4.5,
    buildUrl: (brand, model) =>
      `https://www.1800contacts.com/search?q=${encodeURIComponent(`${brand} ${model}`)}`,
  },
  {
    name: "Contacts Direct",
    tagline: "Up to 70% off retail",
    highlight: "Best for: Deep discounts",
    color: "bg-blue-50",
    textColor: "text-blue-700",
    rating: 4.3,
    buildUrl: (brand, model) =>
      `https://www.contactsdirect.com/search?q=${encodeURIComponent(`${brand} ${model}`)}`,
  },
  {
    name: "Lens Direct",
    tagline: "Free shipping on orders $49+",
    highlight: "Best for: Free shipping",
    color: "bg-teal-50",
    textColor: "text-teal-700",
    rating: 4.2,
    buildUrl: (brand, model) =>
      `https://www.lensdirect.com/search#q=${encodeURIComponent(`${brand} ${model}`)}`,
  },
  {
    name: "Clearly",
    tagline: "Competitive prices, Canada & US",
    highlight: "Best for: International orders",
    color: "bg-purple-50",
    textColor: "text-purple-700",
    rating: 4.1,
    buildUrl: (brand, model) =>
      `https://www.clearly.ca/contact-lenses?q=${encodeURIComponent(`${brand} ${model}`)}`,
  },
  {
    name: "Walmart Vision Center",
    tagline: "Lowest everyday prices",
    highlight: "Best for: Lowest prices",
    color: "bg-yellow-50",
    textColor: "text-yellow-700",
    rating: 4.0,
    buildUrl: (brand, model) =>
      `https://www.walmart.com/search?q=${encodeURIComponent(`${brand} ${model} contact lenses`)}`,
  },
  {
    name: "Costco Optical",
    tagline: "Members save big",
    highlight: "Best for: Costco members",
    color: "bg-indigo-50",
    textColor: "text-indigo-700",
    rating: 4.4,
    buildUrl: () => `https://www.costco.com/contact-lenses.html`,
  },
  {
    name: "GlassesUSA",
    tagline: "50% off + promo codes",
    highlight: "Best for: Promo deals",
    color: "bg-green-50",
    textColor: "text-green-700",
    rating: 4.0,
    buildUrl: (brand, model) =>
      `https://www.glassesusa.com/contacts/search?q=${encodeURIComponent(`${brand} ${model}`)}`,
  },
  {
    name: "Walgreens Contacts",
    tagline: "Convenient + rewards points",
    highlight: "Best for: Walgreens members",
    color: "bg-rose-50",
    textColor: "text-rose-700",
    rating: 3.9,
    buildUrl: (brand, model) =>
      `https://www.walgreens.com/search/results.jsp?Ntt=${encodeURIComponent(`${brand} ${model} contacts`)}`,
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${i <= Math.floor(rating) ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"}`}
        />
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating}</span>
    </div>
  );
}

export default function ShopPage() {
  const [data, setData] = useState<AppData | null>(null);
  const [customBrand, setCustomBrand] = useState("");
  const [customModel, setCustomModel] = useState("");

  useEffect(() => {
    const d = loadData();
    setData(d);
    if (d.lens) {
      setCustomBrand(d.lens.brand);
      setCustomModel(d.lens.modelName);
    }
  }, []);

  if (!data) return null;

  const brand = customBrand || data.lens?.brand || "";
  const model = customModel || data.lens?.modelName || "";
  const hasSearch = brand.trim().length > 0;

  const prescription = data.lens && data.prescription ? {
    od: [data.prescription.odSphere, data.prescription.odCylinder, data.prescription.odAxis].filter(Boolean).join(" / "),
    os: [data.prescription.osSphere, data.prescription.osCylinder, data.prescription.osAxis].filter(Boolean).join(" / "),
  } : null;

  return (
    <div className="min-h-screen pb-20">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 pt-4 pb-6 space-y-4">

        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-blue-500" />
          <h1 className="text-xl font-bold text-gray-900">Shop Contacts</h1>
        </div>

        {/* Prescription summary */}
        {data.lens ? (
          <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4" />
              <p className="text-sm font-semibold">Your Lenses</p>
            </div>
            <p className="text-xl font-bold">{data.lens.brand} {data.lens.modelName}</p>
            {prescription && (
              <div className="mt-2 text-xs opacity-80 space-y-0.5">
                {prescription.od && <p>OD: {prescription.od}</p>}
                {prescription.os && <p>OS: {prescription.os}</p>}
              </div>
            )}
            {!data.prescription && (
              <Link href="/prescription" className="mt-2 text-xs opacity-80 flex items-center gap-1 hover:opacity-100">
                Add prescription for more details <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </section>
        ) : (
          <section className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
            <p className="text-sm text-blue-600 mb-2">Set up your lens profile to see personalized results</p>
            <Link href="/lenses" className="text-sm font-semibold text-blue-700 underline">
              Set up lenses →
            </Link>
          </section>
        )}

        {/* Search override */}
        <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-blue-500" />
            <h2 className="font-semibold text-gray-900 text-sm">Search for contacts</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Brand</label>
              <input
                type="text"
                placeholder="e.g. Acuvue"
                value={customBrand}
                onChange={(e) => setCustomBrand(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Model</label>
              <input
                type="text"
                placeholder="e.g. Oasys 1-Day"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        </section>

        {/* Retailers */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-gray-900">Top Retailers</h2>
            <span className="text-xs text-gray-400">Tap to search at each store</span>
          </div>

          {RETAILERS.map((retailer) => (
            <a
              key={retailer.name}
              href={hasSearch ? retailer.buildUrl(brand, model) : "#"}
              target={hasSearch ? "_blank" : undefined}
              rel="noopener noreferrer"
              onClick={(e) => !hasSearch && e.preventDefault()}
              className={`block rounded-2xl border border-gray-100 p-4 transition-all ${hasSearch ? "hover:shadow-md cursor-pointer" : "opacity-60 cursor-default"} bg-white`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${retailer.color} ${retailer.textColor}`}>
                      {retailer.name}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 mb-1">{retailer.tagline}</p>
                  <p className="text-xs text-gray-500 mb-2">{retailer.highlight}</p>
                  <Stars rating={retailer.rating} />
                </div>
                <div className="ml-3 flex items-center gap-1 text-blue-500">
                  {hasSearch && <span className="text-xs font-medium">Search</span>}
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>
              {hasSearch && (
                <div className="mt-2 text-xs text-gray-400 bg-gray-50 rounded-lg px-2.5 py-1.5 font-mono truncate">
                  Searching: {brand} {model}
                </div>
              )}
            </a>
          ))}
        </section>

        {/* Price comparison tip */}
        <section className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <h3 className="font-semibold text-amber-800 text-sm mb-2">💡 Saving Tips</h3>
          <ul className="text-xs text-amber-700 space-y-1.5">
            <li>• <strong>1-800 Contacts</strong> offers price matching — find a lower price and they&apos;ll beat it.</li>
            <li>• <strong>Costco Optical</strong> often has the lowest per-box prices (membership required).</li>
            <li>• Buy a year&apos;s supply at once — most retailers offer significant bulk discounts.</li>
            <li>• Check if your vision insurance covers contacts before buying.</li>
            <li>• Look for manufacturer rebates — Acuvue, Bausch+Lomb, and Alcon frequently run promotions.</li>
          </ul>
        </section>

        {/* Google Shopping fallback */}
        {hasSearch && (
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(`buy ${brand} ${model} contact lenses`)}&tbm=shop`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Compare all prices on Google Shopping
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </main>
    </div>
  );
}
