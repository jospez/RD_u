import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Card, Spinner, Button } from "react-bootstrap";
import { CSAG_SERVICE } from "../../redux/serviceEndpoints.js";
import {
  applyProdParam,
  applyRealmParam,
  getEtherscanLinkForToken,
  getInvestCurrency,
} from "./utils.js";
import { applyPowerDivision } from "../../math.utils.js";
import { defaultHeaders } from "../Auth/config.js";
import { formatDateString } from "../Fiduciary/utils.js";

const FxDocuDetails = () => {
  const { tokenId, contract } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState("IDLE");

  useEffect(() => {
    setLoading("PENDING");
    fetch(
      `${CSAG_SERVICE}/termsheet?currency=${contract}&tokenId=${tokenId}${applyRealmParam(
        contract
      )}${applyProdParam()}`,
      {
        headers: { ...defaultHeaders },
      }
    )
      .then((res) => res.json())
      .then((res) => {
        console.log(res);

        if (typeof res !== "object") {
          return;
        }

        if (res?.amounts) {
          // use new schema
          setItems([
            [
              "Currency Pair",
              `${atob(res?.stringsAndBytes[0])}${atob(
                res?.stringsAndBytes[1]
              )}` ?? "n/a",
            ],
            ["Investment Currency", `${atob(res?.stringsAndBytes[0])}`],
            ["Redemption Currency", "n/a"],
            ["Notional", applyPowerDivision(res?.amount) ?? "n/a"],
            ["Strike", applyPowerDivision(res?.amounts?.[0]) ?? "n/a"],
            ["Expiry", formatDateString(res?.maturityDate) ?? "n/a"],
            ["ISIN", res?.uniqueId ?? "n/a"],
            ["Token ID", tokenId ?? "n/a"],
          ]);
        } else {
          setItems([
            ["Currency Pair", contract?.split("_")?.[0] ?? "n/a"],
            [
              "Investment Currency",
              getInvestCurrency(res?.investBase, contract),
            ],
            ["Redemption Currency", "n/a"],
            ["Notional", applyPowerDivision(res?.amount) ?? "n/a"],
            ["Strike", applyPowerDivision(res?.strike) ?? "n/a"],
            ["Expiry", formatDateString(res?.expiry) ?? "n/a"],
            ["ISIN", res?.isin ?? "n/a"],
            ["Token ID", tokenId ?? "n/a"],
          ]);
        }

        setLoading("LOADED");

        fetch(
          `${CSAG_SERVICE}/redemption?currency=${contract}&tokenId=${tokenId}${applyRealmParam(
            contract
          )}${applyProdParam()}`,
          {
            headers: { ...defaultHeaders },
          }
        )
          .then((res) => res.json())
          .then((res) => {
            console.log(res);
            if (res?.type) {
              setItems((prev) => {
                const update = [...prev];
                // update redemption
                update[2] = res?.type;
                return update;
              });
            }
          });
      })
      .catch(console.error);
  }, [tokenId, contract]);

  return (
    <Container fluid style={{ justifyContent: "center" }}>
      <Card style={{ margin: "5rem", padding: "2rem" }}>
        <Card.Title>Security Token Details</Card.Title>
        {loading === "PENDING" && <Spinner />}
        {items.map(([label, value], i) => (
          <Row
            style={{
              background: i % 2 === 0 ? "#f3f3f3" : "transparent",
              padding: ".5rem",
            }}
            key={`${Math.random()}`}
          >
            <Col sm={4}>{label}</Col>
            <Col sm={8}>{value}</Col>
          </Row>
        ))}
        {loading === "LOADED" && (
          <Button
            style={{ marginTop: "5rem" }}
            onClick={() =>
              window.open(getEtherscanLinkForToken(contract, tokenId), "_blank")
            }
          >
            Etherscan
          </Button>
        )}
      </Card>
    </Container>
  );
};

export default FxDocuDetails;
