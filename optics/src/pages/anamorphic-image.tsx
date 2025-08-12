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

interface ConvexMirrorSimulationProps {
  radiusOfCurvature?: number;
}

const ConvexMirrorSimulation: React.FC<ConvexMirrorSimulationProps> = () => {
  const { setTheme } = useTheme();
  setTheme("dark");

  // no scrollbar
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [objPos, setObjPos] = useState({ x: 5, y: 0 }); // object position - initially at (0, 6)
  const [radiusOfCurvature, setRadiusOfCurvature] = useState(0.5); // radius of curvature - match the diagram

  const [showEquations, setShowEquations] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
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
  };

  // Convert screen pixel → world coordinate
  const screenToWorld = (
    px: number,
    py: number,
    vp: { cx: number; cy: number; scale: number },
    canvas: HTMLCanvasElement
  ) => {
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    return {
      x: (px - cw / 2) / vp.scale + vp.cx,
      y: (ch / 2 - py) / vp.scale + vp.cy,
    };
  };

  // Calculate image position using convex mirror equations from the image
  const calculateImagePosition = (objX: number, objY: number) => {
    const R = radiusOfCurvature;

    // Check if the point is within the mirror bounds
    if (Math.abs(objY) > R) return null; // Point outside mirror bounds

    // Using the exact equations from the image:
    // α = (1/2) × tan⁻¹(y/x)  - where α is the angle of reflection
    // k = x / cos(2α)
    // Y = (k × sin(α)) / ((k/R) - cos(α) + (x/y) × sin(α))
    // X = x - (Y/y)

    const alpha = 0.5 * Math.atan2(objY, objX); // Angle of reflection
    const k = objX / Math.cos(2 * alpha);

    const numerator = k * Math.sin(alpha);
    const denominator =
      k / R - Math.cos(alpha) + (objX / objY) * Math.sin(alpha);

    if (Math.abs(denominator) < 1e-10) return null; // Avoid division by zero

    const Y = numerator / denominator;
    const X = (objX * Y) / objY; // Exact formula from image: X = x - (Y/y)

    // For convex mirrors, all images are virtual (behind mirror)
    return { x: X, y: Y, type: "virtual" };
  };

  // Create convex mirror shape
  const createMirrorShape = (
    ctx: CanvasRenderingContext2D,
    screen: (x: number, y: number) => { x: number; y: number },
    vp: { cx: number; cy: number; scale: number }
  ) => {
    // Create convex mirror as a semicircle with radius 5, normal at x=0
    // For convex mirror, the curved surface faces outward (toward positive x)
    ctx.beginPath();
    ctx.arc(
      screen(0, 0).x, // Center at origin
      screen(0, 0).y,
      radiusOfCurvature * vp.scale, // Use actual radius scaled by viewport
      -Math.PI / 2, // Start angle (top side)
      Math.PI / 2 // End angle (bottom side) - creates vertical semicircle curved outward
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
            <label className="text-white mr-2">Radius of Curvature:</label>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={radiusOfCurvature}
              onChange={(e) => setRadiusOfCurvature(parseFloat(e.target.value))}
              className="w-20"
            />
            <span className="text-white ml-2">{radiusOfCurvature}</span>
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
        onMouseDown={(
          e: React.MouseEvent,
          vp: { cx: number; cy: number; scale: number },
          canvas: HTMLCanvasElement
        ) => {
          if (!imageSrc) return;
          const mouseWorld = screenToWorld(e.clientX, e.clientY, vp, canvas);

          // Assume image width/height in world units
          const imgW = 0.5;
          const imgH = 0.5;

          // Check if clicked inside object bounds
          if (
            mouseWorld.x >= objPos.x - imgW / 2 &&
            mouseWorld.x <= objPos.x + imgW / 2 &&
            mouseWorld.y >= objPos.y - imgH / 2 &&
            mouseWorld.y <= objPos.y + imgH / 2
          ) {
            setIsDragging(true);
            dragOffset.current = {
              x: mouseWorld.x - objPos.x,
              y: mouseWorld.y - objPos.y,
            };
          }
        }}
        onMouseMove={(
          e: React.MouseEvent,
          vp: { cx: number; cy: number; scale: number },
          canvas: HTMLCanvasElement
        ) => {
          if (!isDragging) return;
          const mouseWorld = screenToWorld(e.clientX, e.clientY, vp, canvas);

          // Allow object to be placed anywhere
          let newX = mouseWorld.x - dragOffset.current.x;

          // Ensure object doesn't get too close to the mirror (minimum distance)
          newX = Math.max(0.1, newX);
          setObjPos({
            x: newX,
            y: mouseWorld.y - dragOffset.current.y,
          });
        }}
        onMouseUp={() => {
          setIsDragging(false);
        }}
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

          // Draw mirror at x=0

          ctx.strokeStyle = "#0066cc";
          ctx.fillStyle = "rgba(0, 102, 204, 0.2)";
          ctx.lineWidth = 2;

          createMirrorShape(ctx, screen, vp);
          ctx.stroke();

          // Add mirror center line for better visibility (vertical orientation)
          ctx.strokeStyle = "#0066cc";
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);
          ctx.beginPath();

          // Draw center of curvature and focal point
          const center = screen(0, 0);
          const focalPoint = screen(radiusOfCurvature / 2, 0); // Focal point is behind convex mirror

          // Draw center of curvature
          ctx.fillStyle = "#0066cc";
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(center.x, center.y, 5, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();

          // Draw focal point
          ctx.fillStyle = "#ff6600";
          ctx.beginPath();
          ctx.arc(focalPoint.x, focalPoint.y, 5, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();

          // Add labels
          ctx.fillStyle = "#ffffff";
          ctx.font = "12px Arial";
          ctx.textAlign = "center";
          ctx.fillText("C", center.x, center.y - 10);
          ctx.fillText("F", focalPoint.x, focalPoint.y - 10);

          // Draw uploaded image + calculated image
          if (imageSrc) {
            if (!imgRef.current) {
              imgRef.current = new Image();
              imgRef.current.src = imageSrc;
            }
            const img = imgRef.current;
            const imgW = 1; // Width in world coordinates
            const imgH = 1; // Height in world coordinates

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
            const imagePos = calculateImagePosition(objPos.x, objPos.y);
            if (imagePos) {
              ctx.save();

              // Draw the warped image directly onto the main canvas
              // Using the convex mirror equations to map each pixel to its correct position
              const pixelResolution = 200; // Resolution for performance

              // Map each pixel of the source image using the convex mirror equations
              for (let y = 0; y < pixelResolution; y++) {
                for (let x = 0; x < pixelResolution; x++) {
                  // Convert pixel coordinates to world coordinates
                  const worldX =
                    objPos.x - imgW / 2 + (imgW * x) / pixelResolution;
                  const worldY =
                    objPos.y - imgH / 2 + (imgH * y) / pixelResolution;

                  // Calculate where this specific pixel appears using the convex mirror equations
                  // This ensures the image forms exactly where the construction lines meet
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

            // Draw ray tracing construction lines (only if we have an image position)
            if (imagePos) {
              // Calculate where the horizontal ray hits the mirror surface
              const R = radiusOfCurvature;
              const mirrorX = Math.sqrt(R * R - objPos.y * objPos.y); // For convex mirror, surface is at positive x
              const mirrorY = objPos.y;

              // Main rays (solid lines, brighter color)
              ctx.strokeStyle = "#ff4444";
              ctx.lineWidth = 3;
              ctx.setLineDash([]);

              // Ray 1: Parallel ray from object to mirror, then reflected
              // This ray travels horizontally from object to mirror
              const ray1Start = screen(objPos.x, objPos.y);
              const ray1Mirror = screen(mirrorX, mirrorY); // Where horizontal ray hits mirror

              // Draw the horizontal incident ray
              ctx.beginPath();
              ctx.moveTo(ray1Start.x, ray1Start.y);
              ctx.lineTo(ray1Mirror.x, ray1Mirror.y);
              ctx.stroke();

              // Draw the reflected ray from mirror (diverging outward)
              // For convex mirror, reflected ray diverges away from mirror
              // Calculate the normal vector at the reflection point
              const normalX = mirrorX - 0; // Vector from center to mirror point
              const normalY = mirrorY - 0;
              const normalLength = Math.sqrt(
                normalX * normalX + normalY * normalY
              );
              const unitNormalX = normalX / normalLength;
              const unitNormalY = normalY / normalLength;

              // Calculate incident ray vector (from object to mirror)
              const incidentX = mirrorX - objPos.x;
              const incidentY = mirrorY - objPos.y;

              // Calculate reflection using the law of reflection: r = i - 2(i·n)n
              // where r is reflected vector, i is incident vector, n is normal vector
              const dotProduct =
                incidentX * unitNormalX + incidentY * unitNormalY;
              const reflectedX = incidentX - 2 * dotProduct * unitNormalX;
              const reflectedY = incidentY - 2 * dotProduct * unitNormalY;

              // Normalize and scale the reflected vector
              const reflectedLength = 2;
              const reflectedMagnitude = Math.sqrt(
                reflectedX * reflectedX + reflectedY * reflectedY
              );
              const ray1ReflectedEnd = screen(
                mirrorX + (reflectedX / reflectedMagnitude) * reflectedLength,
                mirrorY + (reflectedY / reflectedMagnitude) * reflectedLength
              );

              ctx.beginPath();
              ctx.moveTo(ray1Mirror.x, ray1Mirror.y);
              ctx.lineTo(ray1ReflectedEnd.x, ray1ReflectedEnd.y);
              ctx.stroke();

              // Extend the reflected ray backwards (virtual extension) until it hits the construction line
              // Calculate the intersection with the line from image to origin
              const extendedLength = 10; // Long enough to ensure intersection
              const ray1ExtendedEnd = screen(
                mirrorX - (reflectedX / reflectedMagnitude) * extendedLength,
                mirrorY - (reflectedY / reflectedMagnitude) * extendedLength
              );

              // Draw the extended reflected ray (dashed, same color as reflected ray)
              ctx.strokeStyle = "#ff4444";
              ctx.lineWidth = 3;
              ctx.setLineDash([8, 4]); // Dashed line for extension
              ctx.beginPath();
              ctx.moveTo(ray1Mirror.x, ray1Mirror.y);
              ctx.lineTo(ray1ExtendedEnd.x, ray1ExtendedEnd.y);
              ctx.stroke();

              // Draw the normal at the point of reflection (from origin through reflection point)
              // Extend the normal beyond the mirror surface for better visibility
              ctx.strokeStyle = "#00ff00"; // Green color for normal
              ctx.lineWidth = 2;
              ctx.setLineDash([4, 4]); // Dashed line for normal

              // Calculate normal vector from center to mirror point
              const normalVectorX = mirrorX - 0; // Vector from center to mirror point
              const normalVectorY = mirrorY - 0;
              const normalVectorLength = Math.sqrt(
                normalVectorX * normalVectorX + normalVectorY * normalVectorY
              );

              // Extend normal beyond mirror surface
              const extendedNormalLength = 0.3; // Extension length in world coordinates
              const extendedNormalX =
                mirrorX +
                (normalVectorX / normalVectorLength) * extendedNormalLength;
              const extendedNormalY =
                mirrorY +
                (normalVectorY / normalVectorLength) * extendedNormalLength;

              ctx.beginPath();
              ctx.moveTo(center.x, center.y); // From center of curvature (origin)
              ctx.lineTo(
                screen(extendedNormalX, extendedNormalY).x,
                screen(extendedNormalX, extendedNormalY).y
              ); // Extended beyond mirror
              ctx.stroke();

              // Ray 2: From object through center of curvature
              const ray2Start = screen(objPos.x, objPos.y);
              const ray2Center = screen(0, 0); // Center of curvature

              // Draw the ray from object to center of curvature
              ctx.beginPath();
              ctx.moveTo(ray2Start.x, ray2Start.y);
              ctx.lineTo(ray2Center.x, ray2Center.y);
              ctx.stroke();

              // Draw the normal for Ray 2 (from origin through the point where ray hits mirror)
              // For ray through center, the normal is along the same line
              const ray2MirrorX = Math.sqrt(R * R - objPos.y * objPos.y); // Where ray hits mirror
              const ray2MirrorY = objPos.y;

              // Extend the normal beyond the mirror surface for Ray 2 as well
              const ray2NormalVectorX = ray2MirrorX - 0; // Vector from center to mirror point
              const ray2NormalVectorY = ray2MirrorY - 0;
              const ray2NormalVectorLength = Math.sqrt(
                ray2NormalVectorX * ray2NormalVectorX +
                  ray2NormalVectorY * ray2NormalVectorY
              );

              // Extend normal beyond mirror surface
              const ray2ExtendedNormalLength = 0.3; // Extension length in world coordinates
              const ray2ExtendedNormalX =
                ray2MirrorX +
                (ray2NormalVectorX / ray2NormalVectorLength) *
                  ray2ExtendedNormalLength;
              const ray2ExtendedNormalY =
                ray2MirrorY +
                (ray2NormalVectorY / ray2NormalVectorLength) *
                  ray2ExtendedNormalLength;

              ctx.strokeStyle = "#00ff00"; // Green color for normal
              ctx.lineWidth = 2;
              ctx.setLineDash([4, 4]); // Dashed line for normal
              ctx.beginPath();
              ctx.moveTo(center.x, center.y); // From center of curvature (origin)
              ctx.lineTo(
                screen(ray2ExtendedNormalX, ray2ExtendedNormalY).x,
                screen(ray2ExtendedNormalX, ray2ExtendedNormalY).y
              ); // Extended beyond mirror
              ctx.stroke();

              // Reset line style
              ctx.setLineDash([]);
              ctx.lineWidth = 1;
            }
          }

          // Draw coordinate labels
          ctx.fillStyle = "#ffffff";
          ctx.font = "14px Arial";
          ctx.textAlign = "center";

          // Object label
          const objLabel = screen(objPos.x, objPos.y + 0.8);
          ctx.fillText("(x, y)", objLabel.x, objLabel.y);

          // Image label
          if (imageSrc) {
            const imagePos = calculateImagePosition(objPos.x, objPos.y);
            if (imagePos) {
              const imgLabel = screen(imagePos.x, imagePos.y - 0.8);
              const imageType =
                imagePos.type === "virtual" ? "Virtual" : "Real";
              ctx.fillText(
                `(${imagePos.x.toFixed(2)}, ${imagePos.y.toFixed(2)})`,
                imgLabel.x,
                imgLabel.y
              );
              ctx.fillText(imageType, imgLabel.x, imgLabel.y - 20);
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
                      All images are virtual (X &gt; 0, behind mirror)
                    </div>
                    <div className="text-center text-black dark:text-white">
                      Images are upright and diminished
                    </div>
                    <div className="text-xs mt-1 text-blue-600 dark:text-blue-400">
                      Each pixel follows convex mirror equations
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div>• Convex mirror forms virtual, upright images</div>
                    <div>• Center of curvature at origin (0, 0)</div>
                    <div>• Focal point at (R/2, 0) behind mirror</div>
                    <div>• Image formed using convex mirror equations</div>
                    <div className="mt-2 p-2 bg-gray-800 rounded border border-gray-600">
                      <div className="font-mono text-xs">
                        <div>α = (1/2) × tan⁻¹(y/x)</div>
                        <div>k = x / cos(2α)</div>
                        <div>
                          Y = (k × sin(α)) / (k/R - cos(α) + (x/y) × sin(α))
                        </div>
                        <div>X = x - Y/y</div>
                      </div>
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

export default function ConvexSphericalMirror() {
  return <ConvexMirrorSimulation />;
}
