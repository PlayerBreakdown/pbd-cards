import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Player Breakdown Cards",
    short_name: "PBP Cards",
    description:
      "Cartas, rankings y comparador de futbolistas con puntuaciones basadas en estadísticas reales.",
    start_url: "/",
    display: "standalone",
    background_color: "#061833",
    theme_color: "#061833",
    icons: [
      {
        src: "/icon.png",
        sizes: "1024x1024",
        type: "image/png",
      },
    ],
  };
}
