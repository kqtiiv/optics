import { AuroraBackground } from "@/components/ui/aurora-background";

import Hero from "./components/hero";
import { NavbarSetup } from "./components/navbar";
import Simulations from "./components/simulation";

function App() {
  return (
    <AuroraBackground>
      <NavbarSetup />
      <Hero />
      <Simulations />
    </AuroraBackground>
  );
}

export default App;
