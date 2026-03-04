"use client";

export function useUnderDevelopmentPage() {
  return {
    title: "Under Development",
    description:
      "We're working hard to bring you this feature. Please check back soon!",
    comingTitle: "What's Coming?",
    comingDescription:
      "This page is currently under development. Our team is working on creating an amazing experience for you.",
    primaryLink: { href: "/", label: "Back to Home" },
    secondaryLink: { href: "/contact", label: "Contact Us" },
    footerText: "If you have any questions, feel free to",
    footerLink: { href: "/contact", label: "contact us" },
  };
}
