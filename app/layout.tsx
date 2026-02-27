"use client";

import { useEffect, useState } from "react";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { UIProvider, useUI } from "@/providers/UIProvider";

function Shell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useUI();
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

function AppRoot({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Reset the in-memory store to seed data on every fresh page load / browser refresh
    fetch("/api/reset", { method: "POST" }).finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <UIProvider>
      <Shell>{children}</Shell>
    </UIProvider>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Academic Management Dashboard</title>
        <meta name="description" content="Academic management dashboard — Gain Solutions Ltd" />
      </head>
      <body className="antialiased">
        <AppRoot>{children}</AppRoot>
      </body>
    </html>
  );
}
