import React from "react";
import { ReactComponent as ActiveIcon } from "../../assets/icons/icn_active.svg";
import { ReactComponent as PausedIcon } from "../../assets/icons/icn_paused.svg";
import { ReactComponent as FrozenIcon } from "../../assets/icons/icn_frozen.svg";
import { ReactComponent as ConvertedIcon } from "../../assets/icons/icn_converted.svg";
import { ReactComponent as ExpiredIcon } from "../../assets/icons/icn_expired.svg";

export const getStatusIcon = (label) => {
  switch (label) {
    case "Active":
      return <ActiveIcon style={{ fill: "#07C497" }} />;
    case "Paused":
      return <PausedIcon style={{ fill: "#07C497" }} />;
    case "Frozen":
      return <FrozenIcon style={{ fill: "#4A98FF" }} />;
    case "Converted":
      return <ConvertedIcon style={{ fill: "#07C497" }} />;
    case "Expired":
      return <ExpiredIcon style={{ fill: "#FF0000" }} />;
    default:
      return "n/a";
  }
};
