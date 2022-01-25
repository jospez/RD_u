import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import { allowTransferModal, transfer } from "../slice/fxDocuModals.actions.js";
import { Alert, Button, Col, Form, Modal } from "react-bootstrap";
import {
  validateAddressLength,
  validateAddressStart,
} from "../../Fiduciary/formValidator.utils.js";
import { useForm } from "react-hook-form";

const AllowTransferModal = ({ actions, isVisible, loading, error, data }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      to: "",
    },
  });

  const submit = ({ to }) => {
    actions.transfer(data?.contractName, {
      priority: 3,
      tokenId: data?.tokenId,
      from: data?.owner,
      to,
    });
  };

  return (
    <Modal
      size="lg"
      show={isVisible}
      onHide={() => {
        reset();
        actions.allowTransferModal();
      }}
      centered
    >
      <Modal.Header closeButton>
        <Col>
          <h3>Allow Transfer</h3>
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
        <Col className="text-muted">Token ID:</Col>
        <Col style={{ paddingLeft: 0 }}>{data?.tokenId ?? "Not available"}</Col>

        <Col className="text-muted">Origin address:</Col>
        <Col style={{ paddingLeft: 0 }}>{data?.owner ?? "Not available"}</Col>

        <Col
          style={{ display: "flex", alignItems: "center" }}
          className="text-muted"
        >
          Destination address:
        </Col>
        <Form.Group style={{ marginBottom: 0 }}>
          <Form.Control
            readOnly={loading === "PENDING" || loading === "LOADED"}
            {...register("to", {
              validate: {
                length: validateAddressLength,
                start: validateAddressStart,
              },
              required: true,
            })}
            type="text"
            placeholder="0x7f..."
          />
        </Form.Group>

        <Col></Col>
        <Col style={{ padding: 0 }}>
          {errors?.to?.type === "required" && (
            <Form.Text className="text-danger">
              Destination address cannot be empty.
            </Form.Text>
          )}
          {errors?.to?.type === "length" && (
            <Form.Text className="text-danger">
              Address has wrong length.
            </Form.Text>
          )}
          {errors?.to?.type === "start" && (
            <Form.Text className="text-danger">
              Address should start with '0x'.
            </Form.Text>
          )}
        </Col>
      </Modal.Body>
      <Modal.Footer>
        {loading === "NOT_LOADED" && (
          <Alert variant="danger">{error ?? "Unknown error"}</Alert>
        )}
        {loading !== "LOADED" && (
          <Button
            onClick={handleSubmit(submit)}
            disabled={loading === "PENDING"}
            variant={!!error ? "warning" : "primary"}
          >
            {!!error ? "Try again" : "Submit"}
          </Button>
        )}
        {loading === "LOADED" && (
          <Button disabled variant="success">
            Submitted
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

function mapStateToProps(state) {
  return {
    isVisible: state.fxDocuModals.transferModal.isVisible,
    data: state.fxDocuModals.transferModal.data,
    loading: state.fxDocuModals.transferModal.loading,
    error: state.fxDocuModals.transferModal.error,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    actions: bindActionCreators(
      {
        allowTransferModal,
        transfer,
      },
      dispatch
    ),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AllowTransferModal);
