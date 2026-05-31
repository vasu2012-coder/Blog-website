import type { Metadata } from 'next';
import './globals.css';
import NavBar from '@/components/NavBar';

export const metadata: Metadata = {
  title: { default: 'Inkwell — A Modern Blog Platform', template: '%s | Inkwell' },
  description: 'Share your ideas with the world. Write, connect, and inspire.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        <main>{children}</main>
        <footer>
          <p>Built with care by <strong>Inkwell</strong> &mdash; Internship Project &copy; {new Date().getFullYear()}</p>
        </footer>
      </body>
    </html>
  );
}
