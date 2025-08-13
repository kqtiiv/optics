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

export default function AnamorphicImage() {
  const { setTheme } = useTheme();
  setTheme("dark");

  // no scrollbar
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [objPos] = useState({ x: 0, y: 0 }); // object position - fixed behind mirror (virtual image)
  const radiusOfCurvature = 1;

  const [showEquations, setShowEquations] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Popup state for equations
  const [isDraggingPopup, setIsDraggingPopup] = useState(false);
  const [popupPos, setPopupPos] = useState({ x: 100, y: 100 });
  const popupDragOffset = useRef({ x: 0, y: 0 });

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // console.log("file read");
  };

  // Calculate image position
  const calculateImagePosition = (imgX: number, imgY: number) => {
    const R = radiusOfCurvature;

    const alpha = 0.5 * Math.atan2(imgY, imgX);

    const k_n = R * (imgY * Math.cos(alpha) - imgX * Math.sin(alpha));
    const k_d = imgY - R * Math.sin(alpha);

    // console.log(imgX, imgY, k_d);

    if (Math.abs(k_d) < 1e-12) return null;

    const k = k_n / k_d;
    const Ycalc = k * Math.sin(2 * alpha);
    const Xcalc = k * Math.cos(2 * alpha);
    // console.log("calculateImagePosition called:", Xcalc, Ycalc);

    return { x: Xcalc, y: Ycalc, type: "real" };
  };

  // Create convex mirror shape
  const createMirrorShape = (
    ctx: CanvasRenderingContext2D,
    screen: (x: number, y: number) => { x: number; y: number },
    vp: { cx: number; cy: number; scale: number }
  ) => {
    // Create convex mirror as a full circle with radius R, center at (0, √2/2)
    // For convex mirror, the curved surface faces outward (toward positive x)
    ctx.beginPath();
    ctx.arc(
      screen(0, 0).x,
      screen(0, 0).y,
      radiusOfCurvature * vp.scale, // Use actual radius scaled by viewport
      0, // Start angle
      2 * Math.PI // End angle - creates full circle
    );
  };

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

  return (
    <div>
      <NavigationMenu viewport={false} className="z-10 p-1 m-auto bg-black">
        <NavigationMenuList>
          <NavigationMenuItem>
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </NavigationMenuItem>

          <NavigationMenuItem>
            <button
              onClick={() => setShowEquations(!showEquations)}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {showEquations ? "Hide" : "Show"} Information
            </button>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavbarLogo />
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <CoordinateGrid
        initialViewport={{ cx: 0, cy: 0, scale: 200 }}
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

          ctx.strokeStyle = "#0066cc";
          ctx.fillStyle = "rgba(0, 102, 204, 0.2)";
          ctx.lineWidth = 2;

          createMirrorShape(ctx, screen, vp);
          ctx.fill();
          ctx.stroke();

          // Add mirror center line for better visibility (vertical orientation)
          ctx.strokeStyle = "#0066cc";
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);
          ctx.beginPath();

          // Draw center of curvature
          const center = screen(0, 0);

          // Draw center of curvature
          ctx.fillStyle = "#0066cc";
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(center.x, center.y, 5, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();

          // Add labels
          ctx.fillStyle = "#ffffff";
          ctx.font = "12px Arial";
          ctx.textAlign = "center";
          ctx.fillText("C", center.x, center.y - 10);

          // Draw uploaded image + calculated image
          if (imageSrc) {
            if (!imgRef.current) {
              imgRef.current = new Image();
              imgRef.current.src = imageSrc;
            }
            const img = imgRef.current;
            const imgW = Math.sqrt(2); // Width in world coordinates
            const imgH = Math.sqrt(2); // Height in world coordinates

            // --- Draw original ---
            const topLeft = screen(objPos.x - imgW / 2, objPos.y + imgH / 2);
            const topRight = screen(objPos.x + imgW / 2, objPos.y + imgH / 2);
            const bottomLeft = screen(objPos.x - imgW / 2, objPos.y - imgH / 2);

            ctx.drawImage(
              img,
              topLeft.x,
              topLeft.y,
              topRight.x - topLeft.x,
              bottomLeft.y - topLeft.y
            );

            // --- Draw warped image using convex mirror equations for accurate positioning ---
            if (imageSrc) {
              ctx.save();

              // Draw the warped image directly onto the main canvas
              // Using the convex mirror equations to map each pixel to its correct position
              const pixelResolution = 500; // Resolution for performance

              // Map each pixel of the source image using the convex mirror equations
              for (let y = 0; y < pixelResolution; y++) {
                for (let x = 0; x < pixelResolution; x++) {
                  // Convert pixel coordinates to world coordinates
                  const worldX =
                    objPos.x - imgW / 2 + (imgW * x) / pixelResolution;
                  const worldY =
                    objPos.y - imgH / 2 + (imgH * y) / pixelResolution;

                  const warpedPos = calculateImagePosition(worldX, worldY);

                  if (warpedPos) {
                    // Calculate the source position in the original image
                    const srcX = (x / pixelResolution) * img.width;
                    const srcY = (y / pixelResolution) * img.height;

                    // Calculate the size of each pixel sample
                    const pixelSize = 4; // Fixed pixel size for clear sampling

                    // Draw this pixel at its calculated position from the mirror equations
                    const warpedScreen = screen(warpedPos.x, warpedPos.y);

                    ctx.drawImage(
                      img,
                      srcX,
                      srcY,
                      pixelSize,
                      pixelSize,
                      warpedScreen.x - pixelSize / 2,
                      warpedScreen.y - pixelSize / 2,
                      pixelSize,
                      pixelSize
                    );
                  }
                }
              }

              ctx.restore();
            }
          }
        }}
      />

      {/* Floating Equations Popup */}
      {showEquations && (
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
                    Information
                  </h3>
                  <button
                    onClick={() => setShowEquations(false)}
                    className="text-gray-400 hover:text-white text-xl"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="rounded-lg border border-gray-600 p-3 bg-gray-50 dark:bg-gray-900">
                    <div className="font-bold text-black dark:text-white">
                      Mirror Properties:
                    </div>
                    <div className="text-center text-black dark:text-white">
                      R = radius of curvature
                    </div>
                    <div className="text-center text-black dark:text-white">
                      f = R/2 (focal length)
                    </div>
                    <div className="text-xs mt-1 text-yellow-600 dark:text-yellow-400">
                      Center of curvature at origin
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-600 p-3 bg-gray-50 dark:bg-gray-900">
                    <div className="font-bold text-black dark:text-white">
                      Image Formation:
                    </div>
                    <div className="text-center text-black dark:text-white">
                      Imported image is virtual (X &lt; 0, behind mirror)
                    </div>
                    <div className="text-center text-black dark:text-white">
                      Images are upright and diminished
                    </div>
                    <div className="text-xs mt-1 text-blue-600 dark:text-blue-400">
                      Mapping creates real image in front of mirror
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
}
