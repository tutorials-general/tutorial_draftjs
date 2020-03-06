import { RichUtils, EditorState } from "draft-js";

export const getPromptForLink = ({
  editorState,
  setShowUrlIput,
  setUrlLink,
  urlInput
}) => e => {
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
    setUrlLink(url);
    setTimeout(() => urlInput.current && urlInput.current.focus(), 0);
  }
};

export const getOnConfirmLink = ({
  editorState,
  setEditorState,
  setShowUrlIput,
  setUrlLink,
  urlLink
}) => e => {
  e.preventDefault();
  const contentState = editorState.getCurrentContent();
  const contentStateWithEntity = contentState.createEntity("LINK", "MUTABLE", {
    url: urlLink
  });

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
  setUrlLink("");
};
