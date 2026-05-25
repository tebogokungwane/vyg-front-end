import React, { useState } from "react";
import { Form, Input, Button, message, Alert } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import Logo from "../images/vyg.jpg";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await axios.post("/api/auth/forgot-password", { email: values.email });
      setSent(true);
      message.success("Reset link sent to your email!");
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data ||
        "Failed to send reset link. Please check your email and try again.";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0f2f5",
        padding: 20,
      }}
    >
      <div
        style={{
          maxWidth: 400,
          width: "100%",
          background: "#fff",
          padding: 32,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
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

        <h2 style={{ marginBottom: 8 }}>Forgot Password</h2>
        <p style={{ color: "#666", marginBottom: 24 }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {sent && (
          <Alert
            message="Email Sent!"
            description="Check your inbox for the password reset link. It may take a few minutes."
            type="success"
            showIcon
            style={{ marginBottom: 20, textAlign: "left" }}
          />
        )}

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="your.email@example.com"
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              Send Reset Link
            </Button>
          </Form.Item>
        </Form>

        <Button type="link" onClick={() => navigate("/")}>
          ← Back to Login
        </Button>
      </div>
    </div>
  );
};

export default ForgotPassword;
