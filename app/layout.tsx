import type { Metadata, Viewport } from 'next';
import { Inter, Space_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#11764C',
};

export const metadata: Metadata = {
  title: 'Workout Tracker',
  description: 'Track your progressive overload workout program',
  manifest: '/manifest.json',
  icons: {
    icon: '/workout-bear-icon-512.png',
    apple: '/workout-bear-icon-180.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Workout Tracker',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
