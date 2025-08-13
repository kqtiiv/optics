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
  const [lineAngle, setLineAngle] = useState(0); // Default 0 degrees (horizontal)

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas size
    canvas.width = document.documentElement.clientWidth;
    canvas.height = 400;

    // Calculate triangle dimensions
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const height = 150;

    // Convert angle to radians
    const angleRad = (oddAngle * Math.PI) / 180;

    // Calculate the two equal angles (isosceles triangle)
    const equalAngle = (Math.PI - angleRad) / 2;

    // Calculate triangle vertices based on the angle
    const topX = centerX;
    const topY = centerY - height / 2;

    // Calculate base width based on angle to maintain isosceles property
    const adjustedBaseWidth = height * Math.tan(angleRad / 2) * 2;

    const leftX = centerX - adjustedBaseWidth / 2;
    const leftY = centerY + height / 2;

    const rightX = centerX + adjustedBaseWidth / 2;
    const rightY = centerY + height / 2;

    // Draw the triangle
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.lineTo(leftX, leftY);
    ctx.lineTo(rightX, rightY);
    ctx.closePath();

    // Fill with black
    ctx.fillStyle = "black";
    ctx.fill();

    // Draw white outline
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw angle labels
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";

    // Top angle (odd angle)
    ctx.fillText(`${oddAngle}°`, topX, topY - 20);

    // Left angle
    ctx.fillText(
      `${Math.round((equalAngle * 180) / Math.PI)}°`,
      leftX - 30,
      leftY + 20
    );

    // Right angle
    ctx.fillText(
      `${Math.round((equalAngle * 180) / Math.PI)}°`,
      rightX + 30,
      rightY + 20
    );

    // Midpoint of left edge
    const lineStartX = (topX + leftX) / 2;
    const lineStartY = (topY + leftY) / 2;

    // Calculate end point based on angle
    const lineLength = 100;
    const lineAngleRad = (lineAngle * Math.PI) / 180;

    // Calculate the angle of the left side of the triangle
    const leftSideAngle = Math.atan2(leftY - topY, leftX - topX);

    // When lineAngle is 0, the line should be perpendicular to the left side
    // Add 90 degrees (π/2 radians) to make it perpendicular
    const adjustedAngle = leftSideAngle + Math.PI / 2 + lineAngleRad;

    const lineEndX = lineStartX + lineLength * Math.cos(adjustedAngle);
    const lineEndY = lineStartY + lineLength * Math.sin(adjustedAngle);

    // Draw the line
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(lineStartX, lineStartY);
    ctx.lineTo(lineEndX, lineEndY);
    ctx.stroke();

    // Reset stroke style for triangle outline
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
  }, [oddAngle, lineAngle]);

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
