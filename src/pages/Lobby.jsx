import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import "./Lobby.css";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";

import {
  Container,
  Paper,
  Typography,
  List,
  ListItemIcon,
  Avatar,
} from "@mui/material";
import styled from "styled-components";
import CodeIcon from "@mui/icons-material/Code";
import useSWR from "swr";

const StyledContainer = styled(Container)`
  margin-top: 20px;
  display: flex;

  justify-content: center;
`;
const StyledPaper = styled(Paper)`
  padding: 20px;
  width: 100%;
  max-width: 800px;
`;
const StyleLink = styled(Link)`
  text-decoration: none;
  display: flex;

  align-items: center;
  margin-bottom: 10px;
  color: black;
  &:hover {
    color: blue;
    font-weight: bold;
    font-size: 1.1em;
  }
`;
const StyleHeader = styled(Typography)`
  margin-bottom: 20px;
  text-align: center;
`;
const StyleLoading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;
const Lobby = () => {
  const { data: codeBlocks, error } = useSWR(
    "https://back-0klk.onrender.com/api/codeblocks",
    (url) => axios.get(url).then((res) => res.data)
  );

  if (error) return <div>failed to load</div>;
  //Circular Progress
  if (!codeBlocks) {
    return (
      <StyleLoading>
        <CircularProgress />
      </StyleLoading>
    );
  }
  return (
    <StyledContainer>
      <StyledPaper elevation={3}>
        <StyleHeader variant="h4" gutterBottom>
          Welcome to the Lobby!
        </StyleHeader>
        <Typography variant="h6" gutterBottom>
          Choose code block
        </Typography>
        <List>
          {codeBlocks.map((block, index) => (
            <StyleLink to={`/codeblock/${block._id}`} key={index}>
              <ListItemIcon>
                <Avatar>
                  <CodeIcon />
                </Avatar>
              </ListItemIcon>
              {block.name}
            </StyleLink>
          ))}
        </List>
      </StyledPaper>
    </StyledContainer>
    // <div className="my-style">
    //   <h1>Welcome to the Lobby!</h1>
    //   <div>
    //     <h2>Choose code block</h2>
    //     <ul>
    //       {codeBlocks.map((block, index) => (
    //         <li key={index}>
    //           <Link to={`/codeblock/${block._id}`}>{block.name}</Link>
    //         </li>
    //       ))}
    //     </ul>
    //   </div>
    // </div>
  );
};
export default Lobby;
