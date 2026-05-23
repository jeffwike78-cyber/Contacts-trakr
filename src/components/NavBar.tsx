"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eye, Package, FileText, Bell, ShoppingCart, LayoutDashboard } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/lenses", label: "Lenses", icon: Eye },
  { href: "/prescription", label: "Rx", icon: FileText },
  { href: "/inventory", label: "Supply", icon: Package },
  { href: "/reminders", label: "Alerts", icon: Bell },
  { href: "/shop", label: "Shop", icon: ShoppingCart },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <>
      {/* Top header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Contact Lens Tracker</h1>
            <p className="text-xs text-gray-500 leading-tight">Stay on top of your eye care</p>
          </div>
        </div>
      </header>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
        <div className="max-w-2xl mx-auto grid grid-cols-6">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 py-2 px-1 transition-colors ${
                  active
                    ? "text-blue-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
                <span className={`text-[10px] font-medium ${active ? "font-semibold" : ""}`}>
                  {label}
                </span>
                {active && (
                  <span className="absolute bottom-0 w-8 h-0.5 bg-blue-600 rounded-t-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
