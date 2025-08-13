import { useRef, useEffect, useState } from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { NavbarLogo } from "@/components/ui/resizable-navbar";

export default function Prism() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [oddAngle, setOddAngle] = useState(60); // Default 60 degrees
  const [lineAngle, setLineAngle] = useState(0); // Default 0 degrees

  const colors = [
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "indigo",
    "violet",
  ];
  const wavelengths = [405, 480, 510, 530, 600, 620, 680];

  function crownGlass(lambda: number) {
    const x = lambda / 1000;

    // Sellmeier coefficients
    const a = [1.03961212, 0.231792344, 1.01146945];
    const b = [0.00600069867, 0.0200179144, 103.560653];

    let y = 0;
    for (let i = 0; i < a.length; i++) {
      y += (a[i] * Math.pow(x, 2)) / (Math.pow(x, 2) - b[i]);
    }

    return Math.sqrt(1 + y);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = document.documentElement.clientWidth;
    canvas.height = 400;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Triangle geometry
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const height = 150;
    const angleRad = (oddAngle * Math.PI) / 180;
    const equalAngle = (Math.PI - angleRad) / 2;
    const adjustedBaseWidth = height * Math.tan(angleRad / 2) * 2;

    const topX = centerX;
    const topY = centerY - height / 2;
    const leftX = centerX - adjustedBaseWidth / 2;
    const leftY = centerY + height / 2;
    const rightX = centerX + adjustedBaseWidth / 2;
    const rightY = centerY + height / 2;

    // Draw triangle
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.lineTo(leftX, leftY);
    ctx.lineTo(rightX, rightY);
    ctx.closePath();
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Labels
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`${oddAngle}°`, topX, topY - 20);
    ctx.fillText(
      `${Math.round((equalAngle * 180) / Math.PI)}°`,
      leftX - 30,
      leftY + 20
    );
    ctx.fillText(
      `${Math.round((equalAngle * 180) / Math.PI)}°`,
      rightX + 30,
      rightY + 20
    );

    // Line from middle of left edge
    const lineStartX = (topX + leftX) / 2;
    const lineStartY = (topY + leftY) / 2;
    const lineLength = 100;
    const lineAngleRad = (lineAngle * Math.PI) / 180;
    const leftSideAngle = Math.atan2(leftY - topY, leftX - topX);
    const adjustedAngle = leftSideAngle + Math.PI / 2 + lineAngleRad;

    const lineEndX = lineStartX + lineLength * Math.cos(adjustedAngle);
    const lineEndY = lineStartY + lineLength * Math.sin(adjustedAngle);

    ctx.beginPath();
    ctx.moveTo(lineStartX, lineStartY);
    ctx.lineTo(lineEndX, lineEndY);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.stroke();

    colors.forEach((color, index) => {
      // First refraction at left edge (air to prism)
      const nAir = 1.0;
      const nPrism = crownGlass(wavelengths[index]);

      // Calculate angle of incidence relative to normal
      const normalAngleLeft = leftSideAngle + Math.PI / 2; // Normal pointing into prism
      const angleOfIncidenceLeft = adjustedAngle - normalAngleLeft;

      // Apply Snell's law for refraction from air to prism
      const refractedAngleRad = Math.asin(
        (nAir / nPrism) * Math.sin(angleOfIncidenceLeft)
      );

      // Final angle inside prism
      const finalAngleRad = normalAngleLeft + refractedAngleRad;

      // Right edge geometry
      const rightEdgeSlope = (rightY - topY) / (rightX - topX);
      const rightEdgeAngleRad = Math.atan2(rightY - topY, rightX - topX);
      const rightEdgeIntercept = rightY - rightEdgeSlope * rightX;

      let ix, iy; // intersection point with right edge

      if (Math.abs(Math.cos(finalAngleRad)) < 1e-6) {
        ix = lineStartX;
        iy = rightEdgeSlope * ix + rightEdgeIntercept;
      } else if (Math.abs(rightX - topX) < 1e-6) {
        const beamSlope = Math.tan(finalAngleRad);
        const beamIntercept = lineStartY - beamSlope * lineStartX;
        ix = rightX;
        iy = beamSlope * ix + beamIntercept;
      } else {
        const beamSlope = Math.tan(finalAngleRad);
        const beamIntercept = lineStartY - beamSlope * lineStartX;
        ix =
          (rightEdgeIntercept - beamIntercept) / (beamSlope - rightEdgeSlope);
        iy = beamSlope * ix + beamIntercept;
      }

      // Draw first segment (inside prism)
      ctx.beginPath();
      ctx.moveTo(lineStartX, lineStartY);
      ctx.lineTo(ix, iy);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw normal at left edge (entry point)
      const normalLength = 30;
      const leftNormalEndX =
        lineStartX + normalLength * Math.cos(normalAngleLeft);
      const leftNormalEndY =
        lineStartY + normalLength * Math.sin(normalAngleLeft);

      const leftNormalStartX =
        lineStartX - normalLength * Math.cos(normalAngleLeft);
      const leftNormalStartY =
        lineStartY - normalLength * Math.sin(normalAngleLeft);

      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]); // Dashed line for normal
      ctx.beginPath();
      ctx.moveTo(leftNormalStartX, leftNormalStartY);
      ctx.lineTo(leftNormalEndX, leftNormalEndY);
      ctx.stroke();
      ctx.setLineDash([]); // Reset to solid line

      // ---- Second refraction ----
      // Normal to right edge (pointing outward)
      const normalAngleRad = rightEdgeAngleRad - Math.PI / 2;

      // Snell's law: n_prism * sin(θ1) = n_air * sin(θ2)
      const nPrismRight = crownGlass(wavelengths[index]);
      const nAirRight = 1.0;

      // Calculate angle of incidence relative to normal
      const angleOfIncidence = finalAngleRad - normalAngleRad;

      // Apply Snell's law for refraction from prism to air
      const theta2 = Math.asin(
        (nPrismRight / nAirRight) * Math.sin(angleOfIncidence)
      );

      // Outgoing beam angle in world coordinates
      const outgoingAngleRad = normalAngleRad - theta2;

      // Extend outgoing ray
      const outLength = 200;
      const ox = ix + outLength * Math.cos(outgoingAngleRad);
      const oy = iy + outLength * Math.sin(outgoingAngleRad);

      ctx.beginPath();
      ctx.moveTo(ix, iy);
      ctx.lineTo(ox, oy);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw normal at right edge (exit point)
      const rightNormalEndX = ix + normalLength * Math.cos(normalAngleRad);
      const rightNormalEndY = iy + normalLength * Math.sin(normalAngleRad);
      const rightNormalStartX = ix - normalLength * Math.cos(normalAngleRad);
      const rightNormalStartY = iy - normalLength * Math.sin(normalAngleRad);

      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]); // Dashed line for normal
      ctx.beginPath();
      ctx.moveTo(rightNormalStartX, rightNormalStartY);
      ctx.lineTo(rightNormalEndX, rightNormalEndY);
      ctx.stroke();
      ctx.setLineDash([]); // Reset to solid line
    });
  }, [oddAngle, lineAngle, colors, wavelengths]);

  return (
    <div>
      <NavigationMenu viewport={false} className="z-10 p-1 m-auto bg-black">
        <NavigationMenuList>
          <NavigationMenuItem>
            <div className="flex items-center space-x-4 text-white">
              <label htmlFor="angleSlider" className="text-sm font-medium">
                Prism Angle: {oddAngle}°
              </label>
              <input
                id="angleSlider"
                type="range"
                min="10"
                max="150"
                value={oddAngle}
                onChange={(e) => setOddAngle(Number(e.target.value))}
                className="w-32 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <div className="flex items-center space-x-4 text-white">
              <label htmlFor="lineAngleSlider" className="text-sm font-medium">
                Line: {lineAngle}°
              </label>
              <input
                id="lineAngleSlider"
                type="range"
                min="-90"
                max="90"
                value={lineAngle}
                onChange={(e) => setLineAngle(Number(e.target.value))}
                className="w-32 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavbarLogo />
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <div className="p-[20px] text-center flex flex-col items-center">
        <canvas ref={canvasRef} />
        <div className="mt-[20px] text-[14px] text-[#666]">
          <p>Equal angles: {Math.round(((180 - oddAngle) / 2) * 100) / 100}°</p>
          <p>Total angles: {oddAngle + 2 * ((180 - oddAngle) / 2)}°</p>
        </div>
      </div>
    </div>
  );
}
