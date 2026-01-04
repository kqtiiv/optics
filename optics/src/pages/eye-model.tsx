import { useRef, useEffect, useState } from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { NavbarLogo } from "@/components/ui/resizable-navbar";
import { GlowingEffect } from "@/components/ui/glowing-effect";

// Eye Structure Popup Component
const EyeStructurePopup = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative bg-black rounded-lg p-8 max-w-5xl max-h-[90vh] overflow-auto border border-white/20">
        <GlowingEffect
          variant="white"
          glow={true}
          disabled={false}
          blur={0}
          spread={30}
          proximity={50}
        />

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">Human Eye Structure</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 text-3xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Image */}
          <div className="space-y-4">
            <div className="text-center">
              <img
                src="https://cdn.savemyexams.com/cdn-cgi/image/f=auto,width=1920/https://cdn.savemyexams.com/uploads/2024/07/eye-structure-correct-2.png"
                alt="Human Eye Structure"
                className="max-w-full h-auto rounded-lg shadow-2xl"
                onError={(e) => {
                  e.currentTarget.src =
                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjMwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkV5ZSBTdHJ1Y3R1cmUgSW1hZ2U8L3RleHQ+Cjx0ZXh0IHg9IjMwMCIgeT0iMjMwIiBmb250LWZhbWlseT0iQXJpYWwiIGZpbGw9IiM5Q0EzQUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlBsZWFzZSBhZGQgdGhlIGFjdHVhbCBpbWFnZSB1cmw8L3RleHQ+Cjwvc3ZnPgo=";
                }}
              />
            </div>

            <div className="text-white text-sm space-y-2">
              <h4 className="text-lg font-semibold mb-3">Key Structures:</h4>
              <ul className="space-y-2">
                <li>
                  <strong>Cornea:</strong> Transparent front part that refracts
                  light
                </li>
                <li>
                  <strong>Iris:</strong> Colored part that controls pupil size
                </li>
                <li>
                  <strong>Pupil:</strong> Central opening that allows light to
                  enter
                </li>
                <li>
                  <strong>Lens:</strong> Crystalline structure that focuses
                  light
                </li>
                <li>
                  <strong>Retina:</strong> Light-sensitive layer at the back of
                  the eye
                </li>
                <li>
                  <strong>Optic Nerve:</strong> Carries visual information to
                  the brain
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Function Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-white">
                The Human Eye: Function
              </h3>
              <p className="text-white/90 text-sm leading-relaxed mb-4">
                The function of the eye in focusing on near and distant objects.
                The way the lens brings about fine focusing is called{" "}
                <strong>accommodation</strong>.
              </p>
              <p className="text-white/90 text-sm leading-relaxed">
                The lens is elastic and its shape can be changed when the
                suspensory ligaments attached to it become tight or loose. The
                changes are brought about by the contraction or relaxation of
                the ciliary muscles.
              </p>
            </div>

            <div className="space-y-4">
              <div className="border border-white/20 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3">
                  When an object is close up:
                </h4>
                <ul className="text-sm space-y-2 text-white/80">
                  <li>
                    • The ciliary muscles contract (the ring of muscle decreases
                    in diameter)
                  </li>
                  <li>• This causes the suspensory ligaments to loosen</li>
                  <li>
                    • This stops the suspensory ligaments from pulling on the
                    lens, which allows the lens to become fatter
                  </li>
                  <li>• Light is refracted more</li>
                </ul>
              </div>

              <div className="border border-white/20 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3">
                  When an object is far away:
                </h4>
                <ul className="text-sm space-y-2 text-white/80">
                  <li>
                    • The ciliary muscles relax (the ring of muscle increases in
                    diameter)
                  </li>
                  <li>• This causes the suspensory ligaments to tighten</li>
                  <li>
                    • The suspensory ligaments pull on the lens, causing it to
                    become thinner
                  </li>
                  <li>• Light is refracted less</li>
                </ul>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-white/20">
                <thead>
                  <tr>
                    <th className="border border-white/20 px-3 py-2 text-left text-white font-semibold">
                      Focus Type
                    </th>
                    <th className="border border-white/20 px-3 py-2 text-left text-white font-semibold">
                      Ciliary muscles
                    </th>
                    <th className="border border-white/20 px-3 py-2 text-left text-white font-semibold">
                      Suspensory ligaments
                    </th>
                    <th className="border border-white/20 px-3 py-2 text-left text-white font-semibold">
                      Lens
                    </th>
                    <th className="border border-white/20 px-3 py-2 text-left text-white font-semibold">
                      Light refraction
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-white/20 px-3 py-2 font-medium text-white">
                      Near objects
                    </td>
                    <td className="border border-white/20 px-3 py-2 text-white">
                      Contracted
                    </td>
                    <td className="border border-white/20 px-3 py-2 text-white">
                      Loose
                    </td>
                    <td className="border border-white/20 px-3 py-2 text-white">
                      Fatter
                    </td>
                    <td className="border border-white/20 px-3 py-2 text-white">
                      More
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-white/20 px-3 py-2 font-medium text-white">
                      Distant objects
                    </td>
                    <td className="border border-white/20 px-3 py-2 text-white">
                      Relaxed
                    </td>
                    <td className="border border-white/20 px-3 py-2 text-white">
                      Tight
                    </td>
                    <td className="border border-white/20 px-3 py-2 text-white">
                      Thinner
                    </td>
                    <td className="border border-white/20 px-3 py-2 text-white">
                      Less
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function EyeModel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [axialLength, setAxialLength] = useState<number>(24);
  const [corneaPower, setCorneaPower] = useState<number>(43);
  const [lensPower, setLensPower] = useState<number>(17);
  const [enableCorrection, setEnableCorrection] = useState<boolean>(false);
  const [rxDiopters, setRxDiopters] = useState<number>(0);
  const [showEyeStructure, setShowEyeStructure] = useState<boolean>(false);
  const scalePxPerMM = 18;

  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));
  const totalEyePower = enableCorrection
    ? corneaPower + lensPower + rxDiopters
    : corneaPower + lensPower;
  const focalLengthMM = 1000 / totalEyePower;
  const f0 = 1000 / 60;
  const retinaDistanceFromCorneaMM = f0 + (axialLength - 24);
  const epsilon = 0.25;
  const condition: "myopia" | "hyperopia" | "normal" =
    focalLengthMM < retinaDistanceFromCorneaMM - epsilon
      ? "myopia"
      : focalLengthMM > retinaDistanceFromCorneaMM + epsilon
      ? "hyperopia"
      : "normal";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = (canvas.width = document.documentElement.clientWidth);
    const H = (canvas.height = 700);
    ctx.clearRect(0, 0, W, H);

    const centerY = H / 2;
    const corneaX = Math.max(140, W * 0.22);
    const mm = (x: number) => x * scalePxPerMM;
    const lensX = corneaX + mm(3);
    const retinaX = corneaX + mm(retinaDistanceFromCorneaMM);
    const focusX = corneaX + mm(focalLengthMM);

    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, W, H);

    // eye outline (ellipse - width extends to retina position, height stays constant)
    const eyeWidth = mm(retinaDistanceFromCorneaMM);
    const eyeHeight = mm(16); 
    const eyeCenterX = corneaX + mm(retinaDistanceFromCorneaMM / 2);
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(
      eyeCenterX,
      centerY,
      eyeWidth / 2,
      eyeHeight / 2,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();

    // draw corrective lens if enabled
    if (enableCorrection && Math.abs(rxDiopters) > 0.1) {
      // draw corrective lens shape
      const correctiveLensX = corneaX - mm(8);
      const correctiveLensHeight = mm(12);
      const correctiveLensWidth = mm(2);
      const lensColor = rxDiopters > 0 ? "#93c5fd" : "#fca5a5";

      ctx.fillStyle = lensColor;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;

      // curvature radius factor (more diopters = more curve)
      const curvature = Math.min(Math.abs(rxDiopters), 6);

      // draw lens
      ctx.beginPath();
      ctx.moveTo(correctiveLensX, centerY - correctiveLensHeight / 2);

      // left curve
      if (rxDiopters > 0) {
        // convex left side
        ctx.quadraticCurveTo(
          correctiveLensX - curvature,
          centerY,
          correctiveLensX,
          centerY + correctiveLensHeight / 2
        );
      } else {
        // concave left side
        ctx.quadraticCurveTo(
          correctiveLensX + curvature,
          centerY,
          correctiveLensX,
          centerY + correctiveLensHeight / 2
        );
      }

      // bottom edge
      ctx.lineTo(
        correctiveLensX + correctiveLensWidth,
        centerY + correctiveLensHeight / 2
      );

      // right curve
      if (rxDiopters > 0) {
        // convex right side
        ctx.quadraticCurveTo(
          correctiveLensX + correctiveLensWidth + curvature,
          centerY,
          correctiveLensX + correctiveLensWidth,
          centerY - correctiveLensHeight / 2
        );
      } else {
        // concave right side
        ctx.quadraticCurveTo(
          correctiveLensX + correctiveLensWidth - curvature,
          centerY,
          correctiveLensX + correctiveLensWidth,
          centerY - correctiveLensHeight / 2
        );
      }

      // top edge
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // add power label
      ctx.fillStyle = "#ffffff";
      ctx.font = "10px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        `${rxDiopters >= 0 ? "+" : ""}${rxDiopters.toFixed(1)}D`,
        correctiveLensX,
        centerY + mm(8)
      );

      // draw focal point indicator
      const fLensMM = 1000 / Math.abs(rxDiopters);
      let focalPointX;
      if (rxDiopters > 0) {
        // convex lens: real focal point in front
        focalPointX = correctiveLensX + mm(fLensMM);
        ctx.fillStyle = "#93c5fd";
        ctx.beginPath();
        ctx.arc(focalPointX, centerY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(focalPointX, centerY - mm(6));
        ctx.lineTo(focalPointX, centerY + mm(6));
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // concave lens: virtual focal point behind
        focalPointX = correctiveLensX - mm(fLensMM);
        ctx.fillStyle = "#fca5a5";
        ctx.beginPath();
        ctx.arc(focalPointX, centerY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(focalPointX, centerY - mm(6));
        ctx.lineTo(focalPointX, centerY + mm(6));
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    ctx.fillStyle = "#7ec8f0";
    ctx.beginPath();
    ctx.arc(corneaX, centerY, mm(3.2), Math.PI / 2, -Math.PI / 2, true);
    ctx.closePath();
    ctx.fill();

    // dynamic lens size based on accommodation (lens power)
    // lower diopters = thinner lens (stretched), Higher diopters = thicker lens
    const baseLensThickness = 5; // base thickness in mm
    const baseLensWidth = 2; // base width in mm

    // calculate lens dimensions based on power
    // higher power = thicker lens, lower power = thinner lens
    const lensThickness = baseLensThickness + (lensPower - 17) * 0.1; // adjust thickness based on power
    const lensWidth = baseLensWidth - (lensPower - 17) * 0.05; // adjust width based on power

    ctx.fillStyle = "#fff2a6";
    ctx.beginPath();
    ctx.ellipse(
      lensX,
      centerY,
      mm(lensWidth),
      mm(lensThickness),
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.strokeStyle = "#ff6b6b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(retinaX, centerY - mm(9));
    ctx.lineTo(retinaX, centerY + mm(9));
    ctx.stroke();
    ctx.fillStyle = "#eaeaea";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Retina", retinaX, centerY + mm(9.8));

    const rayOffsets = [-mm(2), 0, mm(2)];
    rayOffsets.forEach((dy) => {
      const startX = corneaX - mm(25);
      let y = centerY + dy;

      // draw incoming rays
      ctx.strokeStyle = "#e5e5e5";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, y);

      if (enableCorrection && Math.abs(rxDiopters) > 0.1) {
        const xL = corneaX - mm(8); // lens position (px)
        const xC = corneaX; // cornea entry (px)

        // incoming ray, up to the corrective lens
        ctx.lineTo(xL, y);
        ctx.stroke();

        // ----- thin-lens bend at the corrective lens -----
        // signed focal length in mm (positive = converging, negative = diverging)
        const fLensMM = 1000 / rxDiopters; 
        // convert to pixels and get the (real or virtual) focal point on the optical axis
        const xF = xL + mm(fLensMM);

        // slope of outgoing ray: line through (xL, y) and (xF, centerY)
        // using (xL - xF) avoids sign mistakes and matches geometry for both signs
        const m = (y - centerY) / (xL - xF);

        // y where this ray meets the cornea plane
        const yAtCornea = y + m * (xC - xL);

        // draw the refracted segment (lens → cornea)
        ctx.strokeStyle = "#60a5fa";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(xL, y);
        ctx.lineTo(xC, yAtCornea);
        ctx.stroke();

        // continue through the eye from the cornea with this updated y
        y = yAtCornea;
      } else {
        ctx.lineTo(corneaX, y);
        ctx.stroke();
      }

      // rays through cornea and lens
      const postLensX = lensX + mm(0.5);
      ctx.strokeStyle = "#ffe066";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(corneaX, y);
      ctx.lineTo(postLensX, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(postLensX, y);
      ctx.lineTo(focusX, centerY);
      ctx.stroke();

      // continue rays beyond focus point
      if (focusX < retinaX + mm(30)) {
        ctx.beginPath();
        ctx.moveTo(focusX, centerY);
        const endX = Math.min(focusX + mm(40), W - 10);
        const slope = (centerY - y) / (focusX - postLensX + 1e-6);
        const yAtEnd = centerY + slope * (endX - focusX);
        ctx.lineTo(endX, yAtEnd);
        ctx.stroke();
      }
    });

    ctx.fillStyle = "#ffd43b";
    ctx.beginPath();
    ctx.arc(focusX, centerY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = "#a0aec0";
    ctx.beginPath();
    ctx.moveTo(focusX, centerY - mm(8));
    ctx.lineTo(focusX, centerY + mm(8));
    ctx.stroke();
    ctx.setLineDash([]);

    const statusX = Math.min(corneaX + mm(6), W - 260);
    const statusText =
      condition === "myopia"
        ? "Myopia (focus IN FRONT of retina)"
        : condition === "hyperopia"
        ? "Hyperopia (focus BEHIND retina)"
        : "Normal (in focus on retina)";
    ctx.fillStyle = "#d1fae5";
    ctx.font = "16px Inter, Arial";
    ctx.textAlign = "left";
    ctx.fillText(statusText, statusX, centerY + mm(10.8));
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "12px Inter, Arial";
    ctx.fillText(
      `Axial length: ${axialLength.toFixed(1)} mm`,
      statusX,
      centerY + mm(12.5)
    );
    ctx.fillText(
      `Total eye power: ${totalEyePower.toFixed(2)} D`,
      statusX,
      centerY + mm(13.6)
    );
    ctx.fillText(
      `Focal length: ${focalLengthMM.toFixed(2)} mm`,
      statusX,
      centerY + mm(14.7)
    );
    ctx.fillText(
      `Retina distance: ${retinaDistanceFromCorneaMM.toFixed(2)} mm`,
      statusX,
      centerY + mm(15.8)
    );

    if (enableCorrection) {
      ctx.fillStyle = "#93c5fd";
      ctx.fillText(
        `Corrective lens: ${rxDiopters >= 0 ? "+" : ""}${rxDiopters.toFixed(
          2
        )} D`,
        statusX,
        centerY + mm(16.9)
      );
    }

    // draw ray legend
    const legendX = W - 200;
    const legendY = 30;
    ctx.fillStyle = "#ffffff";
    ctx.font = "12px Inter, Arial";
    ctx.textAlign = "left";
    ctx.fillText("Ray Path Legend:", legendX, legendY);

    // incoming rays
    ctx.strokeStyle = "#e5e5e5";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(legendX, legendY + 20);
    ctx.lineTo(legendX + 20, legendY + 20);
    ctx.stroke();
    ctx.fillStyle = "#e5e5e5";
    ctx.fillText("Incoming light", legendX + 25, legendY + 25);

    // corrective lens rays
    if (enableCorrection && Math.abs(rxDiopters) > 0.1) {
      ctx.strokeStyle = "#60a5fa";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(legendX, legendY + 40);
      ctx.lineTo(legendX + 20, legendY + 40);
      ctx.stroke();
      ctx.fillStyle = "#60a5fa";
      ctx.fillText("Through corrective lens", legendX + 25, legendY + 45);
    }

    // eye lens rays
    ctx.strokeStyle = "#ffe066";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(legendX, legendY + 60);
    ctx.lineTo(legendX + 20, legendY + 60);
    ctx.stroke();
    ctx.fillStyle = "#ffe066";
    ctx.fillText("Through eye lens", legendX + 25, legendY + 65);

    // lens type legend
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Lens Types:", legendX, legendY + 90);

    // positive lens
    ctx.fillStyle = "#93c5fd";
    ctx.beginPath();
    ctx.arc(legendX + 10, legendY + 110, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.fillText("+", legendX + 10, legendY + 115);
    ctx.textAlign = "left";
    ctx.fillStyle = "#93c5fd";
    ctx.fillText("Converging", legendX + 25, legendY + 115);

    // negative lens
    ctx.fillStyle = "#fca5a5";
    ctx.beginPath();
    ctx.arc(legendX + 10, legendY + 130, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.fillText("-", legendX + 10, legendY + 135);
    ctx.textAlign = "left";
    ctx.fillStyle = "#fca5a5";
    ctx.fillText("Diverging", legendX + 25, legendY + 135);

    // corrective lens shape legend
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Corrective Lens Shapes:", legendX, legendY + 160);

    // positive lens (convex-concave)
    ctx.strokeStyle = "#93c5fd";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(legendX, legendY + 180);
    ctx.lineTo(legendX + 20, legendY + 180);
    ctx.stroke();
    ctx.fillStyle = "#93c5fd";
    ctx.fillText(
      "Convex",
      legendX + 25,
      legendY + 185
    );

    // negative lens (concave-convex)
    ctx.strokeStyle = "#fca5a5";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(legendX, legendY + 200);
    ctx.lineTo(legendX + 20, legendY + 200);
    ctx.stroke();
    ctx.fillStyle = "#fca5a5";
    ctx.fillText(
      "Concave",
      legendX + 25,
      legendY + 205
    );

    // curvature increases with power
    ctx.fillStyle = "#ffffff";
    ctx.fillText(
      "*Curvature increases with diopter power",
      legendX,
      legendY + 225
    );

    // focal point explanation
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Focal Points:", legendX, legendY + 265);

    // convex lens focal point
    ctx.fillStyle = "#93c5fd";
    ctx.beginPath();
    ctx.arc(legendX + 10, legendY + 285, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(
      "Real",
      legendX + 25,
      legendY + 290
    );

    // concave lens focal point
    ctx.fillStyle = "#fca5a5";
    ctx.beginPath();
    ctx.arc(legendX + 10, legendY + 305, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(
      "Virtual",
      legendX + 25,
      legendY + 310
    );
  }, [
    axialLength,
    corneaPower,
    lensPower,
    enableCorrection,
    rxDiopters,
    focalLengthMM,
    retinaDistanceFromCorneaMM,
    totalEyePower,
  ]);

  const setPresetMyopia = () => {
    setAxialLength(26);
    setCorneaPower(43);
    setLensPower(17);
    setEnableCorrection(false);
    setRxDiopters(-3);
  };
  const setPresetHyperopia = () => {
    setAxialLength(22);
    setCorneaPower(43);
    setLensPower(17);
    setEnableCorrection(false);
    setRxDiopters(+2.5);
  };
  const setPresetNormal = () => {
    setAxialLength(24);
    setCorneaPower(43);
    setLensPower(17);
    setEnableCorrection(false);
    setRxDiopters(0);
  };

  return (
    <div>
      <NavigationMenu viewport={false} className="z-10 p-1 m-auto bg-black">
        <NavigationMenuList className="flex flex-col gap-2">
          {/* First row - Core controls */}
          <div className="flex items-center justify-between gap-4 text-white">
            <NavigationMenuItem>
              <div className="flex items-center space-x-2 text-white">
                <label className="text-xs font-medium whitespace-nowrap">
                  Axial Length: {axialLength.toFixed(1)} mm
                </label>
                <input
                  type="range"
                  min={20}
                  max={28}
                  step={0.1}
                  value={axialLength}
                  onChange={(e) => setAxialLength(Number(e.target.value))}
                  className="w-32 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <div className="flex items-center space-x-2 text-white">
                <label className="text-xs font-medium whitespace-nowrap">
                  Cornea: {corneaPower.toFixed(1)} D
                </label>
                <input
                  type="range"
                  min={38}
                  max={48}
                  step={0.1}
                  value={corneaPower}
                  onChange={(e) => setCorneaPower(Number(e.target.value))}
                  className="w-32 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <div className="flex items-center space-x-2 text-white">
                <label
                  className="text-xs font-medium whitespace-nowrap"
                  title="Lower values = thinner lens (relaxed), Higher values = thicker lens (contracted)"
                >
                  Lens: {lensPower.toFixed(1)} D
                </label>
                <input
                  type="range"
                  min={10}
                  max={30}
                  step={0.1}
                  value={lensPower}
                  onChange={(e) => setLensPower(Number(e.target.value))}
                  className="w-32 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </NavigationMenuItem>

            <NavbarLogo />
          </div>

          {/* Second row - Corrective lens and presets */}
          <div className="flex items-center justify-between gap-4 text-white">
            <NavigationMenuItem>
              <div className="flex items-center space-x-2 text-white">
                <label className="text-xs font-medium whitespace-nowrap">
                  Correction
                </label>
                <input
                  type="checkbox"
                  checked={enableCorrection}
                  onChange={(e) => setEnableCorrection(e.target.checked)}
                  className="w-4 h-4"
                />
                <input
                  type="range"
                  min={-10}
                  max={+10}
                  step={0.25}
                  value={rxDiopters}
                  onChange={(e) =>
                    setRxDiopters(clamp(Number(e.target.value), -12, 12))
                  }
                  className="w-28 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  disabled={!enableCorrection}
                  aria-label="Corrective lens diopters"
                />
                <span className="text-xs tabular-nums w-16 text-right">
                  {rxDiopters >= 0 ? "+" : ""}
                  {rxDiopters.toFixed(2)} D
                </span>
              </div>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <div className="flex items-center space-x-2 text-white">
                <button
                  className="px-2 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-xs"
                  onClick={setPresetNormal}
                >
                  Normal
                </button>
                <button
                  className="px-2 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-xs"
                  onClick={setPresetMyopia}
                >
                  Myopia
                </button>
                <button
                  className="px-2 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-xs"
                  onClick={setPresetHyperopia}
                >
                  Hyperopia
                </button>
                <button
                  className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs"
                  onClick={() => setShowEyeStructure(true)}
                >
                  Eye Structure
                </button>
              </div>
            </NavigationMenuItem>
          </div>
        </NavigationMenuList>
      </NavigationMenu>
      <div className="p-[20px] text-center flex flex-col items-center">
        <canvas ref={canvasRef} />

        {/* Mobile Eye Structure Button */}
        <button
          className="md:hidden mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium"
          onClick={() => setShowEyeStructure(true)}
        >
          View Eye Structure
        </button>
      </div>

      {/* Eye Structure Popup */}
      <EyeStructurePopup
        isOpen={showEyeStructure}
        onClose={() => setShowEyeStructure(false)}
      />
    </div>
  );
}
