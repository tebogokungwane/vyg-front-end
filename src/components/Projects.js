import React, { useEffect, useState } from "react";
import { Spin, Empty, Tag, Button, Avatar, List, Select, message, Modal } from "antd";
import { TeamOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import axios from "../utils/axios";
import fallbackLogo from "../images/vyg.jpg";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [reassignConfirm, setReassignConfirm] = useState(null);

  const { Option } = Select;

  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const defaultProjects = [
    { id: "default-1", name: "Sports", imageName: null },
    { id: "default-2", name: "University", imageName: null },
    { id: "default-3", name: "Art & Culture", imageName: null },
    { id: "default-4", name: "Media", imageName: null },
  ];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/projects");
      if (res.data && res.data.length > 0) {
        setProjects(res.data);
      } else {
        setProjects(defaultProjects);
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setProjects(defaultProjects);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectMembers = async (projectId) => {
    setMembersLoading(true);
    try {
      const res = await axios.get(`/api/projects/${projectId}/members`);
      setMembers(res.data || []);
    } catch (err) {
      console.error("Failed to fetch project members:", err);
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    fetchProjectMembers(project.id);
  };

  const handleBack = () => {
    setSelectedProject(null);
    setMembers([]);
  };

  const handleReassignSelect = (member, targetProjectId) => {
    const targetProject = projects.find((p) => p.id === targetProjectId);
    setReassignConfirm({
      member,
      targetProjectId,
      targetProjectName: targetProject?.name || "Project",
    });
  };

  const confirmReassign = async () => {
    if (!reassignConfirm) return;
    try {
      await axios.put("/api/projects/move-member", {
        memberId: reassignConfirm.member.id,
        fromProjectId: selectedProject.id,
        toProjectId: reassignConfirm.targetProjectId,
      });
      message.success(
        `${reassignConfirm.member.name} moved to ${reassignConfirm.targetProjectName}!`
      );
      // Remove from current list
      setMembers((prev) => prev.filter((m) => m.id !== reassignConfirm.member.id));
    } catch (err) {
      console.error("Failed to reassign member:", err);
      message.error("Failed to reassign member.");
    } finally {
      setReassignConfirm(null);
    }
  };

  const getProjectLogo = (project) => {
    if (project.imageName) {
      return `${BASE_URL}/api/projects/${project.id}/image`;
    }
    return fallbackLogo;
  };

  // ====== SELECTED PROJECT: Show members ======
  if (selectedProject) {
    return (
      <div style={{ padding: isMobile ? 12 : 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ borderRadius: 8 }}>
            Back
          </Button>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            }}
          >
            <img
              src={getProjectLogo(selectedProject)}
              alt={selectedProject.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => { e.target.src = fallbackLogo; }}
            />
          </div>
          <h2 style={{ margin: 0, fontSize: isMobile ? 16 : 20 }}>
            {selectedProject.name}
          </h2>
          {members.length > 0 && (
            <Tag color="blue">{members.length} members</Tag>
          )}
        </div>

        {membersLoading ? (
          <div style={{ textAlign: "center", padding: 40 }}><Spin size="large" /></div>
        ) : members.length === 0 ? (
          <Empty description={`No members in ${selectedProject.name} yet`} />
        ) : (
          <List
            dataSource={members}
            pagination={{ pageSize: isMobile ? 6 : 10, size: "small" }}
            renderItem={(member, index) => (
              <List.Item
                style={{
                  padding: "12px 8px",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 600, color: "#888", width: 24 }}>
                    {index + 1}
                  </span>
                  <Avatar style={{ backgroundColor: "#1890ff", flexShrink: 0 }}>
                    {member.name?.charAt(0)}
                  </Avatar>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {member.name} {member.surname}
                    </div>
                    <div style={{ fontSize: 12, color: "#888" }}>
                      {member.nation?.nation || "No nation"} {member.email ? `• ${member.email}` : ""}
                    </div>
                  </div>
                  <Select
                    size="small"
                    placeholder="Move to..."
                    style={{ width: isMobile ? 110 : 140 }}
                    onChange={(targetId) => handleReassignSelect(member, targetId)}
                    value={undefined}
                  >
                    {projects
                      .filter((p) => p.id !== selectedProject?.id)
                      .map((p) => (
                        <Option key={p.id} value={p.id}>
                          {p.name}
                        </Option>
                      ))}
                  </Select>
                </div>
              </List.Item>
            )}
          />
        )}

        {/* Reassign confirm modal */}
        <Modal
          title="Confirm Reassignment"
          open={!!reassignConfirm}
          onCancel={() => setReassignConfirm(null)}
          onOk={confirmReassign}
          okText="Yes, Move"
          cancelText="Cancel"
        >
          {reassignConfirm && (
            <p>
              Move <strong>{reassignConfirm.member.name} {reassignConfirm.member.surname}</strong> from{" "}
              <strong>{selectedProject.name}</strong> to <strong>{reassignConfirm.targetProjectName}</strong>?
            </p>
          )}
        </Modal>
      </div>
    );
  }

  // ====== MAIN VIEW: Project icons ======
  return (
    <div style={{ padding: isMobile ? 12 : 20 }}>
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>📁 Projects</h2>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}><Spin size="large" /></div>
      ) : projects.length === 0 ? (
        <Empty description="No projects available." />
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: isMobile ? 20 : 30,
          }}
        >
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                transition: "transform 0.2s ease",
                padding: 10,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <div
                style={{
                  width: isMobile ? 65 : 80,
                  height: isMobile ? 65 : 80,
                  borderRadius: 20,
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  marginBottom: 8,
                  background: "#f5f5f5",
                }}
              >
                <img
                  src={getProjectLogo(project)}
                  alt={project.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { e.target.src = fallbackLogo; }}
                />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, textAlign: "center", maxWidth: 90 }}>
                {project.name}
              </span>
              {project.memberCount > 0 && (
                <Tag color="blue" style={{ marginTop: 4, fontSize: 10 }}>
                  {project.memberCount} <TeamOutlined />
                </Tag>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
