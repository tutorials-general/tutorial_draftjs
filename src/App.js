import React, { useState } from "react";
import { Editor, EditorState, RichUtils, CompositeDecorator } from "draft-js";
import styled from "styled-components";

import Inspector, { MyEditorInspector } from "./Inspector";
import HandleSpan from "./components/HandleSpan";
import HashTagSpan from "./components/HashTagSpan";
import { handleStrategy, hashtagStrategy } from "./utils/strategy";

//Decorator with CompositDecorator
const compositDecorator = new CompositeDecorator([
  { strategy: handleStrategy, component: HandleSpan },
  { strategy: hashtagStrategy, component: HashTagSpan }
]);

function Home() {
  //Basic setting of editorState and onChange
  const [editorState, setEditorState] = useState(
    EditorState.createEmpty(compositDecorator)
  );
  const onChange = editorState => setEditorState(editorState);

  //Using HandleKeyCommand
  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      onChange(newState);
      return "handled";
    }
    return "not-handled";
  };
  //Rich editing with UI
  const handleBold = () =>
    onChange(RichUtils.toggleInlineStyle(editorState, "BOLD"));

  return (
    <AppContainer>
      <EditorContainer>
        <button onClick={handleBold}>bold</button>
        <EditorWrapper>
          <Editor
            editorState={editorState}
            handleKeyCommand={handleKeyCommand}
            onChange={onChange}
          />
        </EditorWrapper>
      </EditorContainer>
      <Inspector editorState={editorState} />
      <MyEditorInspector editorState={editorState} />
    </AppContainer>
  );
}

const AppContainer = styled.div`
  display: flex;
  width: 100%;
`;
const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 50%;
  min-height: 100vh;
  background-color: gray;
`;

const EditorWrapper = styled.div`
  margin: 10px;
  width: 500px;
  background-color: white;
`;

export default Home;
