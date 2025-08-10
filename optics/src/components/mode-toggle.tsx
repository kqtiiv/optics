import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useState } from "react";

export function ModeToggle() {
  const { setTheme } = useTheme();
  const [light, setLight] = useState(false);

  const response = () => {
    if (light) {
      setTheme("dark");
      setLight(false);
    } else {
      setTheme("light");
      setLight(true);
    }
  };

  return (
    <Button variant="secondary" size="icon" onClick={() => response()}>
      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
