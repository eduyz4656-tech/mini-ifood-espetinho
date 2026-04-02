import "./globals.css";

export const metadata = {
  title: "Espetinho do Thalisca",
  description: "App de pedidos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
