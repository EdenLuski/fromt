import logo from "./logo.svg";
import "./App.css";
import Lobby from "./pages/Lobby";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CodeBlocks from "./pages/CodeBlocks";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/codeblock/:id" element={<CodeBlocks />} />
      </Routes>
    </Router>
  );
}

export default App;
