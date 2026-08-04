import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mori — Pousadas e Viagens",
    short_name: "Mori",
    description: "A rede social dos viajantes. Descubra pousadas, guias, roteiros e viaje com estilo.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f0f11",
    theme_color: "#c5a84a",
    icons: [
      { src: "/compass-192.png", sizes: "192x192", type: "image/png" },
      { src: "/compass-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    screenshots: [
      {
        src: "/screenshot-feed.png",
        sizes: "1170x2532",
        type: "image/png",
        form_factor: "narrow",
      },
    ],
  };
}
