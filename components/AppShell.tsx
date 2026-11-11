import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { CartProvider } from '@/components/CartProvider';
import { SessionProvider } from '@/components/SessionProvider';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <div className="app-shell">
          <TopBar />
          <main>{children}</main>
          <BottomNav />
        </div>
      </CartProvider>
    </SessionProvider>
  );
}
