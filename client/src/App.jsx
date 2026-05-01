import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import About from "./pages/About";
import Chat from "./pages/Chat";
import Guide from "./pages/Guide";
import Landing from "./pages/Landing";
import Rescuer from "./pages/Rescuer";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/rescuer" element={<Rescuer />} />
          <Route path="/find-rescuer" element={<Rescuer />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/about" element={<About />} />
        </Route>
      </Routes>
    </Router>
  );
}
