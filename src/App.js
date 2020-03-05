import React, { useState, useRef, useEffect } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  CompositeDecorator,
  getDefaultKeyBinding,
  KeyBindingUtil,
  DefaultDraftBlockRenderMap
} from "draft-js";
import styled from "styled-components";
import Immutable from "immutable";

import Inspector, { MyEditorInspector } from "./Inspector";
import HandleSpan from "./components/HandleSpan";
import HashTagSpan from "./components/HashTagSpan";
import {
  handleStrategy,
  hashtagStrategy,
  findLinkEntites
} from "./utils/strategy";
import MyCustomBlock from "./components/MyCustomBlock";
import Link from "./components/Link";
import UrlInput from "./components/UrlInput";

//Decorator with CompositDecorator
const compositDecorator = new CompositeDecorator([
  { strategy: handleStrategy, component: HandleSpan },
  { strategy: hashtagStrategy, component: HashTagSpan },
  { strategy: findLinkEntites, component: Link }
]);

//Custom Key bindings
const { hasCommandModifier } = KeyBindingUtil;

const myKeybindingFn = e => {
  if (e.keyCode === 83 && hasCommandModifier(e)) {
    return "myeditor-save";
  }
  return getDefaultKeyBinding(e);
};

function Home() {
  //Basic setting of editorState and onChange
  const [editorState, setEditorState] = useState(
    EditorState.createEmpty(compositDecorator)
  );
  const [showUrlInput, setShowUrlIput] = useState(false);
  const [url, setUrl] = useState("");
  const domEditor = useRef(null);
  const urlInput = useRef(null);

  useEffect(() => {
    domEditor.current && domEditor.current.focus();

    showUrlInput && urlInput.current && urlInput.current.focus();
  }, [domEditor, showUrlInput]);

  const onChange = editorState => setEditorState(editorState);

  //Using HandleKeyCommand
  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (command === "myeditor-save") {
      console.log("saved!");
    }

    if (newState) {
      onChange(newState);
      return "handled";
    }
    return "not-handled";
  };
  //Rich editing with UI
  const handleBold = () =>
    onChange(RichUtils.toggleInlineStyle(editorState, "BOLD"));

  //Managing Focus
  const focus = () => domEditor.current.focus();

  //Block styling
  const myBlockStyleFunc = contentBlock => {
    const type = contentBlock.getType();
    if (type === "code-block") {
      return "superFancyBlockquote";
    }
  };

  //Custom Block Rendering
  const blockRenderMap = Immutable.Map({
    // unstyled: {//1. type 이 unstyled 일 경우,
    //   element: "h2" //2. h2 element 로 랜더링 한다.
    // },
    section: {
      // 1. type 이 section 일 경우,
      element: "section" //2. section element 로 렌더링 한다.
    },
    "code-block": {
      // 1. type 이 code-block 일 경우,
      element: "pre", // 2. element 는 pre 로 렌더링 하고
      wrapper: <MyCustomBlock /> // 3. 각 element 들은 MyCoustomBlock 으로 감싼다.
    }
  });

  const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(
    blockRenderMap
  );

  //Link entites
  const promptForLink = e => {
    e.preventDefault();
    const selection = editorState.getSelection();
    console.log("selection", selection);
    if (!selection.isCollapsed()) {
      const contentState = editorState.getCurrentContent();
      const startKey = selection.getStartKey();
      console.log("startKey", startKey);
      const startOffset = selection.getStartOffset();
      console.log("startOffset", startOffset);
      const blockWithLinkAtBeginning = contentState.getBlockForKey(startKey);
      const linkKey = blockWithLinkAtBeginning.getEntityAt(startOffset);

      let url = "";
      if (linkKey) {
        const linkInstance = contentState.getEntity(linkKey);
        console.log("linkInstance", linkInstance);
        url = linkInstance.getData().url;
      }

      setShowUrlIput(true);
      setUrl(url);
      setTimeout(() => urlInput.current && urlInput.current.focus(), 0);
    }
  };

  const onConfirmLink = e => {
    e.preventDefault();
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      "LINK",
      "MUTABLE",
      { url: url }
    );

    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    console.log("LastCreatedEntityKey", entityKey);

    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity
    });
    setEditorState(
      RichUtils.toggleLink(
        newEditorState,
        newEditorState.getSelection(),
        entityKey
      )
    );
    setShowUrlIput(false);
    setUrl("");
  };
  let urlInputComp;
  if (showUrlInput) {
    urlInputComp = (
      <UrlInput
        value={url}
        onChange={e => setUrl(e.target.value)}
        urlInput={urlInput}
        onConfirmLink={onConfirmLink}
      />
    );
  }

  return (
    <AppContainer>
      <EditorContainer>
        <button onClick={handleBold}>bold</button>
        <button onClick={promptForLink}>link</button>
        {urlInputComp}
        <EditorWrapper onClick={focus}>
          <Editor
            editorState={editorState}
            handleKeyCommand={handleKeyCommand}
            keyBindingFn={myKeybindingFn}
            onChange={onChange}
            ref={domEditor}
            blockStyleFn={myBlockStyleFunc}
            blockRenderMap={extendedBlockRenderMap}
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
  height: 500px;
  background-color: white;
`;

export default Home;
