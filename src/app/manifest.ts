import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Life Admin",
    short_name: "Life Admin",
    description:
      "A personal life admin dashboard — finances, investments, fitness, car, recipes, travel and gifts in one place.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#141210",
    theme_color: "#141210",
    orientation: "portrait-primary",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
