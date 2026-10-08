import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import AppShell from '@/components/layout/AppShell';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'YojanaSetu | AI-First Indian Government Schemes Discovery Platform',
  description:
    'Discover, check eligibility, and understand benefits and documents for Central and State Government schemes with AI-powered grounded RAG and voice assistance.',
  keywords: [
    'YojanaSetu',
    'Indian Government Schemes',
    'PM-KISAN',
    'Ayushman Bharat',
    'PMAY',
    'MUDRA Loan',
    'Scholarships',
    'Direct Benefit Transfer',
    'MyScheme AI',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#070B19] text-white selection:bg-amber-500/30 selection:text-amber-200">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
