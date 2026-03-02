import React from "react";

/** Tag */
const Tag = ({ children, variant = "default" }) => {
  return <span className={`tag tag-${variant}`}>{children}</span>; /** Peut contenir Critical, High etc.. */
};

export default Tag;