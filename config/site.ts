import { SiteConfig } from "@/types/siteConfig";

export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://table-visualizer.com";

export const siteConfig: SiteConfig = {
  name: "Table Visualizer",
  tagLine: 'Table Visualizer',
  description:
    "A table visualizer with built-in i18n support.",
  url: BASE_URL,
  authors: [],
  creator: '',
  socialLinks: {},
  themeColors: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  defaultNextTheme: 'system', // next-theme option: system | dark | light
  icons: {
    icon: "/favicon.ico",
    shortcut: "/logo.png",
    apple: "/logo.png", // apple-touch-icon.png
  },
}
