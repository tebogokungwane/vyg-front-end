import { useState, useEffect, useContext } from "react";
import { Card, Row, Col, Spin, Alert, Typography } from "antd";
import {
  TeamOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  DeploymentUnitOutlined,
  TrophyOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import axios from "../utils/axios";
import UserContext from "../context/UserContext";
import NationPerformanceOverview from "../components/NationPerformanceOverview";

const { Title, Text } = Typography;

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      const addressId = user?.address?.id;
      if (!addressId) return;

      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/api/dashboard/summary?addressId=${addressId}`);
        setStats(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.address?.id]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert message={error} type="error" showIcon style={{ margin: 20 }} />;
  }

  const statCards = [
    {
      title: "Total Members",
      value: stats?.totalMembers ?? 0,
      icon: <TeamOutlined />,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      title: "Mentors",
      value: stats?.totalMentors ?? 0,
      icon: <UserOutlined />,
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      title: "Secretaries",
      value: stats?.totalSecretaries ?? 0,
      icon: <UsergroupAddOutlined />,
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      title: "Nations",
      value: stats?.totalNations ?? 0,
      icon: <DeploymentUnitOutlined />,
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    },
    {
      title: "Total Points",
      value: stats?.totalPoints ?? 0,
      icon: <TrophyOutlined />,
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    },
    {
      title: "Leading Nation",
      value: stats?.topNation || "—",
      icon: <RiseOutlined />,
      gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
      isText: true,
    },
  ];

  return (
    <div style={{ padding: isMobile ? 12 : 24, minHeight: "100vh" }}>
      {/* Welcome Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1890ff, #722ed1)",
          borderRadius: 20,
          padding: isMobile ? "20px 16px" : "28px 32px",
          marginBottom: 24,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -30,
            right: -30,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -20,
            left: "40%",
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }}
        />
        <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
          Welcome back,
        </Text>
        <Title level={isMobile ? 4 : 3} style={{ color: "#fff", margin: "4px 0 0" }}>
          {user?.name} {user?.surname} 👋
        </Title>
      </div>

      {/* Stats Grid */}
      <Row gutter={[16, 16]}>
        {statCards.map((card, index) => (
          <Col xs={12} sm={8} md={8} key={index}>
            <Card
              style={{
                borderRadius: 16,
                border: "none",
                overflow: "hidden",
                height: "100%",
              }}
              styles={{ body: { padding: isMobile ? 14 : 20 } }}
            >
              <div
                style={{
                  width: isMobile ? 36 : 44,
                  height: isMobile ? 36 : 44,
                  borderRadius: 12,
                  background: card.gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                  fontSize: isMobile ? 18 : 22,
                  color: "#fff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                {card.icon}
              </div>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>
                {card.title}
              </div>
              <div
                style={{
                  fontSize: card.isText ? (isMobile ? 14 : 16) : (isMobile ? 20 : 28),
                  fontWeight: 700,
                  color: "#1a1a1a",
                  lineHeight: 1.2,
                }}
              >
                {typeof card.value === "number" ? card.value.toLocaleString() : card.value}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Performance Overview */}
      <div
        style={{
          marginTop: 24,
          background: "#fff",
          borderRadius: 16,
          padding: isMobile ? 12 : 20,
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
      >
        <NationPerformanceOverview />
      </div>
    </div>
  );
};

export default Dashboard;
