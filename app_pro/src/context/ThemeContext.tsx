import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { setTheme } from "../app/functions/auth";
import axios from "axios";

const api = import.meta.env.VITE_API;

export type ThemePreset = "midnight" | "emerald" | "cyberpunk" | "amethyst" | "sakura" | "ocean" | "light";

export interface ThemeMeta {
  id: ThemePreset;
  name: string;
  category: "dark" | "light";
  primaryColor: string;
  accentGlow: string;
  bgGradient: string;
  description: string;
}

export const THEMES: ThemeMeta[] = [
  {
    id: "midnight",
    name: "Midnight Neon",
    category: "dark",
    primaryColor: "#00F0FF",
    accentGlow: "rgba(0, 240, 255, 0.4)",
    bgGradient: "linear-gradient(135deg, #0b0f19 0%, #111827 100%)",
    description: "Obsidian dark mode with glowing cyan and electric blue accents.",
  },
  {
    id: "emerald",
    name: "Emerald Glass",
    category: "dark",
    primaryColor: "#10b981",
    accentGlow: "rgba(16, 185, 129, 0.4)",
    bgGradient: "linear-gradient(135deg, #062016 0%, #0d2c20 100%)",
    description: "Deep emerald teal glassmorphic theme with mint highlights.",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Amber",
    category: "dark",
    primaryColor: "#f59e0b",
    accentGlow: "rgba(245, 158, 11, 0.4)",
    bgGradient: "linear-gradient(135deg, #180d24 0%, #1f1032 100%)",
    description: "Futuristic dark mode with neon yellow-amber and purple glow.",
  },
  {
    id: "amethyst",
    name: "Amethyst Glow",
    category: "dark",
    primaryColor: "#a855f7",
    accentGlow: "rgba(168, 85, 247, 0.4)",
    bgGradient: "linear-gradient(135deg, #13091e 0%, #1d0f2e 100%)",
    description: "Luxurious deep purple and lavender velvet aesthetic.",
  },
  {
    id: "sakura",
    name: "Sakura Dusk",
    category: "dark",
    primaryColor: "#ec4899",
    accentGlow: "rgba(236, 72, 153, 0.4)",
    bgGradient: "linear-gradient(135deg, #1c0a17 0%, #280e22 100%)",
    description: "Rose gold and velvet dark romantic aesthetic.",
  },
  {
    id: "ocean",
    name: "Ocean Deep",
    category: "dark",
    primaryColor: "#06b6d4",
    accentGlow: "rgba(6, 182, 212, 0.4)",
    bgGradient: "linear-gradient(135deg, #051923 0%, #006494 100%)",
    description: "Vibrant marine blue theme with turquoise details.",
  },
  {
    id: "light",
    name: "Classic Frost",
    category: "light",
    primaryColor: "#2563eb",
    accentGlow: "rgba(37, 99, 235, 0.25)",
    bgGradient: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    description: "Crisp clean light mode with soft shadows and indigo highlights.",
  },
];

interface ThemeContextType {
  theme: ThemePreset;
  setThemePreset: (preset: ThemePreset) => void;
  toggleThemeMode: () => Promise<void>;
  themes: ThemeMeta[];
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const disp = useAppDispatch();
  const reduxTheme = useAppSelector((state) => state.auth.user.theme);

  const [theme, setThemeState] = useState<ThemePreset>(() => {
    const saved = localStorage.getItem("app_theme") as ThemePreset;
    if (saved && THEMES.some((t) => t.id === saved)) {
      return saved;
    }
    return reduxTheme ? "light" : "midnight";
  });

  useEffect(() => {
    const saved = localStorage.getItem("app_theme") as ThemePreset;
    if (!saved) {
      setThemeState(reduxTheme ? "light" : "midnight");
    }
  }, [reduxTheme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    
    root.classList.add("theme-transition");
    const timeout = setTimeout(() => {
      root.classList.remove("theme-transition");
    }, 300);

    if (theme === "light") {
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
    }

    localStorage.setItem("app_theme", theme);

    return () => clearTimeout(timeout);
  }, [theme]);

  const setThemePreset = (preset: ThemePreset) => {
    setThemeState(preset);
  };

  const toggleThemeMode = async () => {
    try {
      await axios.get(`${api}/user/set-theme`, { withCredentials: true });
      disp(setTheme());
    } catch (error) {
      console.log("Error calling set-theme API:", error);
    }
    
    if (theme === "light") {
      setThemePreset("midnight");
    } else {
      setThemePreset("light");
    }
  };

  const isDark = theme !== "light";

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setThemePreset,
        toggleThemeMode,
        themes: THEMES,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
