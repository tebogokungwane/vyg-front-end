import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import Logo from '../images/vyg.jpg'; // Make sure this path is correct

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = (values) => {
    setLoading(true);
    fetch( `/api/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: values.email }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
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
    <div style={{ maxWidth: 400, margin: "100px auto", padding: 20, textAlign: "center" }}>
      {/* ✅ Logo */}
      <div style={{ marginBottom: 24 }}>
        <img
          src={Logo}
          alt="VYG Logo"
          style={{
            width: 80,
            height: 80,
            objectFit: "contain",
            borderRadius: "50%",
          }}
        />
      </div>

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

      <Button type="link" onClick={() => navigate("/")}>
        ← Back to Login
      </Button>
    </div>
  );
};

export default ForgotPassword;
