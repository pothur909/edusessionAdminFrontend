import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import SideBar from './components/sideBar';
import { FilterProvider } from '@/context/FilterContext';
import AuthGuard from './components/AuthGuard';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Admin dashboard for managing leads and enrollment',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FilterProvider>
          <AuthGuard>
            <SideBar allowedPages={[]}>{children}</SideBar>
          </AuthGuard>
        </FilterProvider>
      </body>
    </html>
  );
}