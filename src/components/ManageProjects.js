import React, { useEffect, useState, useContext } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Upload,
  Popconfirm,
  message,
  Spin,
  Empty,
  Card,
  List,
  Avatar,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  SearchOutlined,
  UserAddOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import axios from "../utils/axios";
import UserContext from "../context/UserContext";
import fallbackLogo from "../images/vyg.jpg";

const { Option } = Select;

const ManageProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [form] = Form.useForm();
  const [allMembers, setAllMembers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [assigningMember, setAssigningMember] = useState(null);
  const { user } = useContext(UserContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [membersLoading, setMembersLoading] = useState(false);

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

  useEffect(() => {
    if (user?.address?.id) {
      fetchUnassignedMembers();
    }
  }, [user]);

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

  const fetchUnassignedMembers = async () => {
    const addressId = user?.address?.id;
    if (!addressId) {
      setMembersLoading(false);
      return;
    }
    setMembersLoading(true);
    try {
      // Try dedicated endpoint for unassigned members first
      const res = await axios.get(`/api/projects/unassigned-members/address/${addressId}`);
      const members = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      setAllMembers(members);
    } catch (err) {
      // Fallback: get all members and filter out assigned ones
      console.log("Unassigned endpoint not ready, using fallback...");
      try {
        const [membersRes, projectsRes] = await Promise.all([
          axios.get(`/api/member/all-saved-members/address/${addressId}`),
          axios.get("/api/projects"),
        ]);

        const allMembersList = membersRes.data?.content || membersRes.data || [];
        const projectsList = Array.isArray(projectsRes.data) ? projectsRes.data : [];

        // Collect all assigned member IDs from all projects
        const assignedIds = new Set();
        for (const project of projectsList) {
          if (project.members && Array.isArray(project.members)) {
            project.members.forEach((m) => assignedIds.add(m.id));
          }
        }

        // Filter to only unassigned
        const unassigned = (Array.isArray(allMembersList) ? allMembersList : [])
          .filter((m) => !assignedIds.has(m.id));

        setAllMembers(unassigned);
      } catch (fallbackErr) {
        console.error("Failed to fetch members:", fallbackErr);
        setAllMembers([]);
      }
    } finally {
      setMembersLoading(false);
    }
  };

  const getProjectLogo = (project) => {
    if (project.imageName) {
      return `${BASE_URL}/api/projects/${project.id}/image`;
    }
    return fallbackLogo;
  };

  const openModal = (record = null) => {
    setEditingProject(record);
    if (record) {
      form.setFieldsValue({ name: record.name });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    if (String(id).startsWith("default-")) {
      setProjects(projects.filter((p) => p.id !== id));
      message.success("Project removed");
      return;
    }
    try {
      await axios.delete(`/api/projects/${id}`);
      message.success("Project deleted");
      fetchProjects();
    } catch (err) {
      console.error("Delete error:", err);
      message.error("Failed to delete project");
    }
  };

  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append("name", values.name);
    if (values.image && values.image.fileList && values.image.fileList.length > 0) {
      formData.append("image", values.image.fileList[0].originFileObj);
    }

    try {
      if (editingProject && !String(editingProject.id).startsWith("default-")) {
        await axios.put(`/api/projects/${editingProject.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Project updated");
      } else {
        await axios.post("/api/projects", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Project created");
      }
      setModalVisible(false);
      form.resetFields();
      fetchProjects();
    } catch (err) {
      console.error("Save error:", err);
      message.error("Failed to save project. Make sure the backend is running.");
    }
  };

  const [confirmAssign, setConfirmAssign] = useState(null); // { memberId, projectId, memberName, projectName }

  const handleAssignToProject = (memberId, projectId) => {
    const member = allMembers.find((m) => m.id === memberId);
    const project = projects.find((p) => p.id === projectId);
    setConfirmAssign({
      memberId,
      projectId,
      memberName: member ? `${member.name} ${member.surname}` : "Member",
      projectName: project ? project.name : "Project",
    });
  };

  const confirmAssignment = async () => {
    if (!confirmAssign) return;
    try {
      await axios.post(`/api/projects/${confirmAssign.projectId}/add-member/${confirmAssign.memberId}`);
      message.success(`${confirmAssign.memberName} assigned to ${confirmAssign.projectName}!`);
      // Remove from list immediately and refresh
      setAllMembers((prev) =>
        (Array.isArray(prev) ? prev : []).filter((m) => m.id !== confirmAssign.memberId)
      );
      // Also refresh projects to update member counts
      fetchProjects();
    } catch (err) {
      console.error("Failed to assign member:", err);
      message.error("Failed to assign member. Backend endpoint may not be ready yet.");
    } finally {
      setConfirmAssign(null);
    }
  };

  const filteredMembers = (Array.isArray(allMembers) ? allMembers : []).filter((m) =>
    `${m.name} ${m.surname}`.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div style={{ padding: isMobile ? 12 : 20, maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => openModal()}>
          Add Project
        </Button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}><Spin size="large" /></div>
      ) : projects.length === 0 ? (
        <Empty description="No projects yet" />
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 20,
            marginBottom: 30,
          }}
        >
          {projects.map((project) => (
            <div
              key={project.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: 16,
                borderRadius: 16,
                border: "1px solid #f0f0f0",
                background: "#fafafa",
                transition: "box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              <div
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 18,
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  marginBottom: 10,
                  background: "#fff",
                }}
              >
                <img
                  src={getProjectLogo(project)}
                  alt={project.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { e.target.src = fallbackLogo; }}
                />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, textAlign: "center", marginBottom: 10, lineHeight: 1.2 }}>
                {project.name}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <Button size="small" type="text" icon={<EditOutlined />} onClick={() => openModal(project)} />
                <Popconfirm title="Delete this project?" onConfirm={() => handleDelete(project.id)} okText="Yes" cancelText="No">
                  <Button size="small" type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All Members — Assign to Project */}
      <Card
        title={
          <span>
            <TeamOutlined style={{ marginRight: 8 }} />
            All Members — Assign to Project
          </span>
        }
        style={{ borderRadius: 12 }}
      >
        <Input
          placeholder="Search by name..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginBottom: 16, borderRadius: 8 }}
          allowClear
        />

        <List
          dataSource={filteredMembers}
          loading={membersLoading}
          locale={{ emptyText: "No members found" }}
          pagination={{ pageSize: isMobile ? 6 : 10, size: "small" }}
          renderItem={(member, index) => (
            <List.Item
              style={{
                padding: "10px 4px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                <span style={{ color: "#888", fontWeight: 600, width: 20, fontSize: 12 }}>
                  {index + 1}
                </span>
                <Avatar style={{ backgroundColor: "#1890ff", flexShrink: 0 }} size={isMobile ? 32 : 36}>
                  {member.name?.charAt(0)}
                </Avatar>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {member.name} {member.surname}
                  </div>
                  <div style={{ fontSize: 11, color: "#888" }}>
                    {member.nation?.nation || "No nation"}
                  </div>
                </div>
              </div>

              <Select
                size="small"
                placeholder="Assign project"
                style={{ width: isMobile ? 110 : 150 }}
                onChange={(projectId) => handleAssignToProject(member.id, projectId)}
              >
                {projects.map((p) => (
                  <Option key={p.id} value={p.id}>
                    {p.name}
                  </Option>
                ))}
              </Select>
            </List.Item>
          )}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingProject ? "Edit Project" : "Add Project"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={form.submit}
        okText="Save"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Project Name"
            rules={[{ required: true, message: "Please enter a project name" }]}
          >
            <Input placeholder="e.g. Sports, University, Media" />
          </Form.Item>

          <Form.Item name="image" label="Project Icon/Logo">
            <Upload beforeUpload={() => false} maxCount={1} accept="image/*" listType="picture">
              <Button icon={<UploadOutlined />}>Choose Image</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* Confirm Assignment Modal */}
      <Modal
        title="Confirm Assignment"
        open={!!confirmAssign}
        onCancel={() => setConfirmAssign(null)}
        onOk={confirmAssignment}
        okText="Yes, Assign"
        cancelText="Cancel"
      >
        {confirmAssign && (
          <p>
            Are you sure you want to assign <strong>{confirmAssign.memberName}</strong> to{" "}
            <strong>{confirmAssign.projectName}</strong>?
          </p>
        )}
      </Modal>
    </div>
  );
};

export default ManageProjects;
