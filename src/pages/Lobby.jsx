import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import "./Lobby.css";
import axios from "axios";
const Lobby = () => {
  const [codeBlocks, setCodeBlocks] = useState([]);

  useEffect(() => {
  
    axios
      .get("http://localhost:3001/api/codeblocks")
      .then((response) => setCodeBlocks(response.data))
      .catch((error) => console.error(error));
  }, []);
  console.log(codeBlocks)
  return (
    <div className="my-style">
      <h1>Welcome to the Lobby!</h1>
      <div>
        <h2>Choose code block</h2>
        <ul>
          {codeBlocks.map((block, index) => (
            <li key={index}>
              <Link to={`/codeblock/${block._id}`}>{block.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
export default Lobby;
