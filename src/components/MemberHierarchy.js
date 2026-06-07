import { useState, useEffect, useContext } from "react";
import { Avatar, Tag, Spin, Empty, Input, Collapse } from "antd";
import {
  TeamOutlined,
  UserOutlined,
  SearchOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import axios from "../utils/axios";
import UserContext from "../context/UserContext";

const MemberHierarchy = () => {
  const [mentorsWithMentees, setMentorsWithMentees] = useState([]);
  const [nations, setNations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const { user } = useContext(UserContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (user?.address?.id) fetchHierarchy();
  }, [user]);

  const fetchHierarchy = async () => {
    setLoading(true);
    try {
      const addressId = user.address.id;
      const [membersRes, nationsRes] = await Promise.all([
        axios.get(`/api/member/all-members/address/${addressId}`),
        axios.get(`/api/nations`),
      ]);

      const members = membersRes.data || [];
      setNations(nationsRes.data || []);

      // Group: Nation → Mentors → Members
      const mentors = members.filter((m) => m.role?.toLowerCase() === "mentor");
      const enriched = mentors.map((mentor) => ({
        ...mentor,
        mentees: members.filter(
          (m) => m.mentor?.id === mentor.id && m.id !== mentor.id
        ),
      }));

      setMentorsWithMentees(enriched);
    } catch (err) {
      console.error("Failed to fetch hierarchy:", err);
    } finally {
      setLoading(false);
    }
  };

  // Group mentors by nation
  const groupedByNation = {};
  mentorsWithMentees.forEach((mentor) => {
    const nation = mentor.nation?.nation || "Unassigned";
    if (!groupedByNation[nation]) groupedByNation[nation] = [];
    groupedByNation[nation].push(mentor);
  });

  // Filter by search
  const filteredNations = Object.entries(groupedByNation).filter(([nation, mentors]) => {
    if (!searchText) return true;
    const s = searchText.toLowerCase();
    if (nation.toLowerCase().includes(s)) return true;
    return mentors.some(
      (m) =>
        `${m.name} ${m.surname}`.toLowerCase().includes(s) ||
        m.mentees.some((me) => `${me.name} ${me.surname}`.toLowerCase().includes(s))
    );
  });

  const getNationColor = (nation) => {
    const colors = ["#1890ff", "#52c41a", "#722ed1", "#fa8c16", "#eb2f96", "#13c2c2"];
    const index = nations.findIndex((n) => n.nation === nation);
    return colors[index % colors.length] || "#1890ff";
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: 60 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ padding: isMobile ? 12 : 20, maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: isMobile ? 18 : 22 }}>
          🌳 Team Structure
        </h2>
        <p style={{ color: "#888", fontSize: 13, margin: 0 }}>
          Nations → Mentors → Members
        </p>
      </div>

      {/* Search */}
      <Input
        placeholder="Search by name or nation..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 20, borderRadius: 10, maxWidth: 400 }}
        allowClear
      />

      {filteredNations.length === 0 ? (
        <Empty description="No hierarchy data available" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filteredNations.map(([nation, mentors]) => (
            <div
              key={nation}
              style={{
                borderRadius: 16,
                border: "1px solid #f0f0f0",
                overflow: "hidden",
                background: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              {/* Nation Header */}
              <div
                style={{
                  background: `linear-gradient(135deg, ${getNationColor(nation)}22, ${getNationColor(nation)}08)`,
                  borderBottom: `2px solid ${getNationColor(nation)}`,
                  padding: "14px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: getNationColor(nation),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 16,
                  }}
                >
                  <TeamOutlined />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{nation}</div>
                  <div style={{ fontSize: 11, color: "#888" }}>
                    {mentors.length} mentor{mentors.length !== 1 ? "s" : ""} •{" "}
                    {mentors.reduce((sum, m) => sum + m.mentees.length, 0)} members
                  </div>
                </div>
              </div>

              {/* Mentors */}
              <div style={{ padding: "12px 16px" }}>
                {mentors.map((mentor) => (
                  <div key={mentor.id} style={{ marginBottom: 12 }}>
                    {/* Mentor row */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 12px",
                        borderRadius: 10,
                        background: "#f9f0ff",
                        border: "1px solid #d3adf7",
                        marginBottom: 6,
                      }}
                    >
                      <Avatar style={{ backgroundColor: "#722ed1" }} size={32}>
                        <CrownOutlined />
                      </Avatar>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>
                          {mentor.name} {mentor.surname}
                        </span>
                        <Tag color="purple" style={{ marginLeft: 8, fontSize: 10 }}>Mentor</Tag>
                      </div>
                      <Tag color="default" style={{ fontSize: 10 }}>
                        {mentor.mentees.length} mentee{mentor.mentees.length !== 1 ? "s" : ""}
                      </Tag>
                    </div>

                    {/* Mentees */}
                    {mentor.mentees.length > 0 && (
                      <div style={{ marginLeft: isMobile ? 16 : 32, borderLeft: "2px solid #f0f0f0", paddingLeft: 12 }}>
                        {mentor.mentees.map((mentee) => (
                          <div
                            key={mentee.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "8px 10px",
                              borderRadius: 8,
                              marginBottom: 4,
                              transition: "background 0.2s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <Avatar size={26} style={{ backgroundColor: "#1890ff", fontSize: 11 }}>
                              {mentee.name?.charAt(0)}
                            </Avatar>
                            <span style={{ fontSize: 13 }}>
                              {mentee.name} {mentee.surname}
                            </span>
                            {mentee.role && mentee.role.toLowerCase() !== "member" && (
                              <Tag color="blue" style={{ fontSize: 10 }}>{mentee.role}</Tag>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {mentor.mentees.length === 0 && (
                      <div style={{ marginLeft: isMobile ? 16 : 32, paddingLeft: 12, fontSize: 12, color: "#bbb", fontStyle: "italic" }}>
                        No mentees assigned
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemberHierarchy;
