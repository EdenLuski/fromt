import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import smileyImage from "./smiley.jpg"; // Import the image

const socket = io("https://back-0klk.onrender.com", {
  transports: ["websocket", "polling", "flashsocket"],
});

const CodeBlocks = () => {
  const { id } = useParams();
  const [code, setCode] = useState("// Write your code here");
  const [role, setRole] = useState("student");
  const [solution, setSolution] = useState("");
  const [studentsCount, setStudentsCount] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    console.log(`Joining code block with ID: ${id}`);
    socket.emit("join", { codeBlockId: id });

    socket.on("init", ({ initialCode, solution, role, students }) => {
      console.log("Init data received", {
        initialCode,
        solution,
        role,
        students,
      });
      setCode(initialCode);
      setSolution(solution);
      setRole(role);
      setStudentsCount(students);
    });

    socket.on("codeUpdate", (newCode) => {
      console.log("Code update received", newCode);
      setCode(newCode);
      if (role === "student" && newCode === solution) {
        setIsCorrect(true);
        setTimeout(() => setIsCorrect(false), 3000); // Hide the smiley after 3 seconds
      } else {
        setIsCorrect(false);
      }
    });

    socket.on("solutionUpdate", (newSolution) => {
      console.log("Solution update received", newSolution);
      setSolution(newSolution);
      if (role === "student" && code === newSolution) {
        setIsCorrect(true);
        setTimeout(() => setIsCorrect(false), 3000); // Hide the smiley after 3 seconds
      } else {
        setIsCorrect(false);
      }
    });

    socket.on("studentsCount", (count) => {
      console.log("Students count update received", count);
      setStudentsCount(count);
    });

    socket.on("reset", () => {
      alert("The mentor has left. You will be redirected to the lobby.");
      window.location.href = "/"; // Redirection to the lobby
    });

    return () => {
      console.log(`Leaving code block with ID: ${id}`);
      socket.emit("leave", { codeBlockId: id });
    };
  }, [id, code, solution, role]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (role === "mentor") {
      console.log("Sending code change", { codeBlockId: id, newCode });
      socket.emit("codeChange", { codeBlockId: id, newCode });
    }
    if (role === "student" && newCode === solution) {
      setIsCorrect(true);
      setTimeout(() => setIsCorrect(false), 3000); // Hide the smiley after 3 seconds
    } else {
      setIsCorrect(false);
    }
  };

  const handleSolutionChange = (newSolution) => {
    setSolution(newSolution);
    console.log("Sending solution change", { codeBlockId: id, newSolution });
    socket.emit("solutionChange", { codeBlockId: id, newSolution });
  };

  return (
    <div>
      <h1>Code Block {id}</h1>
      <p>Role: {role}</p>
      <p>Students in room: {studentsCount}</p>
      {isCorrect && (
        <img
          src={smileyImage}
          alt="Smiley"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "200px",
            height: "200px",
            zIndex: 1000,
          }}
        />
      )}
      <Editor
        height="90vh"
        language="javascript"
        value={code}
        options={{ readOnly: role === "mentor" }} // Mentor are in read-only mode
        onChange={(value) => handleCodeChange(value)}
      />
      {role === "mentor" && (
        <>
          <h2>Solution</h2>
          <Editor
            height="20vh"
            language="javascript"
            value={solution}
            onChange={(value) => handleSolutionChange(value)}
          />
        </>
      )}
    </div>
  );
};

export default CodeBlocks;
