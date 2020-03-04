import React from "react";
import styled from "styled-components";

import { convertToRaw } from "draft-js";

export function MyEditorInspector({ editorState }) {
  const getContentAsRawJson = editorState => () => {
    const contentState = editorState.getCurrentContent();
    const raw = convertToRaw(contentState);
    return JSON.stringify(raw, null, 2);
  };
  return <pre>{getContentAsRawJson(editorState)()}</pre>;
}

const Block = ({ title, contentsObject }) => {
  const stringObject = JSON.stringify(contentsObject, null, 2);
  return (
    <Container>
      <Title>{title}</Title>
      <Contents>{stringObject}</Contents>
    </Container>
  );
};

export default function InspectorComp({ editorState }) {
  return (
    <Inspector>
      {Object.keys(editorState._immutable).map(key => (
        <Block title={key} contentsObject={editorState._immutable[key]} />
      ))}
      }
    </Inspector>
  );
}

const Inspector = styled.div`
  width: 50%;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px;
`;
const Title = styled.div``;
const Contents = styled.pre``;
