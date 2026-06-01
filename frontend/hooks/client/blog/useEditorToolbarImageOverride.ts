import { RefObject, useEffect } from "react";

/**
 * Binds the MDEditor toolbar image button to the given file input ref
 * so that clicking the image button in the editor opens the file picker.
 */
export function useEditorToolbarImageOverride(
    editorImageInputRef: RefObject<HTMLInputElement | null>,
    content: string,
) {
    useEffect(() => {
        const override = () => {
            const toolbar = document.querySelector(".w-md-editor-toolbar");
            if (!toolbar) return;
            const buttons = toolbar.querySelectorAll("button");
            buttons.forEach((btn) => {
                const aria = btn.getAttribute("aria-label")?.toLowerCase() ?? "";
                const title = btn.getAttribute("title")?.toLowerCase() ?? "";
                const data = btn.getAttribute("data-name")?.toLowerCase() ?? "";
                if (aria.includes("image") || title.includes("image") || data === "image") {
                    btn.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        editorImageInputRef.current?.click();
                    };
                }
            });
        };
        override();
        const timer = setTimeout(override, 500);
        const editorContainer = document.querySelector(".w-md-editor");
        const observer = editorContainer
            ? new MutationObserver(override)
            : null;
        if (editorContainer) observer?.observe(editorContainer, { childList: true, subtree: true });
        return () => {
            clearTimeout(timer);
            observer?.disconnect();
        };
    }, [content, editorImageInputRef]);
}
