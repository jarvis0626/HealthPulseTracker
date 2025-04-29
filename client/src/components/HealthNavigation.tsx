import { useState } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { Home, ChartLine, History, User } from "lucide-react";

export default function HealthNavigation() {
  const [location] = useLocation();

  const getTabClass = (path: string) => {
    const isActive = location === path;
    const baseClass = "flex flex-col items-center";
    const activeClass = "text-primary font-medium";
    const inactiveClass = "text-neutral-800";
    return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
  };

  const getIconClass = (path: string) => {
    const isActive = location === path;
    return isActive ? "text-primary" : "text-neutral-800";
  };

  return (
    <div className="fixed bottom-0 w-full max-w-md mx-auto bg-white border-t border-neutral-200 z-10">
      <div className="flex justify-around py-3">
        <Link href="/">
          <a className={getTabClass("/")}>
            <Home className={getIconClass("/")} size={20} />
            <span className="text-xs mt-1">Home</span>
          </a>
        </Link>
        <Link href="/predictions">
          <a className={getTabClass("/predictions")}>
            <ChartLine className={getIconClass("/predictions")} size={20} />
            <span className="text-xs mt-1">Predict</span>
          </a>
        </Link>
        <Link href="/history">
          <a className={getTabClass("/history")}>
            <History className={getIconClass("/history")} size={20} />
            <span className="text-xs mt-1">History</span>
          </a>
        </Link>
        <Link href="/profile">
          <a className={getTabClass("/profile")}>
            <User className={getIconClass("/profile")} size={20} />
            <span className="text-xs mt-1">Profile</span>
          </a>
        </Link>
      </div>
    </div>
  );
}
