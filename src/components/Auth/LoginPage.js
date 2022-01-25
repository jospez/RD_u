import React from "react";
import { Alert, Button, Container, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";

import { useLogin, useToken } from "./hooks";

const LoginPage = () => {
  const { setToken } = useToken();
  const { error, errorCount, loading, login } = useLogin();

  const { register, handleSubmit } = useForm({
    defaultValues: {
      secret: "",
    },
  });

  const submit = ({ secret }) => {
    if (secret) {
      login(secret, setToken);
    }
  };

  return (
    <Container
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        marginTop: "3rem",
        marginBottom: "1rem",
      }}
    >
      <h1>Gatekeeper</h1>

      <Form style={{ minWidth: "50%" }} onSubmit={handleSubmit(submit)}>
        <Form.Control
          {...register("secret", {
            required: true,
          })}
          style={{ margin: "2rem 0" }}
          size="lg"
          type="password"
          placeholder="Whisper the secret"
        />
        <Button
          disabled={loading === "PENDING"}
          block
          size="lg"
          variant="success"
          type="submit"
          role="submit"
        >
          Let me in!
        </Button>
        {error && (
          <Alert
            style={{
              marginTop: "2rem",
              fontSize: `${1 + errorCount / 3}rem`,
            }}
            variant="danger"
          >
            {error?.message || "This secret has no use here"}
          </Alert>
        )}
      </Form>
    </Container>
  );
};

export default LoginPage;
