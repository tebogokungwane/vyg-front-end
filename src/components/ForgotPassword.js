// src/components/ForgotPassword.js
import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import axios from "axios";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = (values) => {
    setLoading(true);
    axios
      .post("http://localhost:2025/api/auth/forgot-password", {
        email: values.email,
      })
      .then(() => {
        message.success("Reset link sent to your email");
      })
      .catch(() => {
        message.error("Failed to send reset link. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto" }}>
      <h2>Forgot Password</h2>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="email"
          label="Email Address"
          rules={[{ required: true, message: "Please enter your email" }]}
        >
          <Input type="email" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Send Reset Link
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ForgotPassword;
