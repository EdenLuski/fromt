# Online Coding Web Application

## Overview

This project is an online coding web application designed to help Tom, a professional JS lecturer, follow his students' progress in their journey of becoming JS masters. The application includes the following features:

- _Lobby Page_: A page where users can choose a code block to work on.
- _Code Block Page_: A page where users can see and edit code blocks. The first user to open a code block is the mentor, and subsequent users are students. The mentor can edit the code, while students can only view it. Changes are displayed in real-time.

## Features

- _Real-time Code Editing_: Changes to the code block are displayed to all users in real-time using WebSockets.
- _Syntax Highlighting_: Code blocks have syntax highlighting.
- _Student Count_: Each user can see how many students are in the room at any given time.
- _Solution Check_: When a student changes the code to match the solution, a big smiley face is displayed on the screen for 3 seconds.

## WebSocket Events

### Client to Server

- _join_: Join a code block.

  - Payload: \{ codeBlockId: <id> }\

- _codeChange_: Send a code change.

  - Payload: \{ codeBlockId: <id>, newCode: <code> }\

- _solutionChange_: Send a solution change.

  - Payload: \{ codeBlockId: <id>, newSolution: <solution> }\

- _leave_: Leave a code block.
  - Payload: \{ codeBlockId: <id> }\

### Server to Client

- _init_: Initialize a code block.

  - Payload: \{ initialCode: <code>, solution: <solution>, role: <role>, students: <count> }\

- _codeUpdate_: Update the code block.

  - Payload: \<newCode>\

- _solutionUpdate_: Update the solution.

  - Payload: \<newSolution>\

- _studentsCount_: Update the student count.

  - Payload: \<count>\

- _reset_: Notify clients to leave and reset.
