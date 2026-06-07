import { useState, useEffect, useContext } from "react";
import {
  Table,
  Input,
  Select,
  Tag,
  Avatar,
  Button,
  Drawer,
  Form,
  Switch,
  message,
  Modal,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  EditOutlined,
  LockOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import axios from "../utils/axios";
import UserContext from "../context/UserContext";

const { Option } = Select;

const ViewMembers = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState(null);
  const [nationFilter, setNationFilter] = useState(null);
  const [nations, setNations] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [editingMember, setEditingMember] = useState(null);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const { user } = useContext(UserContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const addressId = user?.address?.id;
      if (!addressId) return;
      setLoading(true);

      const [membersRes, mentorsRes, nationsRes] = await Promise.all([
        axios.get(`/api/member/all-members/address/${addressId}`),
        axios.get(`/api/member/mentor/address/${addressId}`),
        axios.get(`/api/nations`),
      ]);

      const members = (membersRes.data || []).map((m) => ({
        ...m,
        key: m.id,
        nationName: m.nation?.nation || "Unassigned",
        mentorName: m.mentor ? `${m.mentor.name} ${m.mentor.surname}` : "—",
      }));

      setData(members);
      setFilteredData(members);
      setMentors(mentorsRes.data || []);
      setNations(nationsRes.data || []);
    } catch (err) {
      console.error("Error fetching members:", err);
      message.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  // Filtering logic
  useEffect(() => {
    let filtered = data;

    if (searchText) {
      filtered = filtered.filter((m) =>
        `${m.name} ${m.surname} ${m.email}`.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (roleFilter) {
      filtered = filtered.filter((m) => m.role?.toLowerCase() === roleFilter.toLowerCase());
    }
    if (nationFilter) {
      filtered = filtered.filter((m) => m.nationName === nationFilter);
    }

    setFilteredData(filtered);
  }, [searchText, roleFilter, nationFilter, data]);

  const handleSave = async (values) => {
    try {
      await axios.put(`/api/member/updateMember/${editingMember.id}`, values, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      message.success("Member updated!");
      setEditingMember(null);
      fetchData();
    } catch (err) {
      message.error("Failed to update member");
    }
  };

  const handlePasswordSubmit = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      return message.error("Passwords do not match");
    }
    try {
      await axios.put(`/api/member/updatePassword/${editingMember.id}`, {
        newPassword: values.newPassword,
      });
      message.success("Password updated!");
      setPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (err) {
      message.error("Failed to update password");
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case "mentor": return "purple";
      case "secretary": return "blue";
      case "member": return "green";
      case "admin": return "red";
      default: return "default";
    }
  };

  const columns = [
    {
      title: "Member",
      key: "member",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar style={{ backgroundColor: "#1890ff" }} size={isMobile ? 30 : 36}>
            {record.name?.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{record.name} {record.surname}</div>
            <div style={{ fontSize: 11, color: "#888" }}>{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 100,
      render: (role) => <Tag color={getRoleColor(role)}>{role}</Tag>,
      responsive: ["sm"],
    },
    {
      title: "Nation",
      dataIndex: "nationName",
      key: "nation",
      responsive: ["md"],
    },
    {
      title: "Mentor",
      dataIndex: "mentorName",
      key: "mentor",
      responsive: ["lg"],
    },
    {
      title: "Status",
      key: "status",
      width: 80,
      render: (_, record) => (
        <Tag color={record.active || record.isActive ? "green" : "red"}>
          {record.active || record.isActive ? "Active" : "Inactive"}
        </Tag>
      ),
      responsive: ["sm"],
    },
    {
      title: "",
      key: "action",
      width: 80,
      render: (_, record) => (
        <Button type="text" icon={<EditOutlined />} onClick={() => {
          setEditingMember(record);
          form.setFieldsValue(record);
        }} />
      ),
    },
  ];

  const uniqueNations = [...new Set(data.map((m) => m.nationName))].filter(Boolean);
  const uniqueRoles = [...new Set(data.map((m) => m.role))].filter(Boolean);

  return (
    <div style={{ padding: isMobile ? 12 : 20 }}>
      {/* Filters */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 16,
          alignItems: "center",
        }}
      >
        <Input
          placeholder="Search name or email..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: isMobile ? "100%" : 220, borderRadius: 8 }}
          allowClear
        />
        <Select
          placeholder="Role"
          value={roleFilter}
          onChange={setRoleFilter}
          allowClear
          style={{ width: 120, borderRadius: 8 }}
        >
          {uniqueRoles.map((r) => (
            <Option key={r} value={r}>{r}</Option>
          ))}
        </Select>
        <Select
          placeholder="Nation"
          value={nationFilter}
          onChange={setNationFilter}
          allowClear
          style={{ width: 140, borderRadius: 8 }}
          showSearch
          optionFilterProp="children"
        >
          {uniqueNations.map((n) => (
            <Option key={n} value={n}>{n}</Option>
          ))}
        </Select>
        <Tag color="blue" style={{ marginLeft: "auto" }}>
          {filteredData.length} members
        </Tag>
      </div>

      {/* Table */}
      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        loading={loading}
        size={isMobile ? "small" : "middle"}
        scroll={{ x: true }}
        pagination={{ pageSize: isMobile ? 8 : 12, showSizeChanger: false }}
        style={{ borderRadius: 12, overflow: "hidden" }}
      />

      {/* Edit Drawer */}
      <Drawer
        title="Edit Member"
        open={!!editingMember}
        onClose={() => setEditingMember(null)}
        width={isMobile ? "100%" : 450}
      >
        {editingMember && (
          <Form layout="vertical" initialValues={editingMember} onFinish={handleSave} form={form}>
            <Form.Item name="name" label="Name"><Input /></Form.Item>
            <Form.Item name="surname" label="Surname"><Input /></Form.Item>
            <Form.Item name="email" label="Email"><Input /></Form.Item>
            <Form.Item name="cellNumber" label="Phone"><Input /></Form.Item>
            <Form.Item name="gender" label="Gender">
              <Select>
                <Option value="Male">Male</Option>
                <Option value="Female">Female</Option>
              </Select>
            </Form.Item>
            <Form.Item name="role" label="Role">
              <Select>
                <Option value="MENTOR">Mentor</Option>
                <Option value="SECRETARY">Secretary</Option>
                <Option value="MEMBER">Member</Option>
              </Select>
            </Form.Item>
            <Form.Item name={["mentor", "id"]} label="Mentor">
              <Select allowClear showSearch optionFilterProp="children">
                {mentors.map((m) => (
                  <Option key={m.id} value={m.id}>{m.name} {m.surname}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="isActive" label="Active" valuePropName="checked">
              <Switch />
            </Form.Item>
            <div style={{ display: "flex", gap: 12 }}>
              <Button type="primary" htmlType="submit">Save</Button>
              <Button icon={<LockOutlined />} onClick={() => setPasswordModalVisible(true)}>
                Change Password
              </Button>
            </div>
          </Form>
        )}
      </Drawer>

      {/* Password Modal */}
      <Modal
        title="Change Password"
        open={passwordModalVisible}
        onCancel={() => { setPasswordModalVisible(false); passwordForm.resetFields(); }}
        onOk={passwordForm.submit}
      >
        <Form layout="vertical" form={passwordForm} onFinish={handlePasswordSubmit}>
          <Form.Item name="newPassword" label="New Password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="confirmPassword" label="Confirm Password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ViewMembers;
