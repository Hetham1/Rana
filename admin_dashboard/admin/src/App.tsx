import { Home }from "./pages/Home"
import Header from "./layout/header";
import Requesto from "./pages/RequestO"
import Requesti from "./pages/RequestI"
import Report from "./pages/Report";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
export default function App() {
  return (
   
    <Router>
    <Header />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/req-received" element={<Requesti />} />
      <Route path="/req-sent" element={<Requesto />} />
      <Route path="/rep" element={<Report />} />
    </Routes>
  </Router>
    
  )
}
