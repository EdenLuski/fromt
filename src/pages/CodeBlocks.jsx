import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("https://back-0klk.onrender.com", {
  transports: ["websocket", "polling", "flashsocket"],
});
const CodeBlocks = () => {
  const { id } = useParams();
  console.log(socket);
  const [code, setCode] = useState("");
  const [role, setRole] = useState("student");
  const [solution, Setsolution] = useState("");
  const [studentsCount, setStudentsCount] = useState(0);
  const [isCorrect, setIscorrenct] = useState(false);
  useEffect(() => {
    socket.emit("join", { codeBlockId: id, isMentor: studentsCount === 0 });

    socket.on("init", ({ initialCode, role, students }) => {
      setCode(initialCode);
      setRole(role);
      setStudentsCount(students);
    });

    socket.on("codeUpdate", (newCode) => {
      setCode(newCode);
    });
    socket.on("studentCount", (count) => {
      setStudentsCount(count);
    });
    return () => {
      socket.emit("leave", { codeBlockId: id });
    };
  },[id,studentsCount,solution,role]);
  console.log(role)
  const handleCodeChange = (newCode) => {
    console.log(newCode);
    setCode(newCode);
  };

  const handleSolutionChange = (newSolution) => {
    Setsolution(newSolution);
    socket.emit("solutionChange", { codeBlockId: id, newSolution });
  };

  console.log(id);
  return (
    <div>
      {role === "student" && isCorrect && <p>V</p>}

      <Editor
        height="90vh"
        defaultLanguage="javascript"
        options={{readOnly:role==="mentor"}}
        defaultValue="// some comment"
        onChange={(value) => handleCodeChange(value)}
      />
      {role === "mentor" && (
        <>
          <h2>Solution</h2>
          <Editor
            height="90vh"
            defaultLanguage="javascript"
            defaultValue="// some comment"
            onChange={(value) => handleSolutionChange(value)}
          />
        </>
      )}
    </div>
  );
};

export default CodeBlocks;
