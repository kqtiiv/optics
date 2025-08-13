"use client";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import CoordinateGrid from "@/components/coordinate-grid";
import React, { useState, useRef } from "react";
import { useTheme } from "@/components/theme-provider";
import { NavbarLogo } from "@/components/ui/resizable-navbar";
import { GlowingEffect } from "@/components/ui/glowing-effect";

interface RainbowSimulationProps {
  solarAngle?: number;
}

const RainbowSimulation: React.FC<RainbowSimulationProps> = () => {
  const { setTheme } = useTheme();
  setTheme("dark");

  // no scrollbar
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";

  const [solarAngle, setSolarAngle] = useState(5); // Solar elevation angle in degrees
  const [showInfo, setShowInfo] = useState(false);
  const [isDraggingPopup, setIsDraggingPopup] = useState(false);
  const [popupPos, setPopupPos] = useState({ x: 100, y: 100 });
  const popupDragOffset = useRef({ x: 0, y: 0 });

  // Rainbow physics constants
  const PRIMARY_RAINBOW_ANGLE = 42; // Primary rainbow angular radius (degrees)
  const SECONDARY_RAINBOW_ANGLE = 51; // Secondary rainbow angular radius (degrees)
  const ALEXANDERS_DARK_BAND_WIDTH = 9; // Width of Alexander's dark band (degrees)

  // Popup drag handlers
  const handlePopupMouseDown = (e: React.MouseEvent) => {
    setIsDraggingPopup(true);
    popupDragOffset.current = {
      x: e.clientX - popupPos.x,
      y: e.clientY - popupPos.y,
    };
  };

  const handlePopupMouseMove = (e: MouseEvent) => {
    if (!isDraggingPopup) return;
    setPopupPos({
      x: e.clientX - popupDragOffset.current.x,
      y: e.clientY - popupDragOffset.current.y,
    });
  };

  const handlePopupMouseUp = () => {
    setIsDraggingPopup(false);
  };

  // Add popup drag event listeners
  React.useEffect(() => {
    if (isDraggingPopup) {
      document.addEventListener("mousemove", handlePopupMouseMove);
      document.addEventListener("mouseup", handlePopupMouseUp);
      return () => {
        document.removeEventListener("mousemove", handlePopupMouseMove);
        document.removeEventListener("mouseup", handlePopupMouseUp);
      };
    }
  }, [isDraggingPopup]);

  // Convert degrees to radians
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  // Convert radians to degrees
  const toDegrees = (radians: number) => (radians * 180) / Math.PI;

  // Calculate visible rainbow arc based on solar angle
  const calculateVisibleArc = (rainbowAngle: number) => {
    const solarRad = toRadians(solarAngle);
    const rainbowRad = toRadians(rainbowAngle);

    // Calculate the maximum visible angle above horizon
    const maxVisibleAngle = Math.PI - solarRad - rainbowRad;

    if (maxVisibleAngle <= 0) {
      return { startAngle: 0, endAngle: 0, visible: false };
    }

    // Convert to degrees and determine arc range
    const maxVisibleDegrees = toDegrees(maxVisibleAngle);
    const arcRange = Math.min(180, 2 * maxVisibleDegrees);

    return {
      startAngle: -arcRange / 2,
      endAngle: arcRange / 2,
      visible: true,
      arcLength: arcRange,
    };
  };

  // Draw rainbow arc
  const drawRainbowArc = (
    ctx: CanvasRenderingContext2D,
    screen: (x: number, y: number) => { x: number; y: number },
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    colors: string[],
    isSecondary: boolean = false
  ) => {
    if (startAngle === endAngle) return;

    const startRad = toRadians(startAngle);
    const endRad = toRadians(endAngle);

    // For secondary rainbow, reverse color order
    const rainbowColors = isSecondary ? [...colors].reverse() : colors;

    // Calculate color band width
    const totalArc = Math.abs(endRad - startRad);
    const bandWidth = totalArc / rainbowColors.length;

    ctx.lineWidth = 8;

    rainbowColors.forEach((color, index) => {
      const bandStart = startRad + index * bandWidth;
      const bandEnd = bandStart + bandWidth;

      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, bandStart, bandEnd);
      ctx.stroke();
    });
  };

  return (
    <div>
      <NavigationMenu viewport={false} className="z-10 p-1 m-auto bg-black">
        <NavigationMenuList>
          <NavigationMenuItem>
            <label className="text-white mr-2">
              Solar Angle: {solarAngle}°
            </label>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <input
              type="range"
              min="0"
              max="90"
              value={solarAngle}
              onChange={(e) => setSolarAngle(Number(e.target.value))}
              className="w-32"
            />
          </NavigationMenuItem>
          <NavigationMenuItem>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {showInfo ? "Hide" : "Show"} Information
            </button>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavbarLogo />
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <CoordinateGrid
        initialViewport={{ cx: 0, cy: 0, scale: 150 }}
        disablePan={true}
        renderOverlay={(ctx, vp) => {
          const canvas = ctx.canvas;
          const screen = (x: number, y: number) => {
            const cw = canvas.clientWidth,
              ch = canvas.clientHeight;
            return {
              x: cw / 2 + (x - vp.cx) * vp.scale,
              y: ch / 2 - (y - vp.cy) * vp.scale,
            };
          };

          // Draw horizon line (horizontal) at y=0
          ctx.strokeStyle = "#666666";
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(0, screen(0, 0).y);
          ctx.lineTo(screen(20, 0).x, screen(20, 0).y);
          ctx.stroke();
          ctx.setLineDash([]);

          // Draw horizon label
          ctx.fillStyle = "#ffffff";
          ctx.font = "14px Arial";
          ctx.textAlign = "left";
          ctx.fillText("Horizon", screen(0.5, 0).x, screen(0.5, 0).y + 20);

          // Calculate visible arcs
          const primaryArc = calculateVisibleArc(PRIMARY_RAINBOW_ANGLE);
          const secondaryArc = calculateVisibleArc(SECONDARY_RAINBOW_ANGLE);

          // Rainbow colors (VIBGYOR)
          const primaryColors = [
            "#9400D3", // Violet
            "#4B0082", // Indigo
            "#0000FF", // Blue
            "#00FF00", // Green
            "#FFFF00", // Yellow
            "#FF7F00", // Orange
            "#FF0000", // Red
          ];

          const secondaryColors = [
            "#FF0000", // Red
            "#FF7F00", // Orange
            "#FFFF00", // Yellow
            "#00FF00", // Green
            "#0000FF", // Blue
            "#4B0082", // Indigo
            "#9400D3", // Violet
          ];

          // Draw secondary rainbow (outer, fainter) above horizon
          if (secondaryArc.visible) {
            ctx.globalAlpha = 0.6; // Make secondary rainbow fainter
            drawRainbowArc(
              ctx,
              screen,
              screen(0, 0).x,
              screen(0, 0).y,
              (SECONDARY_RAINBOW_ANGLE * vp.scale) / 10,
              secondaryArc.startAngle,
              secondaryArc.endAngle,
              secondaryColors,
              true
            );
            ctx.globalAlpha = 1.0;
          }

          // Draw primary rainbow (inner, brighter) above horizon
          if (primaryArc.visible) {
            drawRainbowArc(
              ctx,
              screen,
              screen(0, 0).x,
              screen(0, 0).y,
              (PRIMARY_RAINBOW_ANGLE * vp.scale) / 10,
              primaryArc.startAngle,
              primaryArc.endAngle,
              primaryColors,
              false
            );
          }

          // Draw Alexander's dark band between rainbows above horizon
          if (primaryArc.visible && secondaryArc.visible) {
            const darkBandRadius =
              ((PRIMARY_RAINBOW_ANGLE + ALEXANDERS_DARK_BAND_WIDTH / 2) *
                vp.scale) /
              10;
            ctx.strokeStyle = "#333333";
            ctx.lineWidth = 12;
            ctx.beginPath();
            ctx.arc(
              screen(0, 0).x,
              screen(0, 0).y,
              darkBandRadius,
              toRadians(primaryArc.startAngle),
              toRadians(primaryArc.endAngle)
            );
            ctx.stroke();
          }

          // Draw solar angle indicator
          const solarRadius = 3;
          const solarAngleRad = toRadians(solarAngle);
          const solarX = Math.cos(solarAngleRad) * solarRadius;
          const solarY = -Math.sin(solarAngleRad) * solarRadius; // Negative because canvas Y is inverted

          ctx.fillStyle = "#FFFF00";
          ctx.strokeStyle = "#FFA500";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(
            screen(solarX, solarY).x,
            screen(solarX, solarY).y,
            8,
            0,
            2 * Math.PI
          );
          ctx.fill();
          ctx.stroke();

          // Solar angle label
          ctx.fillStyle = "#FFFF00";
          ctx.font = "12px Arial";
          ctx.textAlign = "center";
          ctx.fillText(
            "☀",
            screen(solarX, solarY).x,
            screen(solarX, solarY).y + 4
          );

          // Draw coordinate labels
          ctx.fillStyle = "#ffffff";
          ctx.font = "12px Arial";
          ctx.textAlign = "center";

          // Primary rainbow label
          if (primaryArc.visible && primaryArc.arcLength !== undefined) {
            const labelAngle =
              (primaryArc.startAngle + primaryArc.endAngle) / 2;
            const labelRadius = (PRIMARY_RAINBOW_ANGLE * vp.scale) / 10;
            const labelX = Math.cos(toRadians(labelAngle)) * labelRadius;
            const labelY = -Math.sin(toRadians(labelAngle)) * labelRadius;

            ctx.fillText(
              `Primary (${primaryArc.arcLength.toFixed(1)}°)`,
              screen(labelX, labelY).x,
              screen(labelX, labelY).y
            );
          }

          // Secondary rainbow label
          if (secondaryArc.visible && secondaryArc.arcLength !== undefined) {
            const labelAngle =
              (secondaryArc.startAngle + secondaryArc.endAngle) / 2;
            const labelRadius = (SECONDARY_RAINBOW_ANGLE * vp.scale) / 10;
            const labelX = Math.cos(toRadians(labelAngle)) * labelRadius;
            const labelY = -Math.sin(toRadians(labelAngle)) * labelRadius;

            ctx.fillText(
              `Secondary (${secondaryArc.arcLength.toFixed(1)}°)`,
              screen(labelX, labelY).x,
              screen(labelX, labelY).y
            );
          }

          // Solar angle info
          ctx.fillStyle = "#FFFF00";
          ctx.font = "14px Arial";
          ctx.textAlign = "left";
          ctx.fillText(
            `Solar Elevation: ${solarAngle}°`,
            screen(-8, 8).x,
            screen(-8, 8).y
          );

          // Visibility status
          ctx.fillStyle = primaryArc.visible ? "#00FF00" : "#FF0000";
          ctx.fillText(
            `Primary Rainbow: ${
              primaryArc.visible ? "Visible" : "Not Visible"
            }`,
            screen(-8, 6).x,
            screen(-8, 6).y
          );

          ctx.fillStyle = secondaryArc.visible ? "#00FF00" : "#FF0000";
          ctx.fillText(
            `Secondary Rainbow: ${
              secondaryArc.visible ? "Visible" : "Not Visible"
            }`,
            screen(-8, 4).x,
            screen(-8, 4).y
          );
        }}
      />

      {/* Floating Information Popup */}
      {showInfo && (
        <div
          className="fixed max-w-sm z-[999999] cursor-move"
          style={{
            left: `${popupPos.x}px`,
            top: `${popupPos.y}px`,
          }}
        >
          <div className="relative rounded-2xl border p-2 md:rounded-3xl md:p-3">
            <GlowingEffect
              spread={40}
              glow={true}
              disabled={false}
              proximity={64}
              inactiveZone={0.01}
            />
            <div className="border-0.75 relative flex flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 dark:shadow-[0px_0px_27px_0px_#2D2D2D] bg-white dark:bg-black">
              <div className="relative flex flex-1 flex-col justify-between gap-3">
                <div
                  className="flex justify-between items-center cursor-move select-none"
                  onMouseDown={handlePopupMouseDown}
                >
                  <h3 className="-tracking-4 pt-0.5 font-sans text-xl/[1.375rem] font-semibold text-balance text-black md:text-2xl/[1.875rem] dark:text-white">
                    Rainbow Physics
                  </h3>
                  <button
                    onClick={() => setShowInfo(false)}
                    className="text-gray-400 hover:text-white text-xl"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="rounded-lg border border-gray-600 p-3 bg-gray-50 dark:bg-gray-900">
                    <div className="font-bold text-black dark:text-white">
                      Rainbow Formation:
                    </div>
                    <div className="text-sm text-black dark:text-white space-y-1">
                      <div>• Primary: 42° angular radius</div>
                      <div>• Secondary: 51° angular radius</div>
                      <div>• Alexander's Dark Band: 9° width</div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-600 p-3 bg-gray-50 dark:bg-gray-900">
                    <div className="font-bold text-black dark:text-white">
                      Solar Angle Effects:
                    </div>
                    <div className="text-sm text-black dark:text-white space-y-1">
                      <div>• Lower angles: Full rainbow arcs visible</div>
                      <div>• Higher angles: Arcs become flatter</div>
                      <div>• Above 42°: Primary rainbow disappears</div>
                      <div>• Above 51°: Secondary rainbow disappears</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div>
                      • Rainbows form when sunlight reflects off water droplets
                    </div>
                    <div>• Primary rainbow: Single internal reflection</div>
                    <div>• Secondary rainbow: Double internal reflection</div>
                    <div>
                      • Color order reverses between primary and secondary
                    </div>
                    <div>
                      • Alexander's dark band: Region of reduced light intensity
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Rainbow() {
  return <RainbowSimulation />;
}
