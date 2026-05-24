const STORAGE_KEY = "contacts-trakr-data";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

// Check reminders whenever the service worker activates or receives a message
self.addEventListener("message", (event) => {
  if (event.data?.type === "CHECK_REMINDERS") {
    checkAndNotify();
  }
});

async function checkAndNotify() {
  const permission = Notification.permission;
  if (permission !== "granted") return;

  let data;
  try {
    // Read from all clients' localStorage via message passing isn't possible,
    // so we rely on the data passed in the message
    const clients = await self.clients.matchAll();
    for (const client of clients) {
      client.postMessage({ type: "REQUEST_DATA" });
    }
  } catch {
    // No clients open; can't read data
  }
}

self.addEventListener("message", (event) => {
  if (event.data?.type === "REMIND") {
    const { title, body, tag } = event.data;
    self.registration.showNotification(title, {
      body,
      tag,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
    });
  }
});
