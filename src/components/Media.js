import React from "react";

export default function Media(props) {
  const entity = props.contentState.getEntity(props.block.getEntityAt(0));
  console.log("entity", entity);
  const { src } = entity.getData();
  console.log("src", src);
  const type = entity.getType();
  console.log("type", type);
  let media;
  if (type === "audio") {
    media = <Audio src={src} />;
  } else if (type === "image") {
    media = <Image src={src} />;
  } else if (type === "video") {
    media = <Video src={src} />;
  }
  console.log("media", media);
  return media;
}

const Audio = ({ src }) => <audio controls src={src} />;
const Image = ({ src }) => <img src={src} alt={"image23"} />;
const Video = ({ src }) => <video controls src={src} />;
