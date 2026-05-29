import React, { useContext, useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import axios from "../utils/axios";
import UserContext from '../context/UserContext';
import fallbackLogo from '../images/vyg.jpg';

const BG_URL = `${process.env.REACT_APP_API_BASE_URL}/api/branding/background`;

const Login = () => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [logoSrc, setLogoSrc] = useState(fallbackLogo);
  const [loading, setLoading] = useState(false);
  const [bgImage, setBgImage] = useState(null);

  useEffect(() => {
    // Load logo
    const img = new Image();
    img.src = `${process.env.REACT_APP_API_BASE_URL}/api/branding/logo?t=${Date.now()}`;
    img.onload = () => setLogoSrc(img.src);
    img.onerror = () => setLogoSrc(fallbackLogo);

    // Load background image
    const bgImg = new Image();
    bgImg.src = `${BG_URL}?t=${Date.now()}`;
    bgImg.onload = () => setBgImage(bgImg.src);
    bgImg.onerror = () => setBgImage(null); // Use default gradient
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await axios.post(`/api/member/login`, {
        email: values.email,
        password: values.password
      }, {
        headers: { "Content-Type": "application/json" }
      });

      if (res.status === 200) {
        const { token, member, addressId } = res.data;
        console.log("✅ Full Login Response:", res.data);

        localStorage.setItem("token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        setUser({
          ...member,
          token,
          address: { id: addressId || member.address?.id }
        });

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
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: bgImage
      ? `url(${bgImage}) center/cover no-repeat fixed`
      : "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    position: "relative",
    overflow: "hidden",
    padding: 20,
  };

  return (
    <div style={containerStyle}>
      {/* Overlay for readability when background image is set */}
      {bgImage && (
        <div style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 0,
        }} />
      )}

      {/* Animated background circles (only show when no bg image) */}
      {!bgImage && (
        <>
          <div style={styles.bgCircle1}></div>
          <div style={styles.bgCircle2}></div>
          <div style={styles.bgCircle3}></div>
        </>
      )}

      {/* Glass card */}
      <div style={styles.glassCard} className="login-glass-card">
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <img src={logoSrc} alt="VYG Logo" style={styles.logo} />
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Sign in to your account</p>
        </div>

        <Form
          name="login_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" }
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: "rgba(255,255,255,0.6)" }} />}
              placeholder="Email address"
              size="large"
              style={styles.input}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "rgba(255,255,255,0.6)" }} />}
              placeholder="Password"
              size="large"
              style={styles.input}
            />
          </Form.Item>

          <div style={{ textAlign: "right", marginBottom: 16 }}>
            <Link to="/forgot-password" style={styles.forgotLink}>
              Forgot password?
            </Link>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              disabled={loading}
              style={styles.loginBtn}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </Form.Item>
        </Form>
      </div>

      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(15px, 15px) scale(1.05); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .login-glass-card {
          animation: fadeInUp 0.6s ease-out;
        }
        .login-glass-card .ant-form-item-label > label {
          color: rgba(255,255,255,0.85) !important;
        }
        .login-glass-card .ant-input-affix-wrapper {
          background: rgba(255,255,255,0.1) !important;
          border: 1px solid rgba(255,255,255,0.2) !important;
          border-radius: 10px !important;
        }
        .login-glass-card .ant-input-affix-wrapper input {
          background: transparent !important;
          color: #fff !important;
        }
        .login-glass-card .ant-input-affix-wrapper input::placeholder {
          color: rgba(255,255,255,0.5) !important;
        }
        .login-glass-card .ant-input-password-icon {
          color: rgba(255,255,255,0.6) !important;
        }
      `}</style>
    </div>
  );
};

const styles = {
  bgCircle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: "50%",
    background: "rgba(24, 144, 255, 0.15)",
    top: "-50px",
    left: "-50px",
    animation: "float1 8s ease-in-out infinite",
  },
  bgCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: "50%",
    background: "rgba(114, 46, 209, 0.15)",
    bottom: "50px",
    right: "-30px",
    animation: "float2 6s ease-in-out infinite",
  },
  bgCircle3: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: "50%",
    background: "rgba(82, 196, 26, 0.1)",
    top: "60%",
    left: "10%",
    animation: "float3 7s ease-in-out infinite",
  },
  glassCard: {
    width: "100%",
    maxWidth: 400,
    padding: "40px 32px",
    background: "rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: 20,
    border: "1px solid rgba(255, 255, 255, 0.15)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
    position: "relative",
    zIndex: 1,
  },
  logo: {
    width: 90,
    height: 90,
    objectFit: "contain",
    borderRadius: "50%",
    border: "3px solid rgba(255,255,255,0.2)",
    boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
  },
  title: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: 700,
    marginTop: 16,
    marginBottom: 4,
  },
  subtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    margin: 0,
  },
  input: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 10,
    color: "#fff",
    height: 46,
  },
  forgotLink: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    textDecoration: "none",
  },
  loginBtn: {
    height: 46,
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 600,
    background: "linear-gradient(135deg, #1890ff, #722ed1)",
    border: "none",
    boxShadow: "0 4px 15px rgba(24, 144, 255, 0.4)",
  },
};

export default Login;
