import React, { useEffect, useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import smileyImage from "./smiley.jpg";

const socket = io("https://back-0klk.onrender.com", {
  transports: ["websocket", "polling", "flashsocket"],
});

const CodeBlocks = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState("// Write your code here");
  const [role, setRole] = useState("student");
  const [solution, setSolution] = useState("");
  const [studentsCount, setStudentsCount] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [connectionState, setConnectionState] = useState("disconnected");
  const [hasJoined, setHasJoined] = useState(false);
  const [attemptingReconnect, setAttemptingReconnect] = useState(false);

  const joinCodeBlock = useCallback(() => {
    if (!hasJoined && !attemptingReconnect) {
      console.log(`Joining code block with ID: ${id}`);
      socket.emit("join", { codeBlockId: id, role });
      setHasJoined(true);
    }
  }, [id, hasJoined, role, attemptingReconnect]);

  const checkSolution = useCallback(
    (currentCode) => {
      if (role === "student" && currentCode === solution) {
        setIsCorrect(true);
        setTimeout(() => setIsCorrect(false), 3000);
      } else {
        setIsCorrect(false);
      }
    },
    [role, solution]
  );

  const handleCodeChange = useCallback(
    (newCode) => {
      setCode(newCode);
      if (role === "student") {
        console.log("Sending code change", { codeBlockId: id, newCode });
        socket.emit("codeChange", { codeBlockId: id, newCode });
        checkSolution(newCode);
      }
    },
    [id, role, checkSolution]
  );

  const handleSolutionChange = useCallback(
    (newSolution) => {
      setSolution(newSolution);
      console.log("Sending solution change", { codeBlockId: id, newSolution });
      socket.emit("solutionChange", { codeBlockId: id, newSolution });
    },
    [id]
  );

  useEffect(() => {
    const handleConnect = () => {
      setConnectionState("connected");
      setAttemptingReconnect(false);
      if (!hasJoined) {
        joinCodeBlock();
      } else {
        // Rejoin the room with the current role
        socket.emit("join", { codeBlockId: id, role });
      }
    };

    const handleDisconnect = () => {
      setConnectionState("disconnected");
      setHasJoined(false);
      setAttemptingReconnect(true);
    };

    const handleInit = ({ initialCode, solution, role, students }) => {
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
    };

    const handleCodeUpdate = (newCode) => {
      console.log("Code update received", newCode);
      setCode(newCode);
      checkSolution(newCode);
    };

    const handleSolutionUpdate = (newSolution) => {
      console.log("Solution update received", newSolution);
      setSolution(newSolution);
      checkSolution(code);
    };

    const handleStudentsCount = (count) => {
      console.log("Students count update received", count);
      setStudentsCount(count);
    };

    const handleMentorLeft = () => {
      console.log("Mentor has left the room");
      alert("המנטור עזב את החדר. אתה מועבר לדף הבית.");
      navigate("/");
    };

    const handleConnectError = (error) => {
      console.error("Connection error:", error);
      setConnectionState("error");
    };

    const handleRoleUpdate = (newRole) => {
      console.log("Role update received", newRole);
      setRole(newRole);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("error", ({ message }) => {
      console.error("Server error:", message);
      // Handle server-side errors here
    });

    socket.on("init", handleInit);
    socket.on("codeUpdate", handleCodeUpdate);
    socket.on("solutionUpdate", handleSolutionUpdate);
    socket.on("studentsCount", handleStudentsCount);
    socket.on("mentorLeft", handleMentorLeft);
    socket.on("roleUpdate", handleRoleUpdate);

    joinCodeBlock();

    return () => {
      console.log(`Leaving code block with ID: ${id}`);
      socket.emit("leave", { codeBlockId: id });
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("error");
      socket.off("init", handleInit);
      socket.off("codeUpdate", handleCodeUpdate);
      socket.off("solutionUpdate", handleSolutionUpdate);
      socket.off("studentsCount", handleStudentsCount);
      socket.off("mentorLeft", handleMentorLeft);
      socket.off("roleUpdate", handleRoleUpdate);
    };
  }, [id, joinCodeBlock, navigate, checkSolution, code, hasJoined, role]);

  return (
    <div>
      <h1>Code Block {id}</h1>
      <p>Role: {role}</p>
      <p>Students in room: {studentsCount}</p>
      <p>Connection status: {connectionState}</p>
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
        options={{ readOnly: role === "student" }}
        onChange={handleCodeChange}
      />
      {role === "mentor" && (
        <>
          <h2>Solution</h2>
          <Editor
            height="20vh"
            language="javascript"
            value={solution}
            onChange={handleSolutionChange}
          />
        </>
      )}
    </div>
  );
};

export default CodeBlocks;
