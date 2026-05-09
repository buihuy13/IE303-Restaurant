"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type ClientTheme = "light" | "dark";

type ClientThemeContextValue = {
    theme: ClientTheme;
    setTheme: (theme: ClientTheme) => void;
    toggleTheme: () => void;
};

const ClientThemeContext = createContext<ClientThemeContextValue | null>(null);

const STORAGE_KEY = "client-theme";

function applyThemeToBody(theme: ClientTheme) {
    if (typeof document === "undefined") return;
    document.body.classList.toggle("theme-aurora", theme === "dark");
}

export function ClientThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<ClientTheme>("light");

    useEffect(() => {
        try {
            const saved = window.localStorage.getItem(STORAGE_KEY) as ClientTheme | null;
            const nextTheme: ClientTheme = saved === "dark" ? "dark" : "light";
            setThemeState(nextTheme);
            applyThemeToBody(nextTheme);
        } catch {
            applyThemeToBody("light");
        }
    }, []);

    const setTheme = (next: ClientTheme) => {
        setThemeState(next);
        applyThemeToBody(next);
        try {
            window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
            // ignore
        }
    };

    const value = useMemo<ClientThemeContextValue>(
        () => ({
            theme,
            setTheme,
            toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
        }),
        [theme],
    );

    return <ClientThemeContext.Provider value={value}>{children}</ClientThemeContext.Provider>;
}

export function useClientTheme() {
    const ctx = useContext(ClientThemeContext);
    if (!ctx) throw new Error("useClientTheme must be used within ClientThemeProvider");
    return ctx;
}

