import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { 
  Home, 
  Dumbbell, 
  Calendar, 
  TrendingUp,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Accueil", page: "Home", color: "group-hover:text-violet-400" },
  { icon: Dumbbell, label: "Programmes", page: "Programs", color: "group-hover:text-amber-400" },
  { icon: Calendar, label: "Historique", page: "History", color: "group-hover:text-blue-400" },
  { icon: TrendingUp, label: "Stats", page: "Stats", color: "group-hover:text-emerald-400" },
  { icon: Settings, label: "Réglages", page: "Settings", color: "group-hover:text-white/60" }
];

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-black">
      <style>{`
        :root {
          --background: 0 0% 0%;
          --foreground: 0 0% 100%;
          --card: 0 0% 5%;
          --card-foreground: 0 0% 100%;
          --popover: 0 0% 5%;
          --popover-foreground: 0 0% 100%;
          --primary: 0 0% 100%;
          --primary-foreground: 0 0% 0%;
          --secondary: 0 0% 10%;
          --secondary-foreground: 0 0% 100%;
          --muted: 0 0% 10%;
          --muted-foreground: 0 0% 50%;
          --accent: 0 0% 15%;
          --accent-foreground: 0 0% 100%;
          --destructive: 0 60% 50%;
          --destructive-foreground: 0 0% 100%;
          --border: 0 0% 10%;
          --input: 0 0% 10%;
          --ring: 0 0% 100%;
        }
        
        * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        *::-webkit-scrollbar {
          display: none;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          opacity: 0.3;
        }
        
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>

      <main>{children}</main>

      {/* Bottom Navigation - Ultra Minimal */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-black/90 backdrop-blur-xl border-t border-white/5">
          <div className="max-w-lg mx-auto px-4 py-3">
            <div className="flex items-center justify-around">
              {navItems.map((item) => {
                const isActive = currentPageName === item.page;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className={cn(
                      "relative flex flex-col items-center gap-1 py-1 px-4 group transition-all",
                      isActive && "scale-105"
                    )}
                  >
                    <Icon className={cn(
                      "w-5 h-5 transition-colors",
                      isActive 
                        ? "text-white" 
                        : cn("text-white/25", item.color)
                    )} />
                    <span className={cn(
                      "text-[10px] font-light transition-colors",
                      isActive ? "text-white/70" : "text-white/20 group-hover:text-white/40"
                    )}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}