import './globals.css';
import ThemeSwitcher from '@/components/ThemeSwitcher';

export const metadata = {
  title: 'Sky Breeze — Tikinti Layihəsi İzləmə Sistemi',
  description: 'Sky Breeze tikinti layihəsinin canlı gedişat izləmə sistemi. Plan, fakt, personal, texnika və risk monitorinqi.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="az" suppressHydrationWarning>
      <body>
        {children}
        <ThemeSwitcher />
      </body>
    </html>
  );
}
