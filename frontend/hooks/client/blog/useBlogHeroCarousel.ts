import { useCallback, useEffect, useMemo, useState } from "react";
import type { BlogViewModel } from "@/types/blogView.type";

const HERO_LIMIT = 3;
const AUTO_SLIDE_MS = 5000;

function shuffleBlogs(blogs: BlogViewModel[]) {
    return [...blogs].sort(() => Math.random() - 0.5);
}

export function useBlogHeroCarousel(sourceBlogs: BlogViewModel[]) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    const heroBlogs = useMemo(() => {
        return shuffleBlogs(sourceBlogs.filter((blog) => !!blog.coverImageUrl)).slice(0, HERO_LIMIT);
    }, [sourceBlogs]);

    useEffect(() => {
        setActiveIndex(0);
    }, [heroBlogs]);

    const goToSlide = useCallback((index: number) => {
        setActiveIndex(index);
    }, []);

    const goNext = useCallback(() => {
        setActiveIndex((current) => (heroBlogs.length > 0 ? (current + 1) % heroBlogs.length : 0));
    }, [heroBlogs.length]);

    const goPrevious = useCallback(() => {
        setActiveIndex((current) => (heroBlogs.length > 0 ? (current - 1 + heroBlogs.length) % heroBlogs.length : 0));
    }, [heroBlogs.length]);

    useEffect(() => {
        if (paused || heroBlogs.length < 2) return;

        const intervalId = window.setInterval(goNext, AUTO_SLIDE_MS);
        return () => window.clearInterval(intervalId);
    }, [goNext, heroBlogs.length, paused]);

    return {
        heroBlogs,
        activeIndex,
        paused,
        goNext,
        goPrevious,
        goToSlide,
        setPaused,
    };
}
