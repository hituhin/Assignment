"use client";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>AcadAdmin — Academic Management Dashboard</title>
        <meta name="description" content="Academic management dashboard — Gain Solutions Ltd" />
      </head>
      <body className="antialiased">
        <UIProvider>
          <Shell>{children}</Shell>
        </UIProvider>
      </body>
    </html>
  );
}
