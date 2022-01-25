import React, { useState, useRef } from "react";

import { Button, Col, Modal, Tooltip, Overlay } from "react-bootstrap";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-regular-svg-icons";

import { detailsModal } from "../slice/fxDocuModals.actions.js";

const centerStyles = {
  display: "flex",
  alignItems: "center",
};

const DetailsModal = ({ actions, isVisible, data }) => {
  const [
    { tokenId: showTokenIdTooltip, owner: showOwnerTooltip },
    setShowTooltip,
  ] = useState({
    owner: false,
    tokenId: false,
  });
  const tokenIdTooltipTarget = useRef(null);
  const ownerTooltipTarget = useRef(null);

  const handleCopy = (field) => () => {
    navigator.clipboard.writeText(`${data[field]}`).then(() => {
      setShowTooltip((prev) => ({ ...prev, [field]: true }));
      setTimeout(() => {
        setShowTooltip((prev) => ({ ...prev, [field]: false }));
      }, 1000);
    });
  };
  return (
    <Modal
      size="lg"
      show={isVisible}
      onHide={() => {
        actions.detailsModal();
      }}
      centered
    >
      <Modal.Header closeButton>
        <Col>
          <h3>Transaction Details</h3>
          <h5 className="text-muted">{data?.isin ?? "Not available"}</h5>
        </Col>
      </Modal.Header>
      <Modal.Body
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          rowGap: "1rem",
        }}
      >
        <Col style={{ ...centerStyles }} className="text-muted">
          Network:
        </Col>
        <Col style={{ ...centerStyles, paddingLeft: 0 }}>Ethereum</Col>

        <Col style={{ ...centerStyles }} className="text-muted">
          Token ID:
        </Col>
        <Col
          style={{
            ...centerStyles,
            justifyContent: "space-between",
            paddingLeft: 0,
          }}
        >
          {data?.tokenId ?? "Not available"}
          <Button
            ref={tokenIdTooltipTarget}
            onClick={handleCopy("tokenId")}
            variant="light"
          >
            <FontAwesomeIcon icon={faCopy} />
          </Button>
        </Col>

        <Col style={{ ...centerStyles }} className="text-muted">
          Comment:
        </Col>
        <Col style={{ ...centerStyles, paddingLeft: 0 }}>
          {data?.comment ?? "No comment"}
        </Col>

        <Col style={{ ...centerStyles }} className="text-muted">
          Origin address:
        </Col>
        <Col
          style={{
            ...centerStyles,
            justifyContent: "space-between",
            paddingLeft: 0,
          }}
        >
          {data?.owner ?? "Not available"}
          <Button
            ref={ownerTooltipTarget}
            onClick={handleCopy("owner")}
            variant="light"
          >
            <FontAwesomeIcon icon={faCopy} />
          </Button>
        </Col>
      </Modal.Body>
      <Overlay target={ownerTooltipTarget?.current} show={showOwnerTooltip}>
        {(props) => <Tooltip {...props}>Copied!</Tooltip>}
      </Overlay>
      <Overlay target={tokenIdTooltipTarget?.current} show={showTokenIdTooltip}>
        {(props) => <Tooltip {...props}>Copied!</Tooltip>}
      </Overlay>
    </Modal>
  );
};

function mapStateToProps(state) {
  return {
    isVisible: state.fxDocuModals.detailsModal.isVisible,
    data: state.fxDocuModals.detailsModal.data,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    actions: bindActionCreators(
      {
        detailsModal,
      },
      dispatch
    ),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DetailsModal);
