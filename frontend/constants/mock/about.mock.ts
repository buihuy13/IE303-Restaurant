import { AboutPageImages } from "@/constants/images";

export type AboutSection = {
  id: string;
  image: string;
  title: string;
  paragraphs: string[];
  reverse?: boolean;
};

export type AboutStat = {
  value: string;
  label: string;
};

export const aboutSections: AboutSection[] = [
  {
    id: "our-story",
    image: AboutPageImages.OurStory,
    title: "Our story.",
    paragraphs: [
      "Foodeats was founded in 2023 by a team of food lovers who were tired of the limited and unreliable food delivery options available.",
      "We set out to create a platform that would connect people with the best local restaurants and provide a seamless and enjoyable ordering experience.",
    ],
  },
  {
    id: "our-mission",
    image: AboutPageImages.OurMission,
    title: "Our Mission",
    paragraphs: [
      "Our mission is to make it easy for everyone to enjoy the best food their city has to offer. We are committed to supporting local businesses and providing our customers with a wide variety of high-quality and delicious options.",
    ],
    reverse: true,
  },
];

export const aboutStats: AboutStat[] = [
  { value: "350+", label: "Order per minute" },
  { value: "10x", label: "Faster delivery" },
  { value: "10+", label: "In Country" },
  { value: "99.9%", label: "Order accuracy" },
];

