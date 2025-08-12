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

interface ThinLensSimulationProps {
  focalLength?: number;
}

const ThinLensSimulation: React.FC<ThinLensSimulationProps> = () => {
  const { setTheme } = useTheme();
  setTheme("dark");

  // no scrollbar
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [objPos, setObjPos] = useState({ x: 1.5, y: 0.5 }); // object position (must be > focal length)
  const [focalLength, setFocalLength] = useState(0.5); // focal length (positive = convex, negative = concave)
  const [lensType, setLensType] = useState<"convex" | "concave">("convex"); // lens type

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

  // Calculate image position using thin lens equation
  const calculateImagePosition = (objX: number, objY: number) => {
    if (lensType === "convex") {
      // Convex lens behavior (positive focal length):
      // - Object outside focal length (x > f): Real, inverted image
      // - Object inside focal length (x < f): Virtual, upright, enlarged image
      if (objX >= focalLength) {
        // Real image - use standard thin lens equation
        const imageX = (-focalLength / (objX - focalLength)) * objX;
        const imageY = (objY / objX) * imageX;
        return { x: imageX, y: imageY, type: "real" as const };
      } else {
        // Virtual image - appears on same side as object
        const imageX = (focalLength / (focalLength - objX)) * objX;
        const imageY = (objY / objX) * imageX;
        return { x: imageX, y: imageY, type: "virtual" as const };
      }
    } else {
      // Concave lens behavior (negative focal length):
      // - Always forms virtual, upright, reduced images for real objects (x > 0)
      // - Image appears on same side as object
      const imageX = (focalLength / (objX - focalLength)) * objX;
      const imageY = (objY / objX) * imageX;
      return { x: imageX, y: imageY, type: "virtual" as const };
    }
  };

  // Create lens shape based on lens type (convex or concave)
  const createLensShape = (
    ctx: CanvasRenderingContext2D,
    screen: (x: number, y: number) => { x: number; y: number }
  ) => {
    const lensHeight = 2.0; // lens height in world units
    const halfHeight = lensHeight / 2;
    const lensWidth = 0.3; // lens thickness
    const halfWidth = lensWidth / 2;

    ctx.beginPath();

    if (lensType === "convex") {
      // Convex lens: bulges outward
      ctx.moveTo(screen(0, halfHeight).x, screen(-halfWidth, halfHeight).y);

      // Left surface curve - control point extends outward to create bulge
      ctx.quadraticCurveTo(
        screen(-halfWidth - 0.2, 0).x,
        screen(-halfWidth - 0.2, 0).y,
        screen(0, -halfHeight).x,
        screen(-halfWidth, -halfHeight).y
      );

      // Right surface curve - control point extends outward to create bulge
      ctx.quadraticCurveTo(
        screen(halfWidth + 0.2, 0).x,
        screen(halfWidth + 0.2, 0).y,
        screen(0, halfHeight).x,
        screen(halfWidth, halfHeight).y
      );
    } else {
      // Concave lens: curves inward
      ctx.moveTo(screen(0, halfHeight).x, screen(-halfWidth, halfHeight).y);

      // Left surface curve - control point extends inward to create indentation
      ctx.quadraticCurveTo(
        screen(-halfWidth + 0.2, 0).x,
        screen(-halfWidth + 0.2, 0).y,
        screen(0, -halfHeight).x,
        screen(-halfWidth, -halfHeight).y
      );

      // Right surface curve - control point extends inward to create indentation
      ctx.quadraticCurveTo(
        screen(halfWidth - 0.2, 0).x,
        screen(halfWidth - 0.2, 0).y,
        screen(0, halfHeight).x,
        screen(halfWidth, halfHeight).y
      );
    }

    ctx.closePath();
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
            <label className="text-white mr-2">Lens Type:</label>
            <select
              value={lensType}
              onChange={(e) => {
                setLensType(e.target.value as "convex" | "concave");
                // Reset focal length when switching lens types
                if (e.target.value === "convex") {
                  setFocalLength(0.5);
                } else {
                  setFocalLength(-0.5);
                }
              }}
              className="bg-gray-800 text-white px-2 py-1 rounded"
            >
              <option value="convex">Convex</option>
              <option value="concave">Concave</option>
            </select>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <label className="text-white mr-2">Focal Length:</label>
            <input
              type="range"
              min={lensType === "convex" ? "0.5" : "-5.0"}
              max={lensType === "convex" ? "5.0" : "-0.1"}
              step="0.1"
              value={focalLength}
              onChange={(e) => setFocalLength(parseFloat(e.target.value))}
              className="w-20"
            />
            <span className="text-white ml-2">{focalLength}</span>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <button
              onClick={() => setShowEquations(!showEquations)}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {showEquations ? "Hide" : "Show"} Equations
            </button>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavbarLogo />
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <CoordinateGrid
        initialViewport={{ cx: 0, cy: 0, scale: 100 }}
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

          // Allow object to be placed anywhere for both lens types
          // This enables virtual image formation when object is inside focal length
          let newX = mouseWorld.x - dragOffset.current.x;

          // Ensure object doesn't get too close to the lens (minimum distance)
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

          // Draw lens at x=0 using PhET-style lens shape
          const lensHeight = 2.0;
          const halfHeight = lensHeight / 2;

          ctx.strokeStyle = "#00aaff";
          ctx.fillStyle = "rgba(0, 170, 255, 0.2)";
          ctx.lineWidth = 2;

          createLensShape(ctx, screen);
          ctx.fill();
          ctx.stroke();

          // Add lens center line for better visibility
          ctx.strokeStyle = "#00aaff";
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.moveTo(screen(0, -halfHeight).x, screen(0, -halfHeight).y);
          ctx.lineTo(screen(0, halfHeight).x, screen(0, halfHeight).y);
          ctx.stroke();
          ctx.setLineDash([]);

          // Draw focal points
          const f1 = screen(-Math.abs(focalLength), 0);
          const f2 = screen(Math.abs(focalLength), 0);

          // Draw focal point indicators
          ctx.fillStyle = "#00aaff";
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1;

          // Left focal point
          ctx.beginPath();
          ctx.arc(f1.x, f1.y, 5, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();

          // Right focal point
          ctx.beginPath();
          ctx.arc(f2.x, f2.y, 5, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();

          // Add focal point labels
          ctx.fillStyle = "#ffffff";
          ctx.font = "12px Arial";
          ctx.textAlign = "center";
          ctx.fillText("F", f1.x, f1.y - 10);
          ctx.fillText("F", f2.x, f2.y - 10);

          // Draw focal range indicator
          ctx.strokeStyle = "rgba(255, 255, 0, 0.3)";
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(
            screen(Math.abs(focalLength), -halfHeight).x,
            screen(Math.abs(focalLength), -halfHeight).y
          );
          ctx.lineTo(
            screen(Math.abs(focalLength), halfHeight).x,
            screen(Math.abs(focalLength), halfHeight).y
          );
          ctx.stroke();
          ctx.setLineDash([]);

          // Add label
          ctx.fillStyle = "#ffff00";
          ctx.fillText(
            lensType === "convex" ? "Focal Range" : "Virtual Focus",
            screen(Math.abs(focalLength), halfHeight + 0.3).x,
            screen(Math.abs(focalLength), halfHeight + 0.3).y
          );

          // Draw uploaded image + calculated image
          if (imageSrc) {
            if (!imgRef.current) {
              imgRef.current = new Image();
              imgRef.current.src = imageSrc;
            }
            const img = imgRef.current;
            const imgW = 1;
            const imgH = 1;

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

            // --- Draw warped image using true perspective transformation ---
            const imagePos = calculateImagePosition(objPos.x, objPos.y);
            if (imagePos && img.naturalWidth > 0 && img.naturalHeight > 0) {
              ctx.save();

              // Create a temporary canvas for the warped image
              const tempCanvas = document.createElement("canvas");
              const tempCtx = tempCanvas.getContext("2d")!;

              // Set canvas size to accommodate the warped image
              // For real images, ensure they form on the opposite side of the lens
              let warpedWidth, warpedHeight;
              if (imagePos.type === "real") {
                // Real image: use absolute distance from lens to ensure correct positioning
                warpedWidth = Math.abs(imagePos.x) * 2; // Width based on distance from lens
                warpedHeight = Math.abs(imagePos.y) * 2; // Height based on distance from lens
              } else {
                // Virtual image: use relative distance from object
                warpedWidth = Math.abs(imagePos.x - objPos.x) * 2;
                warpedHeight = Math.abs(imagePos.y - objPos.y) * 2;
              }

              tempCanvas.width = Math.max(
                100,
                Math.abs(warpedWidth * vp.scale)
              );
              tempCanvas.height = Math.max(
                100,
                Math.abs(warpedHeight * vp.scale)
              );

              // For each pixel in the destination, calculate the source pixel using lens equations
              for (let dy = 0; dy < tempCanvas.height; dy++) {
                for (let dx = 0; dx < tempCanvas.width; dx++) {
                  // Convert screen coordinates back to world coordinates
                  const worldX = imagePos.x - warpedWidth / 2 + dx / vp.scale;
                  const worldY = imagePos.y - warpedHeight / 2 + dy / vp.scale;

                  // Find the corresponding object position that would create this image position
                  // This is the inverse of the lens equation
                  let sourceX, sourceY;

                  if (imagePos.type === "real") {
                    // Real image: solve for source position using inverse lens equation
                    // From X = -f/(x-f) * x, solve for x
                    sourceX = (focalLength * worldX) / (worldX - focalLength);
                    sourceY = (sourceX / worldX) * worldY;
                  } else {
                    // Virtual image: solve for source position using inverse virtual equation
                    // From X = f/(f-x) * x, solve for x
                    sourceX = (focalLength * worldX) / (worldX + focalLength);
                    sourceY = (sourceX / worldX) * worldY;
                  }

                  // Convert source world coordinates to source image coordinates
                  const sourceImgX =
                    ((sourceX - (objPos.x - imgW / 2)) / imgW) *
                    img.naturalWidth;
                  const sourceImgY =
                    ((sourceY - (objPos.y - imgH / 2)) / imgH) *
                    img.naturalHeight;

                  // Get the color from the source image
                  if (
                    sourceImgX >= 0 &&
                    sourceImgX < img.naturalWidth &&
                    sourceImgY >= 0 &&
                    sourceImgY < img.naturalHeight
                  ) {
                    // Create a small canvas to get the pixel color
                    const pixelCanvas = document.createElement("canvas");
                    const pixelCtx = pixelCanvas.getContext("2d")!;
                    pixelCanvas.width = 1;
                    pixelCanvas.height = 1;

                    pixelCtx.drawImage(
                      img,
                      Math.floor(sourceImgX),
                      Math.floor(sourceImgY),
                      1,
                      1,
                      0,
                      0,
                      1,
                      1
                    );

                    const pixelData = pixelCtx.getImageData(0, 0, 1, 1);
                    const r = pixelData.data[0];
                    const g = pixelData.data[1];
                    const b = pixelData.data[2];
                    const a = pixelData.data[3];

                    // Set the pixel in the destination
                    tempCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
                    tempCtx.fillRect(dx, dy, 1, 1);
                  }
                }
              }

              // Draw the warped image to the main canvas
              // Ensure real images are positioned correctly on the opposite side of the lens
              let destX, destY;
              if (imagePos.type === "real") {
                // Real image: position centered at the calculated image position
                destX = screen(
                  imagePos.x - warpedWidth / 2,
                  imagePos.y + warpedHeight / 2
                ).x;
                destY = screen(
                  imagePos.x - warpedWidth / 2,
                  imagePos.y + warpedHeight / 2
                ).y;
              } else {
                // Virtual image: position relative to the image position
                destX = screen(
                  imagePos.x - warpedWidth / 2,
                  imagePos.y + warpedHeight / 2
                ).x;
                destY = screen(
                  imagePos.x - warpedWidth / 2,
                  imagePos.y + warpedHeight / 2
                ).y;
              }

              // For real images, flip vertically (inverted)
              if (imagePos.type === "real") {
                ctx.scale(1, -1);
                ctx.translate(0, -destY);
                ctx.drawImage(tempCanvas, destX, 0);
              } else {
                ctx.drawImage(tempCanvas, destX, destY);
              }

              ctx.restore();
            }

            // Draw ray tracing (only if we have an image position)
            if (imagePos) {
              ctx.strokeStyle = "#ff4444";
              ctx.lineWidth = 3;
              ctx.setLineDash([8, 4]);

              if (imagePos.type === "real") {
                // Real image rays
                // Ray 1: Parallel to axis, through lens, then through focus to image
                const ray1Start = screen(objPos.x, objPos.y);
                const ray1Lens = screen(0, objPos.y); // Where ray hits lens
                const ray1End = screen(imagePos.x, imagePos.y); // Through image
                ctx.beginPath();
                ctx.moveTo(ray1Start.x, ray1Start.y);
                ctx.lineTo(ray1Lens.x, ray1Lens.y);
                ctx.lineTo(ray1End.x, ray1End.y);
                ctx.stroke();

                // Ray 2: Through center of lens (no refraction)
                const ray2Start = screen(objPos.x, objPos.y);
                const ray2End = screen(imagePos.x, imagePos.y);
                ctx.beginPath();
                ctx.moveTo(ray2Start.x, ray2Start.y);
                ctx.lineTo(ray2End.x, ray2End.y);
                ctx.stroke();

                // Ray 3: Through focal point to lens, then parallel to image
                const ray3Start = screen(objPos.x, objPos.y);
                const ray3Lens = screen(0, objPos.y); // Where ray hits lens
                const ray3End = screen(imagePos.x, imagePos.y); // Parallel to axis through image
                ctx.beginPath();
                ctx.moveTo(ray3Start.x, ray3Start.y);
                ctx.lineTo(ray3Lens.x, ray3Lens.y);
                ctx.lineTo(ray3End.x, ray3End.y);
                ctx.stroke();
              } else {
                // Virtual image rays - show how rays appear to diverge from behind lens
                // Ray 1: Parallel to axis, through lens, then appears to come from focal point
                const ray1Start = screen(objPos.x, objPos.y);
                const ray1Lens = screen(0, objPos.y); // Where ray hits lens
                const ray1End = screen(imagePos.x, imagePos.y); // Virtual image position
                ctx.beginPath();
                ctx.moveTo(ray1Start.x, ray1Start.y);
                ctx.lineTo(ray1Lens.x, ray1Lens.y);
                ctx.lineTo(ray1End.x, ray1End.y);
                ctx.stroke();

                // Ray 2: Through center of lens (no refraction), appears to go straight through
                const ray2Start = screen(objPos.x, objPos.y);
                const ray2End = screen(imagePos.x, imagePos.y);
                ctx.beginPath();
                ctx.moveTo(ray2Start.x, ray2Start.y);
                ctx.lineTo(ray2End.x, ray2End.y);
                ctx.stroke();

                // Ray 3: Through focal point to lens, then appears parallel to axis
                const ray3Start = screen(objPos.x, objPos.y);
                const ray3Lens = screen(0, objPos.y); // Where ray hits lens
                const ray3End = screen(imagePos.x, imagePos.y); // Virtual image position
                ctx.beginPath();
                ctx.moveTo(ray3Start.x, ray3Start.y);
                ctx.lineTo(ray3Lens.x, ray3Lens.y);
                ctx.lineTo(ray3End.x, ray3End.y);
                ctx.stroke();

                // Draw dashed extensions to show where rays appear to originate
                ctx.strokeStyle = "#ff8888";
                ctx.setLineDash([4, 4]);

                // Extend ray 1 backward to show it appears to come from focal point
                const virtualRay1Start = screen(-focalLength, imagePos.y);
                ctx.beginPath();
                ctx.moveTo(ray1End.x, ray1End.y);
                ctx.lineTo(virtualRay1Start.x, virtualRay1Start.y);
                ctx.stroke();

                // Extend ray 2 backward to show it appears to go straight through
                const virtualRay2Start = screen(imagePos.x * 2, imagePos.y);
                ctx.beginPath();
                ctx.moveTo(ray2End.x, ray2End.y);
                ctx.lineTo(virtualRay2Start.x, virtualRay2Start.y);
                ctx.stroke();

                // Extend ray 3 backward to show it appears parallel to axis
                const virtualRay3Start = screen(imagePos.x * 2, imagePos.y);
                ctx.beginPath();
                ctx.moveTo(ray3End.x, ray3End.y);
                ctx.lineTo(virtualRay3Start.x, virtualRay3Start.y);
                ctx.stroke();

                // Reset line style
                ctx.strokeStyle = "#ff4444";
                ctx.setLineDash([8, 4]);
              }

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
                    Thin Lens Equations
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
                      Thin Lens Equation:
                    </div>
                    <div className="text-center text-lg text-black dark:text-white">
                      1/u + 1/v = 1/f
                    </div>
                    <div className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                      where u = x, v = -X
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-600 p-3 bg-gray-50 dark:bg-gray-900">
                    <div className="font-bold text-black dark:text-white">
                      Real Image (x &gt; f):
                    </div>
                    <div className="text-center text-black dark:text-white">
                      X = -f / (x - f) × x
                    </div>
                    <div className="text-center text-black dark:text-white">
                      Y = y / x × X
                    </div>
                    <div className="text-xs mt-1 text-yellow-600 dark:text-yellow-400">
                      only if x &gt; f
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-600 p-3 bg-gray-50 dark:bg-gray-900">
                    <div className="font-bold text-black dark:text-white">
                      Virtual Image (0 &lt; x &lt; f):
                    </div>
                    <div className="text-center text-black dark:text-white">
                      X = f / (f - x) × x
                    </div>
                    <div className="text-center text-black dark:text-white">
                      Y = y / x × X
                    </div>
                    <div className="text-xs mt-1 text-blue-600 dark:text-blue-400">
                      only if 0 &lt; x &lt; f
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-600 p-3 bg-gray-50 dark:bg-gray-900">
                    <div className="font-bold text-black dark:text-white">
                      Concave Lens (f &lt; 0):
                    </div>
                    <div className="text-center text-black dark:text-white">
                      X = f / (x - f) × x
                    </div>
                    <div className="text-center text-black dark:text-white">
                      Y = y / x × X
                    </div>
                    <div className="text-xs mt-1 text-red-600 dark:text-red-400">
                      Always virtual, upright, reduced
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div>
                      • <strong>Convex lens:</strong> Object outside focal
                      length (x &gt; f): Real, inverted image
                    </div>
                    <div>
                      • <strong>Convex lens:</strong> Object inside focal length
                      (x &lt; f): Virtual, upright, enlarged image
                    </div>
                    <div>
                      • <strong>Concave lens:</strong> Always forms virtual,
                      upright, reduced images
                    </div>
                    <div>
                      • Image follows lens equations with proper magnification
                    </div>
                    <div>• Virtual images appear on same side as object</div>
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

export default function ImageFromThinLens() {
  return <ThinLensSimulation />;
}
