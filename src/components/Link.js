import React from "react";
import styled from "styled-components";

export default function Link(props) {
  const { url } = props.contentState.getEntity(props.entityKey).getData();
  return <A href={url}>{props.children} </A>;
}

const A = styled.a`
  text-decoration: underline;
  color: blue;
`;
