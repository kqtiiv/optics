import Hero from "@/components/hero";
import Simulations from "@/components/simulation";
import { NavbarSetup } from "@/components/navbar";

import { AuroraBackground } from "@/components/ui/aurora-background";

export default function Home() {
  return (
    <AuroraBackground>
      <NavbarSetup />
      <Hero />
      <Simulations />
    </AuroraBackground>
  );
}
