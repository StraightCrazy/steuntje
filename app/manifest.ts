import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Steuntje",
    short_name: "Steuntje",
    description: "Dagelijkse emotionele EHBO in 20 seconden",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f1ea",
    theme_color: "#f8f1ea",
    icons: [
      {
        src: "/icons/manifest-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/manifest-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/manifest-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
