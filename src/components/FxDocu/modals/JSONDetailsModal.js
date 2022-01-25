import React from "react";

import { Button, Col, Dropdown, Form, Modal, Row } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { jsonDetailsModal } from "../slice/fxDocuModals.actions.js";
import { setDateFiledValue } from "../../Fiduciary/utils.js";
import { exportToJson, getExportFormattedDate } from "../utils.js";

const gridRowStyles = {
  marginLeft: ".25rem",
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  rowGap: "1rem",
};

const JSONDetailsModal = ({ actions, isVisible, data }) => {
  console.log(JSON.stringify(data));

  const { register, handleSubmit, reset } = useForm();

  const downloadJSON = (formData) => {
    exportToJson(`${data?.isin}_export`, createJsonPayload(data, formData));
    reset();
  };

  return (
    <Modal
      size="lg"
      show={isVisible}
      onHide={() => {
        actions.jsonDetailsModal();
      }}
      centered
    >
      <Modal.Header closeButton>
        <Col>
          <h3>JSON Details</h3>
        </Col>
      </Modal.Header>
      <Modal.Body>
        <Row
          style={{
            ...gridRowStyles,
          }}
        >
          <Col className="text-muted app-vertical-center">ISIN:</Col>
          <Col className="app-vertical-center" style={{ paddingLeft: 0 }}>
            {data?.isin ?? "Not Available"}
          </Col>
          <Col className="text-muted app-vertical-center">Currency pair:</Col>
          <Col className="app-vertical-center" style={{ paddingLeft: 0 }}>
            {`${data?.baseCurrency}${data?.quoteCurrency}` ?? "Not Available"}
          </Col>
          <Col className="text-muted app-vertical-center">
            Investment currency:
          </Col>
          <Col className="app-vertical-center" style={{ paddingLeft: 0 }}>
            {data?.investmentCurrency ?? "Not Available"}
          </Col>
          <Col className="text-muted app-vertical-center">Alt currency:</Col>
          <Col className="app-vertical-center" style={{ paddingLeft: 0 }}>
            {data?.altCurrency ?? "Not Available"}
          </Col>
          <Col className="text-muted app-vertical-center">Owner:</Col>
          <Col className="app-vertical-center" style={{ paddingLeft: 0 }}>
            {data?.owner ?? "Not Available"}
          </Col>
          <Col className="text-muted app-vertical-center">Expiry:</Col>
          <Col className="app-vertical-center" style={{ paddingLeft: 0 }}>
            {new Date(data?.expiry).toLocaleString() ?? "Not Available"}
          </Col>
        </Row>
        <Dropdown.Divider style={{ margin: "1rem 0" }} />
        <Form
          style={{ padding: "0 1.25rem" }}
          onSubmit={handleSubmit(downloadJSON)}
        >
          <Form.Group as={Row}>
            <Form.Label className="text-muted" column sm={4}>
              Term type
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                {...register("termType")}
                type="text"
                placeholder="Indikatives or Finales"
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row}>
            <Form.Label className="text-muted" column sm={4}>
              Rating
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                {...register("rating")}
                type="text"
                placeholder="e.g. AAA"
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row}>
            <Form.Label className="text-muted" column sm={4}>
              Redemption Date
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                {...register("redemptionDate", {
                  setValueAs: setDateFiledValue,
                })}
                type="date"
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row}>
            <Form.Label className="text-muted" column sm={4}>
              Issue Date
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                {...register("issueDate", {
                  setValueAs: setDateFiledValue,
                })}
                type="date"
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row}>
            <Form.Label className="text-muted" column sm={4}>
              Pricing Date
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                {...register("pricingDate", {
                  setValueAs: setDateFiledValue,
                })}
                type="date"
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row}>
            <Form.Label className="text-muted" column sm={4}>
              InvCCY Alt Text
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                {...register("invCCYText")}
                type="text"
                placeholder="e.g. Great British Pounds"
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row}>
            <Form.Label className="text-muted" column sm={4}>
              AltCCY Alt Text
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                {...register("altCCYText")}
                type="text"
                placeholder="e.g. Great British Pounds"
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row}>
            <Form.Label className="text-muted" column sm={4}>
              Initial Level
            </Form.Label>
            <Col sm={8}>
              <Form.Control {...register("initialLevel")} type="text" />
            </Col>
          </Form.Group>

          <Form.Group as={Row}>
            <Form.Label className="text-muted" column sm={4}>
              BondFloor Option
            </Form.Label>
            <Col sm={8}>
              <Form.Control {...register("bondFloorOption")} type="text" />
            </Col>
          </Form.Group>

          <Form.Group as={Row}>
            <Form.Label className="text-muted" column sm={4}>
              BondFloor Interest
            </Form.Label>
            <Col sm={8}>
              <Form.Control {...register("bondFloorInterest")} type="text" />
            </Col>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button onClick={handleSubmit(downloadJSON)}>Download JSON</Button>
      </Modal.Footer>
    </Modal>
  );
};

