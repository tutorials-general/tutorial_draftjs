import React, { useEffect, useState } from "react";
import styled from "styled-components";
import DraftOffsetKey from "draft-js/lib/DraftOffsetKey";

export default function SideBarButtonComp({ editorState }) {
  const [sidebarPosition, setSidebarPosition] = useState({
    transform: "scale(0)"
  });

  useEffect(() => {
    const currentContent = editorState.getCurrentContent();

    const selection = editorState.getSelection();
    const currentBlock = currentContent.getBlockForKey(selection.getStartKey());
    const offsetKey = DraftOffsetKey.encode(currentBlock.getKey(), 0, 0);
    const node = document.querySelectorAll(
      `[data-offset-key="${offsetKey}"]`
    )[0];
    if (!selection.getHasFocus()) {
      setSidebarPosition({
        transform: "scale(0)",
        transition: "transform 0.15s cubic-bezier(.3,1.2,.2,1)",
        top: node.offsetTop
      });
      return;
    } else {
      console.log("node.offsetTop", node.offsetTop);
      setSidebarPosition({
        transform: "scale(1)",
        top: node.offsetTop,
        transition: "transform 0.15s cubic-bezier(.3,1.2,.2,1)"
      });
    }
  }, [editorState]);
  return (
    <SidbarContainer style={sidebarPosition}>
      <SideBarButton>+</SideBarButton>
    </SidbarContainer>
  );
}

const SidbarContainer = styled.div`
  position: absolute;
  left: -40px;
`;

const SideBarButton = styled.div`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background-color: black;
  color: white;
  text-align: center;
  font-szie: 20px;
  cursor: pointer;
`;
