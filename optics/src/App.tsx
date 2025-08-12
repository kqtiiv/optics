import { Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import ReflectionOnPlaneMirror from "./pages/reflection-on-plane-mirror";
import ImageFromThinLens from "./pages/image-from-thin-lens";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/reflection-on-plane-mirror"
        element={<ReflectionOnPlaneMirror />}
      />
      <Route path="/image-from-thin-lens" element={<ImageFromThinLens />} />
    </Routes>
  );
}

export default App;
