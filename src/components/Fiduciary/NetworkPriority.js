import React from "react";
import { ToggleButton, ToggleButtonGroup } from "react-bootstrap";

export const NetworkPriority = ({ name, value, onChange }) => {
  return (
    <ToggleButtonGroup
      type="radio"
      name={name}
      style={{ width: "100%" }}
      value={value}
      onChange={onChange}
    >
      <ToggleButton value={1} variant="light">
        Low
      </ToggleButton>
      <ToggleButton value={5} variant="light">
        Medium
      </ToggleButton>
      <ToggleButton value={10} variant="light">
        High
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default NetworkPriority;
