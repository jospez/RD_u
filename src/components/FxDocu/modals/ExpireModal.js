import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import { expireModal, expire } from "../slice/fxDocuModals.actions.js";
import { Alert, Button, Col, Form, Modal, Spinner } from "react-bootstrap";
import { useForm } from "react-hook-form";

const ExpireModal = ({ actions, isVisible, loading, error, data }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      price: null,
    },
  });

  const submit = ({ price }) => {
    actions.expire(data?.contractName, {
      ...data,
      priority: 3,
      price,
    });
  };

  return (
    <Modal
      size="lg"
      show={isVisible}
      onHide={() => {
        reset();
        actions.expireModal();
      }}
      centered
    >
      <Modal.Header closeButton>
        <Col>
          <h3>Expire</h3>
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
        <Col
          style={{ display: "flex", alignItems: "center" }}
          className="text-muted"
        >
          Level at Expiry:
        </Col>
        <Form.Group style={{ marginBottom: 0 }}>
          <Form.Control
            {...register("price", {
              required: true,
            })}
            readOnly={loading === "PENDING" || loading === "LOADED"}
            type="number"
          />
        </Form.Group>

        <Col></Col>
        <Col style={{ padding: 0 }}>
          {errors?.expiryLevel?.type === "required" && (
            <Form.Text className="text-danger">
              Expiry level has to be defined.
            </Form.Text>
          )}
        </Col>
      </Modal.Body>
      <Modal.Footer>
        {loading === "IDLE" && (
          <Button onClick={handleSubmit(submit)}>Submit</Button>
        )}
        {loading === "PENDING" && (
          <Button
            style={{
              marginLeft: "16px",
            }}
            disabled
          >
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
          </Button>
        )}
        {loading === "NOT_LOADED" && (
          <>
            <Alert variant="danger">{error ?? "Unknown error"}</Alert>
            <Button variant="warning" onClick={handleSubmit(submit)}>
              Try again
            </Button>
          </>
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
    isVisible: state.fxDocuModals.expireModal.isVisible,
    data: state.fxDocuModals.expireModal.data,
    loading: state.fxDocuModals.expireModal.loading,
    error: state.fxDocuModals.expireModal.error,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    actions: bindActionCreators(
      {
        expireModal,
        expire,
      },
      dispatch
    ),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ExpireModal);
