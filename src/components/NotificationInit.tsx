"use client";

import { useEffect } from "react";
import { registerServiceWorker, checkAndFireReminders } from "@/lib/notifications";

export default function NotificationInit() {
  useEffect(() => {
    registerServiceWorker();
    // Check reminders every time the user opens or returns to the app
    checkAndFireReminders();
    const onFocus = () => checkAndFireReminders();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return null;
}
