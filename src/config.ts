// Everything personal lives here. Edit this file, not the components.
export const site = {
  // Change to your real domain once you have one (used for RSS, sitemap, canonical URLs).
  url: "https://eva-vidmar.pages.dev",
  name: "Eva Vidmar",
  tagline: "Notes on AI, life and technology. Projects with their code.",
  location: "Ljubljana",
  role: "Solution Engineer",
  education: "University of Ljubljana, Faculty of Computer and Information Science (UL FRI)",

  githubUser: "evavid",
  linkedinUrl: "https://www.linkedin.com/in/eva-vidmar-899b56168/",

  // Images in /public/images. Replace the placeholder SVGs with your LinkedIn
  // cover and portrait (e.g. cover.jpg, portrait.jpg) and update these paths.
  coverImage: "/images/cover.svg",
  portraitImage: "/images/portrait.svg",

  // Repos to show, in order. Leave empty to show your most recently
  // updated public, non-fork repos (up to `maxProjects`).
  projects: [
    "polite-email-generator",
    "scrumly",
    "covid-weather",
    "etv-news-website",
  ] as string[],
  maxProjects: 6,
};

export const categories = {
  ai: "AI",
  life: "Life",
  technology: "Technology",
} as const;

export type Category = keyof typeof categories;
