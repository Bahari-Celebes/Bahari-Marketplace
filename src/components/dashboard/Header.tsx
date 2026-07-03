import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { getStoredUser, logout } from "@/lib/auth";
import { isOnline, getPendingCount } from "@/lib/offline";
import { Wifi, WifiOff } from "lucide-react";

export function Header() {
  const user = getStoredUser();
  const [online, setOnline] = useState(isOnline());
  const [pending, setPending] = useState(0);

  useEffect(() => {
    setOnline(isOnline());
    getPendingCount().then(setPending);

    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold font-['Outfit']">{user?.name ? `Halo, ${user.name}` : "BAHARI Intelligence"}</h1>
      </div>
      <div className="flex items-center gap-3">
        {/* Offline/Pending indicator */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {online ? (
            <span className="flex items-center gap-1 text-green-600"><Wifi className="h-3.5 w-3.5" /> Online</span>
          ) : (
            <span className="flex items-center gap-1 text-yellow-600"><WifiOff className="h-3.5 w-3.5" /> Offline</span>
          )}
          {pending > 0 && (
            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full">
              {pending} pending
            </span>
          )}
        </div>
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
          {user?.name?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <Button variant="ghost" size="sm" onClick={logout}>
          Keluar
        </Button>
      </div>
    </header>
  );
}
