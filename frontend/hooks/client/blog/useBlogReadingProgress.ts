import { useEffect, useState } from "react";

export function useBlogReadingProgress(resetKey?: string) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const updateProgress = () => {
            const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (scrollableHeight <= 0) {
                setProgress(0);
                return;
            }

            const nextProgress = Math.min(100, Math.max(0, (window.scrollY / scrollableHeight) * 100));
            setProgress(nextProgress);
        };

        setProgress(0);
        updateProgress();
        window.addEventListener("scroll", updateProgress, { passive: true });
        window.addEventListener("resize", updateProgress);

        return () => {
            window.removeEventListener("scroll", updateProgress);
            window.removeEventListener("resize", updateProgress);
        };
    }, [resetKey]);

    return progress;
}
