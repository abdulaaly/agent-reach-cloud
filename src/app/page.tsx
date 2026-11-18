import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { TerminalPlayground } from "@/components/TerminalPlayground";
import { PlatformMatrix } from "@/components/PlatformMatrix";
import { PricingCalculator } from "@/components/PricingCalculator";
import { SetupGuide } from "@/components/SetupGuide";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#010102] text-[#08090A] dark:text-[#F7F8F8] flex flex-col transition-colors duration-200">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <TerminalPlayground />
        <PlatformMatrix />
        <PricingCalculator />
        <SetupGuide />
      </main>
      <Footer />
    </div>
  );
}
