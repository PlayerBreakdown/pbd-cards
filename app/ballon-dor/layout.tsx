import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Balón de Oro vs Player Breakdown",
  description:
    "Compara al mejor según el Balón de Oro con el mejor según Player Breakdown.",
  alternates: {
    canonical: "/ballon-dor",
  },
};

export default function BallonDorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
