import React, { useContext } from 'react';
import { Form, Input, Button, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from "../components/axios";
import UserContext from '../context/UserContext';
import Logo from '../images/vyg.jpg';
import { Link } from "react-router-dom";

const Login = () => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {

      const res = await axios.post("http://localhost:2025/api/member/login", {
        email: values.email,
        password: values.password
      }, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true
      });


      if (res.status === 200) {
        const { token, member, addressId } = res.data; // Ensure address ID is included
        console.log("✅ Full Login Response:", res.data); // Add this line



        localStorage.setItem("token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // ✅ Update the user context with the address ID
        setUser({
          ...member,
          token,
          address: { id: addressId || member.address?.id }
        });

        // message.success("✅ Login successful!");
        navigate("/dashboard");
      }

    } catch (error) {
      console.error("❌ Login failed:", error);
      if (error.response?.status === 401) {
        message.error("Invalid email or password");
      } else if (error.response?.status === 403) {
        message.warning(error.response.data?.error || "Access forbidden: You are blocked.");
      } else {
        message.error("An error occurred while logging in");
      }
    }

  };

  return (
    <div style={{ height: "80vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#ffffff" }}>
      <div style={{ width: 360, padding: "30px 30px", backgroundColor: "#ffffff", borderRadius: 10, boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <img src={Logo} alt="VYG Logo" style={{ width: 80, height: 80, objectFit: "contain", borderRadius: "50%" }} />
        </div>

        <Form name="login_form" initialValues={{ remember: true }} onFinish={onFinish} layout="vertical">
          <Form.Item name="email" label="Email Address" rules={[{ required: true, message: "Please input your email!" }, { type: "email", message: "Please enter a valid email!" }]}>
            <Input prefix={<UserOutlined />} placeholder="Enter email" />
          </Form.Item>

          <Form.Item name="password" label="Password" rules={[{ required: true, message: "Please input your password!" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Enter password" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span></span>
              <Link to="/forgot-password" style={{ fontSize: 14 }}>Forgot password?</Link>
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block style={{ height: 40 }}>Login</Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
