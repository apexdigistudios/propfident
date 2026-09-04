import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Propfident - Prop Trading Risk Shield",
    short_name: "Propfident",
    description: "Zero-latency risk monitoring and Prop Firm Pass-Probability Engine.",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#020617",
    icons: [
      { src: "/propfidentlogo.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/propfidentlogo.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/propfidentlogo.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
