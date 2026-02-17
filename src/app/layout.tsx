import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Whoxa PeerJS Server',
  description: 'PeerJS Server for Whoxa App WebRTC signaling',
};

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
