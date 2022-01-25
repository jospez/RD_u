import React from "react";
import { useColorPair } from "@sajtempler/react-hooks";
import { Badge } from "react-bootstrap";
import { getContractAddress, isProd } from "./utils";

const ContractBadge = ({ contractName }) => {
  const { color, backgroundColor } = useColorPair(contractName);

  const openContractOnEtherscan = () =>
    window.open(
      `https://${
        isProd() ? "" : "ropsten."
      }etherscan.io/address/${getContractAddress(contractName)}`,
      "_blank"
    );

  return (
    <Badge
      onClick={openContractOnEtherscan}
      style={{
        marginLeft: "1rem",
        padding: ".5rem",
        color,
        backgroundColor,
        cursor: "pointer",
      }}
    >
      {contractName}
    </Badge>
  );
};

export default ContractBadge;
