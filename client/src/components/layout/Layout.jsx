import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout() {
  const location = useLocation();
  const isChatPage = location.pathname === "/chat";

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className={`flex-1 ${isChatPage ? "overflow-hidden" : ""}`}>
        <Outlet />
      </main>
      {!isChatPage && <Footer />}
    </div>
  );
}
