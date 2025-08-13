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
  const [circleRadius, setCircleRadius] = useState(3); // Adjustable radius R
  const [sectorDegrees, setSectorDegrees] = useState(180); // Adjustable sector angle in degrees

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

  // Map each pixel to its position in the arc sector
  const calculateImagePosition = (imgX: number, imgY: number) => {
    const baseCenter = { x: 0, y: -Math.sqrt(2) / 2 };

    // Figure out which row this pixel is in (bottom = 0, top = 1)
    const imgH = Math.sqrt(2);
    const rowPosition = (imgY + imgH / 2) / imgH;

    // Map the row to an arc radius - bottom rows go on outer arc, top rows on inner arc
    const innerRadius = 1;
    const outerRadius = circleRadius;
    const mappedR = outerRadius - rowPosition * (outerRadius - innerRadius);

    // Map horizontal position to angle within the sector
    const imgW = Math.sqrt(2);
    const horizontalPosition = 1 - (imgX + imgW / 2) / imgW;

    // Convert to the right angle for the sector
    const sectorSpanRad = (sectorDegrees * Math.PI) / 180;
    const startAngle = (90 - sectorDegrees / 2) * (Math.PI / 180);
    const mappedTheta = startAngle + horizontalPosition * sectorSpanRad;

    // Calculate where this pixel should go
    const mappedX = baseCenter.x + mappedR * Math.cos(mappedTheta);
    const mappedY = baseCenter.y + mappedR * -Math.sin(mappedTheta);

    return { x: mappedX, y: mappedY, type: "real" };
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
            <div className="flex flex-col space-y-2">
              <label className="text-white text-sm">
                Circle Radius R: {circleRadius}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="0.1"
                value={circleRadius}
                onChange={(e) => setCircleRadius(parseFloat(e.target.value))}
                className="w-32"
              />
            </div>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <div className="flex flex-col space-y-2">
              <label className="text-white text-sm">
                Sector Degrees: {sectorDegrees}°
              </label>
              <input
                type="range"
                min="30"
                max="360"
                step="10"
                value={sectorDegrees}
                onChange={(e) => setSectorDegrees(parseInt(e.target.value))}
                className="w-32"
              />
            </div>
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

          // Draw two circles centered at (0, -√2/2)
          const circleCenter = { x: 0, y: -Math.sqrt(2) / 2 };

          // Convert degrees to radians and adjust for positive y-axis opening
          const startAngle = (90 - sectorDegrees / 2) * (Math.PI / 180); // Start angle
          const endAngle = (90 + sectorDegrees / 2) * (Math.PI / 180); // End angle

          // Draw unit circle as a sector matching the outer arc
          ctx.strokeStyle = "#00ff00";
          ctx.lineWidth = 2;
          ctx.setLineDash([]);
          ctx.beginPath();

          // Draw the arc for unit circle
          ctx.arc(
            screen(circleCenter.x, circleCenter.y).x,
            screen(circleCenter.x, circleCenter.y).y,
            1 * vp.scale,
            startAngle,
            endAngle
          );

          ctx.stroke();

          // Draw line connecting the opening edges of the two sectors
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1;
          ctx.setLineDash([]);
          ctx.beginPath();

          // Calculate the opening point of inner sector (radius 1)
          const innerOpeningX = circleCenter.x + 1 * Math.cos(startAngle);
          const innerOpeningY = circleCenter.y + 1 * -Math.sin(startAngle);

          // Calculate the opening point of outer sector (radius R)
          const outerOpeningX =
            circleCenter.x + circleRadius * Math.cos(startAngle);
          const outerOpeningY =
            circleCenter.y + circleRadius * -Math.sin(startAngle);

          // Draw line from inner to outer opening
          ctx.moveTo(
            screen(innerOpeningX, innerOpeningY).x,
            screen(innerOpeningX, innerOpeningY).y
          );
          ctx.lineTo(
            screen(outerOpeningX, outerOpeningY).x,
            screen(outerOpeningX, outerOpeningY).y
          );
          ctx.stroke();

          // Draw line connecting the closing edges of the two sectors (other side)
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1;
          ctx.setLineDash([]);
          ctx.beginPath();

          // Calculate the closing point of inner sector (radius 1)
          const innerClosingX = circleCenter.x + 1 * Math.cos(endAngle);
          const innerClosingY = circleCenter.y + 1 * -Math.sin(endAngle);

          // Calculate the closing point of outer sector (radius R)
          const outerClosingX =
            circleCenter.x + circleRadius * Math.cos(endAngle);
          const outerClosingY =
            circleCenter.y + circleRadius * -Math.sin(endAngle);

          // Draw line from inner to outer closing
          ctx.moveTo(
            screen(innerClosingX, innerClosingY).x,
            screen(innerClosingX, innerClosingY).y
          );
          ctx.lineTo(
            screen(outerClosingX, outerClosingY).x,
            screen(outerClosingX, outerClosingY).y
          );
          ctx.stroke();

          // Draw sector with adjustable radius R and angle
          ctx.strokeStyle = "#ff6600";
          ctx.lineWidth = 2;
          ctx.setLineDash([]);
          ctx.beginPath();

          // Draw the arc
          ctx.arc(
            screen(circleCenter.x, circleCenter.y).x,
            screen(circleCenter.x, circleCenter.y).y,
            circleRadius * vp.scale,
            startAngle,
            endAngle
          );

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
                      Properties:
                    </div>
                    <div className="text-center text-black dark:text-white">
                      R = radius of outer arc
                    </div>
                    <div className="text-center text-black dark:text-white">
                      degrees = sector angle
                    </div>
                    <div className="text-xs mt-1 text-yellow-600 dark:text-yellow-400">
                      Center of arc at base of the image
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-600 p-3 bg-gray-50 dark:bg-gray-900">
                    <div className="font-bold text-black dark:text-white">
                      Anamorphic Projection:
                    </div>
                    <div className="text-center text-black dark:text-white">
                      If you place a polished cylinder over
                    </div>
                    <div className="text-center text-black dark:text-white">
                      the unit circle, you will create an
                    </div>
                    <div className="text-center text-black dark:text-white">
                      anamorphic image. It will appear to
                    </div>
                    <div className="text-center text-black dark:text-white">
                      look somewhat three dimensional.
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
