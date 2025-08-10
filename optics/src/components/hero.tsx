"use client";

import { motion } from "motion/react";

export default function Hero() {
  return (
    <motion.div
      initial={{ opacity: 0.0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.3,
        duration: 0.8,
        ease: "easeInOut",
      }}
      className="flex flex-col gap-4 items-center pt-50 px-4 h-[100vh]"
    >
      <div className="text-3xl md:text-7xl font-bold dark:text-white text-center">
        An optics simulation
      </div>
      <div className="font-extralight text-base md:text-4xl dark:text-neutral-200 py-4">
        by Katie and Olin
      </div>
    </motion.div>
  );
}
