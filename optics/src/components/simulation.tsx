"use client";

import { Box, Lock, Search, Settings, Sparkles } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

export default function Simulations() {
  return (
    <div className="justify-center p-10" id="simulations">
      <h1 className="text-center mb-10 dark:text-white">Simulations</h1>
      <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
        <GridItem
          area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
          icon={<Box className="h-4 w-4 text-black dark:text-neutral-400" />}
          title="Task 5: Reflection on a plane mirror"
          description="Import your own image and watch the position of the image change"
          url="/reflection-on-plane-mirror"
        />

        <GridItem
          area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
          icon={
            <Settings className="h-4 w-4 text-black dark:text-neutral-400" />
          }
          title="Task 6+7: Image from an ideal thin lens"
          description="See the image formed from an ideal thin lens when viewed from a converging lens."
          url="/image-from-thin-lens"
        />

        <GridItem
          area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
          icon={<Lock className="h-4 w-4 text-black dark:text-neutral-400" />}
          title="Task 10: Anamorphic images"
          description="Create a mapping of pixel coordinates (that are fitted into a unit circle) to a sector of a circle with 
radius Rf, centered at the base of the object (the red star). If you place a polished cylinder over the unit 
circle, you will create an anamorphic image. It will appear to look somewhat three dimensional."
          url="/anamorphic-image"
        />

        <GridItem
          area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
          icon={
            <Sparkles className="h-4 w-4 text-black dark:text-neutral-400" />
          }
          title="Task 8: Real image from a spherical concave mirror"
          description="See the image formed when it is reflected in a concave spherical mirror."
          url="/concave-spherical-mirror"
        />

        <GridItem
          area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
          icon={<Search className="h-4 w-4 text-black dark:text-neutral-400" />}
          title="Task 9: Virtual image from a spherical convex mirror"
          description="See the image formed when it is reflected in a convex spherical mirror."
          url="/convex-spherical-mirror"
        />
      </ul>
      <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-2 lg:gap-4 xl:max-h-[34rem]">
        <GridItem
          area="md:[grid-area:1/1] sm:[grid-area:2]"
          icon={<Box className="h-4 w-4 text-black dark:text-neutral-400" />}
          title="Task 11"
          description="RAINBOW PHYSICS! Using Descartes' model to plot the elevation angles of primary and 
secondary rainbows.
"
          url="/reflection-on-plane-mirror"
        />

        <GridItem
          area="md:[grid-area:1/2] sm:[grid-area:2]"
          icon={
            <Settings className="h-4 w-4 text-black dark:text-neutral-400" />
          }
          title="Task 12"
          description="A dynamic model of the path of a beam of white light through a triangular prism."
          url="/image-from-thin-lens"
        />
      </ul>
    </div>
  );
}

interface GridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  url: string;
}

const GridItem = ({ area, icon, title, description, url }: GridItemProps) => {
  return (
    <li
      className={`min-h-[14rem] list-none hover:cursor-pointer ${area}`}
      onClick={() => {
        location.href = url;
      }}
    >
      <div className="relative h-full rounded-2xl border p-2 md:rounded-3xl md:p-3">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
        />
        <div className="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 dark:shadow-[0px_0px_27px_0px_#2D2D2D]">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg border border-gray-600 p-2">
              {icon}
            </div>
            <div className="space-y-3">
              <h3 className="-tracking-4 pt-0.5 font-sans text-xl/[1.375rem] font-semibold text-balance text-black md:text-2xl/[1.875rem] dark:text-white">
                {title}
              </h3>
              <h2 className="font-sans text-sm/[1.125rem] text-black md:text-base/[1.375rem] dark:text-neutral-400 [&_b]:md:font-semibold [&_strong]:md:font-semibold">
                {description}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};
