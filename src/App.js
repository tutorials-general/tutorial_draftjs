import React, { useState, useRef, useEffect } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  CompositeDecorator,
  getDefaultKeyBinding,
  KeyBindingUtil,
  DefaultDraftBlockRenderMap,
  AtomicBlockUtils
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
import { getPromptForLink, getOnConfirmLink } from "./utils/Link";
import MyCustomBlock from "./components/MyCustomBlock";
import Link from "./components/Link";
import UrlInput from "./components/UrlInput";
import UrlInputMedia from "./components/UrlInputMedia";
import Media from "./components/Media";
import SideBarButton from "./components/SideBarButton";

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
  const [urlLink, setUrlLink] = useState("");
  const [showUrlInput, setShowUrlIput] = useState(false);

  const [urlMedia, setUrlMedia] = useState("");
  const [urlMediaType, setUrlMediaType] = useState("");
  const [showUrlInputMedia, setShowUrlInputMedia] = useState(false);
  const [isSelection, setIsSelection] = useState(false);

  const domEditor = useRef(null);
  const urlInput = useRef(null);
  const urlInputMedia = useRef(null);

  useEffect(() => {
    domEditor.current && domEditor.current.focus();

    showUrlInput && urlInput.current && urlInput.current.focus();

    showUrlInputMedia && urlInputMedia.current && urlInputMedia.current.focus();
  }, [domEditor, showUrlInput, showUrlInputMedia]);

  useEffect(() => {
    const selection = editorState.getSelection();
    console.log("selection", selection);
    if (
      selection &&
      (selection.getFocusOffset() !== selection.getAnchorOffset() ||
        selection.getAnchorKey() !== selection.getFocusKey())
    ) {
      setIsSelection(true);
    } else {
      setIsSelection(false);
    }
  }, [editorState]);

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
  const promptForLink = getPromptForLink({
    editorState,
    setShowUrlIput,
    setUrlLink,
    urlInput
  });
  const onConfirmLink = getOnConfirmLink({
    editorState,
    setEditorState,
    setShowUrlIput,
    setUrlLink,
    urlLink
  });

  let urlInputComp;
  if (showUrlInput) {
    urlInputComp = (
      <UrlInput
        value={urlLink}
        onChange={e => setUrlLink(e.target.value)}
        urlInput={urlInput}
        onConfirm={onConfirmLink}
      />
    );
  }

  //Media entities
  const promptForMedia = type => {
    console.log("promt seted type", type);
    setUrlMediaType(type);
    setUrlMedia("");
    setShowUrlInputMedia(true);
  };

  console.log("urlMediaType", urlMediaType);

  const addAudio = () => promptForMedia("audio");
  const addImage = () => promptForMedia("image");
  const addVideo = () => promptForMedia("video");

  const onConfirmMedia = e => {
    e.preventDefault();
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      urlMediaType,
      "IMMUTABLE",
      { src: urlMedia }
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity
    });
    setEditorState(
      AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, " ")
    );
    setUrlMedia("");
    setShowUrlInputMedia(false);
  };

  const mediaBlockRenderer = block => {
    if (block.getType() === "atomic") {
      return {
        component: Media,
        editable: false
      };
    }
    return null;
  };

  let urlInputMediaComp;
  if (showUrlInputMedia) {
    urlInputMediaComp = (
      <UrlInputMedia
        value={urlMedia}
        onChange={e => setUrlMedia(e.target.value)}
        urlInputMedia={urlInputMedia}
        onConfirm={onConfirmMedia}
      />
    );
  }

  return (
    <AppContainer>
      <EditorContainer>
        {isSelection && (
          <>
            <button onClick={handleBold}>bold</button>
            <button onClick={promptForLink}>link</button>{" "}
          </>
        )}

        <button onClick={addAudio}>Add Audio</button>
        <button onClick={addImage}>Add Image</button>
        <button onClick={addVideo}>Add Video</button>

        {urlInputComp}
        {urlInputMediaComp}
        <EditorWrapper onClick={focus}>
          <Editor
            editorState={editorState}
            handleKeyCommand={handleKeyCommand}
            keyBindingFn={myKeybindingFn}
            onChange={onChange}
            ref={domEditor}
            blockStyleFn={myBlockStyleFunc}
            blockRenderMap={extendedBlockRenderMap}
            blockRendererFn={mediaBlockRenderer}
          />
          {/* following sidebar */}
          <SideBarButton editorState={editorState} />
        </EditorWrapper>
      </EditorContainer>
      {/* <Inspector editorState={editorState} /> */}
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
  width: 300px;
  height: 500px;
  background-color: white;
  position: relative;
  font-size: 30px;
`;

export default Home;
