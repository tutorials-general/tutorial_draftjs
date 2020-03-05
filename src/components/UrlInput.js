import React from "react";

export default function UrlInput({ onChange, value, onConfirmLink, urlInput }) {
  const onLinkInputKeyDown = e => {
    if (e.which === 13) {
      onConfirmLink(e);
    }
  };
  return (
    <div>
      <input
        onChange={onChange}
        ref={urlInput}
        type="text"
        value={value}
        onKeyDown={onLinkInputKeyDown}
      />
      <button onClick={onConfirmLink}>Confirm</button>
    </div>
  );
}
