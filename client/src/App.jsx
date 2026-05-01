import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import About from "./pages/About";
import Chat from "./pages/Chat";
import FindRescuerStart from "./pages/FindRescuerStart";
import Guide from "./pages/Guide";
import Landing from "./pages/Landing";
import ManualCityRescuer from "./pages/ManualCityRescuer";
import Rescuer from "./pages/Rescuer";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/rescuer" element={<Rescuer />} />
          <Route path="/find-rescuer" element={<FindRescuerStart />} />
          <Route path="/find-rescuer/manual" element={<ManualCityRescuer />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/about" element={<About />} />
        </Route>
      </Routes>
    </Router>
  );
}
