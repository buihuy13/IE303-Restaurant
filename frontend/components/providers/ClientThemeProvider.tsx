"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

type ClientTheme = "light" | "dark";

type ClientThemeContextValue = {
    theme: ClientTheme;
    setTheme: (theme: ClientTheme) => void;
    toggleTheme: () => void;
};

const ClientThemeContext = createContext<ClientThemeContextValue | null>(null);

const STORAGE_KEY = "client-theme";
const THEME_TRANSITION_MS = 300;
const THEME_BACKGROUND_CLASS = "client-theme-background";
const THEME_READY_CLASS = "client-theme-ready";
const THEME_TRANSITION_CLASS = "client-theme-transitioning";

function applyThemeToBody(theme: ClientTheme) {
    if (typeof document === "undefined") return;
    document.body.classList.toggle("theme-aurora", theme === "dark");
}

export function ClientThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<ClientTheme>("light");
    const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const body = document.body;
        body.classList.add(THEME_BACKGROUND_CLASS);

        try {
            const saved = window.localStorage.getItem(STORAGE_KEY) as ClientTheme | null;
            const nextTheme: ClientTheme = saved === "dark" ? "dark" : "light";
            setThemeState(nextTheme);
            applyThemeToBody(nextTheme);
        } catch {
            applyThemeToBody("light");
        }

        body.classList.add(THEME_READY_CLASS);

        return () => {
            if (transitionTimerRef.current) {
                clearTimeout(transitionTimerRef.current);
            }
            body.classList.remove(THEME_BACKGROUND_CLASS, THEME_READY_CLASS, THEME_TRANSITION_CLASS, "theme-aurora");
        };
    }, []);

    const setTheme = (next: ClientTheme) => {
        if (typeof document !== "undefined") {
            const body = document.body;
            body.classList.add(THEME_BACKGROUND_CLASS, THEME_READY_CLASS, THEME_TRANSITION_CLASS);

            if (transitionTimerRef.current) {
                clearTimeout(transitionTimerRef.current);
            }

            transitionTimerRef.current = setTimeout(() => {
                body.classList.remove(THEME_TRANSITION_CLASS);
                transitionTimerRef.current = null;
            }, THEME_TRANSITION_MS);
        }

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
