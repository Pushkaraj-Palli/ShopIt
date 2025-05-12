import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { CartProvider } from '@/context/cart-context';
import { AuthProvider } from '@/hooks/use-auth';
import { AuthCtaButton } from '@/components/ui/auth-cta-button';
import { WelcomeMessage } from '@/components/sections/welcome-message';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ShopIt - Modern E-commerce',
  description: 'Premium shopping experience with a wide range of products',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
        >
          <AuthProvider>
            <CartProvider>
              <div className="flex min-h-screen flex-col">
                <WelcomeMessage />
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
                <AuthCtaButton />
              </div>
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}