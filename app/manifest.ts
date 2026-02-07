import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Steuntje",
    short_name: "Steuntje",
    description: "Een klein moment dat je dag zachter maakt.",

    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",

    background_color: "#f8f1ea",
    theme_color: "#f8f1ea",

    categories: ["health", "lifestyle", "wellbeing"],

    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192-maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
