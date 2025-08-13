import { Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import ReflectionOnPlaneMirror from "./pages/reflection-on-plane-mirror";
import ImageFromThinLens from "./pages/image-from-thin-lens";
import ConcaveSphericalMirror from "./pages/concave-spherical-mirror";
import ConvexSphericalMirror from "./pages/convex-spherical-mirror";
import AnamorphicImage from "./pages/anamorphic-image";
import Prism from "./pages/prism";
import Rainbow from "./pages/rainbow";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/reflection-on-plane-mirror"
        element={<ReflectionOnPlaneMirror />}
      />
      <Route path="/image-from-thin-lens" element={<ImageFromThinLens />} />
      <Route
        path="/concave-spherical-mirror"
        element={<ConcaveSphericalMirror />}
      />
      <Route
        path="/convex-spherical-mirror"
        element={<ConvexSphericalMirror />}
      />
      <Route path="/anamorphic-image" element={<AnamorphicImage />} />
      <Route path="/prism" element={<Prism />} />
      <Route path="/rainbow" element={<Rainbow />} />
    </Routes>
  );
}

export default App;
