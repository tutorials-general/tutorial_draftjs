import React from "react";
import styled from "styled-components";

export default function MyCustomBlock({ children }) {
  return <CustomBlock>{children}</CustomBlock>;
}

const CustomBlock = styled.div`
  margin: 30px;
  background-color: black;
  color: white;
  padding: 30px;
`;
