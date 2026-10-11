import { HashRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Quiz } from "./pages/Quiz";
import { MapPage } from "./pages/MapPage";
import { Vouchers } from "./pages/Vouchers";
import { Leaderboard } from "./pages/Leaderboard";
import { Store } from "./pages/Store";

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/store" element={<Store />} />
          <Route path="/vouchers" element={<Vouchers />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}