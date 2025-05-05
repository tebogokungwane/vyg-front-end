import React, { useContext } from 'react';
import { Form, Input, Button, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserContext from '../context/UserContext';
import Logo from '../images/vyg.jpg'; // Replace with your logo path
import { Link } from "react-router-dom";



const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext); // 👈 Store logged-in user globally

  const onFinish = async (values) => {
    try {
      const res = await axios.post("http://localhost:2025/api/member/login", {
        email: values.email,
        password: values.password
      });

      if (res.status === 200) {
        message.success("✅ Login successful!");
        setUser(res.data); // 👈 Save the logged-in member
        navigate("/dashboard"); // ✅ Redirect to dashboard
      }
    } catch (error) {
      console.error("❌ Login failed:", error);
      if (error.response && error.response.status === 401) {
        message.error("Invalid email or password");
      } else {
        message.error("An error occurred while logging in");
      }
    }
  };

  return (
    <div
      style={{
        height: "80vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffffff", // Snow white background
      }}
    >
      <div
        style={{
          width: 360,
          padding: "30px 30px",
          backgroundColor: "#ffffff",
          borderRadius: 10,
          boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* ✅ Logo */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
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

        {/* ✅ Login Form */}
        <Form
          name="login_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Enter email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span></span>
              <Link to="/forgot-password" style={{ fontSize: 14 }}>
                Forgot password?
              </Link>
            </div>
          </Form.Item>


          <Form.Item>
            <Button type="primary" htmlType="submit" block style={{ height: 40 }}>
              Login
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