function mapStateToProps(state) {
  return {
    isVisible: state.fxDocuModals.jsonDetailsModal.isVisible,
    data: state.fxDocuModals.jsonDetailsModal.data,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    actions: bindActionCreators(
      {
        jsonDetailsModal,
      },
      dispatch
    ),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(JSONDetailsModal);

function createJsonPayload(data, form) {
  return [
    {
      key: "AltCCY",
      value: data?.altCurrency ?? "n/a",
    },
    {
      key: "Ethereum_Adress",
      value: data?.owner ?? "n/a",
    },
    {
      key: "CCY2",
      value: data?.altCurrency ?? "n/a",
    },
    {
      key: "Terms_type",
      value: form?.termType ?? "n/a",
    },
    {
      key: "CCY1",
      value: data?.investmentCurrency ?? "n/a",
    },
    {
      key: "Rating",
      value: form?.rating ?? "n/a",
    },
    {
      key: "Expiration_Date",
      value: getExportFormattedDate(data?.expiry),
    },
    {
      key: "Institution",
      value: "UBS AG",
    },
    {
      key: "Expiration_Hour",
      value: `${new Date(data?.expiry).getHours()}Uhr`,
    },
    {
      key: "Issue_Date",
      value: form?.issueDate,
    },
    {
      key: "DayCount",
      value: "30/360",
    },
    {
      key: "AltCCY_Text",
      value: form?.altCCYText,
    },
    {
      key: "InvCCY",
      value: data?.investmentCurrency ?? "n/a",
    },
    {
      key: "Pricing_Date",
      value: form?.pricingDate,
    },
    {
      key: "Initial_level",
      value: form?.initialLevel,
    },
    {
      key: "Business_Days",
      value: "LONDON",
    },
    {
      key: "Coupon",
      value: `${data?.coupon ?? "n/a"}`,
    },
    {
      key: "Expiration_Place",
      value: new Date(data?.expiry).getHours() === 10 ? "New York" : "Tokyo",
    },
    {
      key: "InvCCY_Text",
      value: form?.invCCYText,
    },
    {
      key: "Strike_level",
      value: `${data?.strike ?? "n/a"}`,
    },
    {
      key: "Bondfloor_option",
      value: form?.bondFloorOption,
    },
    {
      key: "Bondfloor_interest",
      value: form?.bondFloorInterest,
    },
    {
      key: "Emission_Volume",
      value: `${data?.notional ?? "n/a"}`, //todo is this the same as notional / nominal?
    },
    {
      key: "Link_public_asset",
      value: `${window.location.href}/fxDocuDetails/${data?.tokenId}/contract/${data?.contractName}`,
    },
    {
      key: "TokenID",
      value: data?.tokenId,
    },
    {
      key: "Nominal",
      value: `${data?.notional ?? "n/a"}`, //todo is this the same as notional / nominal?
    },
  ];
}
