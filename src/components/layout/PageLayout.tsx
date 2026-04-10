import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export const PageLayout = ({ children, showFooter = true }: { children: React.ReactNode; showFooter?: boolean }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1 pt-16">{children}</main>
    {showFooter && <Footer />}
  </div>
);
