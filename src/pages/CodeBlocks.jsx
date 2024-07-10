import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import smileyImage from "./smiley.jpg";

// חיבור לשרת ה-Socket.io
const socket = io("http://localhost:3001", {
  transports: ["websocket", "polling", "flashsocket"],
});

const CodeBlocks = () => {
  const { id } = useParams(); // שימוש ב-useParams כדי לקבל את מזהה ה-CodeBlock מה-URL
  const [code, setCode] = useState("// Write your code here"); // משתנה למעקב אחרי הקוד הנוכחי
  const [role, setRole] = useState("student"); // משתנה למעקב אחרי תפקיד המשתמש (תלמיד או מנטור)
  const [solution, setSolution] = useState(""); // משתנה למעקב אחרי הפתרון הנוכחי
  const [studentsCount, setStudentsCount] = useState(0); // משתנה למעקב אחרי מספר התלמידים בחדר
  const [isCorrect, setIsCorrect] = useState(false); // משתנה למעקב אחרי תקינות הפתרון

  useEffect(() => {
    console.log(`Joining code block with ID: ${id}`);
    socket.emit("join", { codeBlockId: id });

    // מאזין לאירוע init לקבלת נתונים ראשוניים
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

    // מאזין לאירוע codeUpdate לעדכון הקוד
    socket.on("codeUpdate", (newCode) => {
      console.log("Code update received", newCode);
      setCode(newCode);
      if (role === "student" && newCode === solution) {
        setIsCorrect(true);
        setTimeout(() => setIsCorrect(false), 3000); // הסתרת הסמיילי אחרי 3 שניות
      } else {
        setIsCorrect(false);
      }
    });

    // מאזין לאירוע solutionUpdate לעדכון הפתרון
    socket.on("solutionUpdate", (newSolution) => {
      console.log("Solution update received", newSolution);
      setSolution(newSolution);
      if (role === "student" && code === newSolution) {
        setIsCorrect(true);
        setTimeout(() => setIsCorrect(false), 3000); // הסתרת הסמיילי אחרי 3 שניות
      } else {
        setIsCorrect(false);
      }
    });

    // מאזין לאירוע studentsCount לעדכון מספר התלמידים
    socket.on("studentsCount", (count) => {
      console.log("Students count update received", count);
      setStudentsCount(count);
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
      setTimeout(() => setIsCorrect(false), 3000); // הסתרת הסמיילי אחרי 3 שניות
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
        options={{ readOnly: role === "mentor" }}
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
