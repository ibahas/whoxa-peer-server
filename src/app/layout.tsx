import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Whoxa PeerJS Server',
  description: 'PeerJS Server for Whoxa App WebRTC signaling',
};

// Prevent static prerender; fixes "useContext" and prerender errors on Render
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
