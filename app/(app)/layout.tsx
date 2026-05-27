import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import MobileHeader from "@/components/layout/MobileHeader";
import MobileTabBar from "@/components/layout/MobileTabBar";
import Toaster from "@/components/layout/Toaster";
import RealtimeBridge from "@/components/layout/RealtimeBridge";

/**
 * Shared application shell.
 *
 * Desktop (lg+): floating white Sidebar (304px) on the left + translucent TopBar,
 * everything sitting on the grey app canvas with 12px margins.
 * Mobile (<lg): sticky MobileHeader + fixed bottom MobileTabBar.
 *
 * Children (the page body) render once; the nav chrome swaps responsively.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:flex lg:h-screen lg:gap-3 lg:p-3">
      <Sidebar className="hidden lg:flex" />
      <MobileHeader className="lg:hidden" />

      <div className="flex min-w-0 flex-1 flex-col lg:gap-3">
        <TopBar className="hidden lg:flex" />
        <main className="flex-1 px-5 pb-32 lg:min-h-0 lg:overflow-y-auto lg:px-0 lg:pb-0">
          {children}
        </main>
      </div>

      <MobileTabBar className="lg:hidden" />
      <RealtimeBridge />
      <Toaster />
    </div>
  );
}
