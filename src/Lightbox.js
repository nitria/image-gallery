import React from "react";
import { RiCloseLine } from "react-icons/ri";

function Lightbox({ photo, openLightbox, closeLightbox }) {
  return (
    <div className={`${openLightbox ? "lightbox active" : "lightbox"}`}>
      <div className="container">
        <RiCloseLine className="close" onClick={() => closeLightbox()} />
        <img src={photo} alt="" />
      </div>
    </div>
  );
}

export default Lightbox;
