import React from "react";

export default function UrlInput({
  onChange,
  value,
  onConfirm,
  urlInputMedia
}) {
  const onLinkInputKeyDown = e => {
    if (e.which === 13) {
      onConfirm(e);
    }
  };
  return (
    <div>
      <input
        onChange={onChange}
        ref={urlInputMedia}
        type="text"
        value={value}
        onKeyDown={onLinkInputKeyDown}
      />
      <button onClick={onConfirm}>Confirm</button>
    </div>
  );
}
