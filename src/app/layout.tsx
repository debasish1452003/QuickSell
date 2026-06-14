import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NexusDAG | Deterministic Graph-Based Workflow Planner",
  description: "A professional DAG-based project management platform with critical path analysis, Kanban execution, role-aware access, and Monte Carlo workflow simulation.",
  applicationName: "NexusDAG",
  keywords: ["NexusDAG", "DAG workflow", "critical path", "project management", "Three.js", "kanban"],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "NexusDAG",
    description: "High-performance project planning with DAG analysis and executive client visibility.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
