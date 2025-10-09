import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Tickets from "./page/tickets";
import Home from "./page/home";
import Ticket from "./components/ticket";
import Verify from "./components/verify";
function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/ticket" element={<Ticket />} />
          <Route path="/verify" element={<Verify />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
