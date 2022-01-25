import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Card, Spinner, Button } from "react-bootstrap";
import { CSAG_SERVICE } from "../../redux/serviceEndpoints.js";
import {
  arrayBufferToHex,
  formatDateString,
  getEtherscanLinkForToken,
  thousandsSeparator,
} from "./utils.js";
import { applyPowerDivision } from "../../math.utils.js";
import { applyProdParam, applyRealmParam } from "../FxDocu/utils.js";
import { defaultHeaders } from "../Auth/config";

function decodeBase64(en) {
  var de = new Uint8Array(en.length); //3/4
  var u = 0,
    q = "",
    x = "",
    c;
  var map64 =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  for (
    var r = 0;
    (c = en[x++]);
    ~c && ((u = q % 4 ? u * 64 + c : c), q++ % 4)
      ? (de[r++] = 255 & (u >> ((-2 * q) & 6)))
      : 0
  )
    c = map64.indexOf(c);
  var sub = de.subarray || de.subset || de.slice;
  return sub.call(de, 0, r);
}

const FiduciaryDetails = () => {
  const { tokenId, contract } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState("IDLE");

  useEffect(() => {
    setLoading("PENDING");
    fetch(
      `${CSAG_SERVICE}/termsheet?currency=${contract}&tokenId=${tokenId}${applyRealmParam(
        contract
      )}${applyProdParam()}`,
      { headers: { ...defaultHeaders } }
    )
      .then((res) => res.json())
      .then((res) => {
        res.amounts = res.amounts.map((v) => applyPowerDivision(v));
        res.rates = res.rates.map((v) => applyPowerDivision(v));
        res.stringsAndBytes = res.stringsAndBytes.map((v, i) => {
          if (i === 1) return v;
          return atob(v).replace(/\x00/g, "");
        });

        setItems([
          ["Investment Currency", res?.currency ?? "error retrieving data"],
          [
            "Trade Date",
            formatDateString(res?.dates?.[0]) ?? "error retrieving data",
          ],
          [
            "Starting Date",
            formatDateString(res?.dates?.[1]) ?? "error retrieving data",
          ],
          [
            "Maturity Date",
            formatDateString(res?.maturityDate) ?? "error retrieving data",
          ],
          [
            "Principal Amount",
            thousandsSeparator(res?.amounts?.[0]) ?? "error retrieving data",
          ],
          [
            "Interest Amount",
            thousandsSeparator(res?.amounts?.[1]) ?? "error retrieving data",
          ],
          ["Interest Rate", res?.rates?.[0] ?? "error retrieving data"],
          [
            "Day Count Convention",
            res?.stringsAndBytes?.[4] ?? "error retrieving data",
          ],
          [
            "Number of days / Day count basis",
            `${res?.amounts?.[3]}/${res?.amounts?.[2]}` ??
              "error retrieving data",
          ],
          [
            "Business days",
            res?.stringsAndBytes?.[2] ?? "error retrieving data",
          ],
          [
            "Business days convention",
            res?.stringsAndBytes?.[3] ?? "error retrieving data",
          ],
          [
            "Bank LCR Type",
            res?.stringsAndBytes?.[0] ?? "error retrieving data",
          ],
          [
            "Registration Agreement Hash",
            arrayBufferToHex(decodeBase64(res?.stringsAndBytes?.[1])) ??
              "error retrieving data",
          ],
          ["Identifier", res?.uniqueId] ?? "error retrieving data",
          ["Token ID", tokenId] ?? "error retrieving data",
        ]);
        setLoading("LOADED");
      })
      .catch(console.error);
  }, []);

  return (
    <Container fluid style={{ justifyContent: "center" }}>
      <Card style={{ margin: "5rem", padding: "2rem" }}>
        <Card.Title>Fiduciary Deposit Details</Card.Title>
        {loading === "PENDING" && <Spinner />}
        {items.map(([label, value], i) => (
          <Row
            style={{
              background: i % 2 === 0 ? "#f3f3f3" : "transparent",
              padding: ".5rem",
            }}
            key={`${Math.random()}`}
          >
            <Col>{label}</Col>
            <Col>{value}</Col>
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

export default FiduciaryDetails;
