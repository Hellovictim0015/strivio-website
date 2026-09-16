import "./globals.css";

export const metadata = {
  title: "STRIVIO — Discover. Book. Move.",
  description:
    "STRIVIO connects users with nearby gyms, sports academies, yoga studios and fitness centers.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
