import * as React from "react";
import { cn } from "@/lib/utils";
import { getStoredUser } from "@/lib/auth";
import type { UserRole } from "@/lib/types";
import {
  BarChart3,
  Link2,
  Calculator,
  Target,
  TrendingUp,
  Fish,
  CreditCard,
} from "lucide-react";

interface SidebarProps {
  className?: string;
  currentPath?: string;
}

const allMenuItems = [
  { label: "Baseline Dashboard", href: "/dashboard", icon: BarChart3, roles: ["cooperative_manager", "operator", "reviewer"] as UserRole[] },
  { label: "Supply Chain Analysis", href: "/dashboard/supply-chain", icon: Link2, roles: ["cooperative_manager", "reviewer"] as UserRole[] },
  { label: "Feasibility Simulator", href: "/dashboard/feasibility", icon: Calculator, roles: ["cooperative_manager", "reviewer"] as UserRole[] },
  { label: "Scenario Analysis", href: "/dashboard/scenarios", icon: Target, roles: ["cooperative_manager", "reviewer"] as UserRole[] },
  { label: "Impact Dashboard", href: "/dashboard/impact", icon: TrendingUp, roles: ["cooperative_manager", "reviewer"] as UserRole[] },
  { label: "---", href: "", icon: null, roles: [] as UserRole[] },
  { label: "Data Komoditas", href: "/dashboard/commodities", icon: Fish, roles: ["cooperative_manager", "operator", "reviewer"] as UserRole[] },
  { label: "Data Transaksi", href: "/dashboard/transactions", icon: CreditCard, roles: ["cooperative_manager", "operator", "reviewer"] as UserRole[] },
];

export function Sidebar({ className, currentPath }: SidebarProps) {
  const user = getStoredUser();
  const role = user?.role || "reviewer";

  const items = allMenuItems.filter((item) => {
    if (item.label === "---") return true;
    return item.roles.includes(role);
  });

  return (
    <aside className={cn("pb-12 w-64 border-r bg-background hidden md:block overflow-y-auto", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight font-['Outfit']">
            BAHARI Intelligence
          </h2>
          <div className="space-y-1">
            {items.map((item) => {
              if (item.label === "---") {
                return <div key="sep" className="my-2 border-t border-border" />;
              }
              const active = currentPath === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
