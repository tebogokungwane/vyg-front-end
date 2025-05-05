import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Spin,
} from "antd";
import {
  TeamOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  DeploymentUnitOutlined,
  TrophyOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import axios from "axios";
import UserContext from "../context/UserContext";
import NationPerformanceOverview from "../components/NationPerformanceOverview";

const Dashboard = () => {
  const { user } = useContext(UserContext);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // ✅ moved to top

  // Detect screen size changes
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.address?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:2025/api/dashboard/summary?addressId=${user.address.id}`
        );
        setStats(response.data);
      } catch (err) {
        console.error("❌ Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: isMobile ? "20px" : "60px",
        backgroundColor: "#ffffff",
        minHeight: "100vh",
      }}
    >
      {/* Top row: Members, Mentors, Secretaries */}
      <Row gutter={[10, 10]}>
        <Col span={8}>
            <Statistic
              title="Total Members"
              value={stats?.totalMembers ?? "No data"}
              prefix={<TeamOutlined />}
              valueStyle={{ fontSize: isMobile ? "16px" : "24px" }}
            />
        </Col>
        <Col span={8}>
            <Statistic
              title="Mentors"
              value={stats?.totalMentors ?? "No data"}
              prefix={<UserOutlined />}
              valueStyle={{ fontSize: isMobile ? "16px" : "24px" }}
            />
        </Col>
        <Col span={8}>
            <Statistic
              title="Secretaries"
              value={stats?.totalSecretaries ?? "No data"}
              prefix={<UsergroupAddOutlined />}
              valueStyle={{ fontSize: isMobile ? "16px" : "24px" }}
            />
        </Col>
      </Row>

      {/* Middle row: hide on mobile */}
      {!isMobile && (
        <Row gutter={[16, 16]} style={{ marginTop: "40px" }}>
          <Col span={8}>
              <Statistic
                title="Total Nations"
                value={stats?.totalNations ?? "No data"}
                prefix={<DeploymentUnitOutlined />}
              />
          </Col>
          <Col span={8}>
              <Statistic
                title="Total Points"
                value={stats?.totalPoints ?? "No data"}
                prefix={<TrophyOutlined />}
              />
          </Col>
          <Col span={8}>
              <h3 style={{ marginTop: 10 }}>🏆 Leading Nation</h3>
              <div style={{ fontSize: 18, fontWeight: "bold", marginTop: 8 }}>
                {stats?.topNation ?? "No data"}
              </div>
          </Col>
        </Row>
      )}

      <div style={{ marginTop: 30 }}>
        <h2 style={{ textAlign: "center", marginBottom: 30 }}>
        </h2>
        <NationPerformanceOverview />
      </div>
    </div>
  );
};

export default Dashboard;
