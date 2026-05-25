import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  Alert,
  Typography
} from "antd";
import {
  TeamOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  DeploymentUnitOutlined,
  TrophyOutlined
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

  // Enhanced debug logging for user context
  useEffect(() => {
    console.log("User context details:", {
      name: user?.name,
      surname: user?.surname,
      email: user?.email,
      id: user?.id,
      addressId: user?.address?.id,
      role: user?.role || 'Not specified', // This will show if role is missing
      allProperties: user ? Object.keys(user) : 'User not loaded'
    });
    
    // Additional check for role existence
    if (user && !user.role) {
      console.warn("Warning: User role is not defined in user context");
    }
  }, [user]);

  // Detect screen size changes
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch stats - now properly handles undefined addressId
useEffect(() => {
  const fetchStats = async () => {
    const addressId = user?.address?.id;

    if (!addressId) {
      console.warn("addressId is undefined, skipping API call");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `/api/dashboard/summary?addressId=${addressId}`
      );

      console.log("API Response Data:", response.data);
      setStats(response.data);

    } catch (err) {
      console.error("API Error Details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });

      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  fetchStats();
}, [user?.address?.id]);
  
  

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        <Spin size="large" tip="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return <Alert message={error} type="error" showIcon />;
  }

  return (
    <div
      style={{
        padding: isMobile ? "20px" : "60px",
        backgroundColor: "#ffffff",
        minHeight: "100vh",
      }}
    >      
      {/* Top row stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Total Members"
              value={stats?.totalMembers ?? 0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Mentors"
              value={stats?.totalMentors ?? 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Secretaries"
              value={stats?.totalSecretaries ?? 0}
              prefix={<UsergroupAddOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Middle row - hidden on mobile */}
      {!isMobile && (
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Total Nations"
                value={stats?.totalNations ?? 0}
                prefix={<DeploymentUnitOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Total Points"
                value={stats?.totalPoints ?? 0}
                prefix={<TrophyOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Title level={5} style={{ marginBottom: 8 }}>🏆 Leading Nation</Title>
              <Text strong style={{ fontSize: 18 }}>
                {stats?.topNation || "Not available"}
              </Text>
            </Card>
          </Col>
        </Row>
      )}

      <div style={{ marginTop: 30 }}>
        <NationPerformanceOverview />
      </div>
    </div>
  );
};

export default Dashboard;