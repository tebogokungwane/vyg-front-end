import React, { useEffect, useState, useContext } from "react";
import {
  Table,
  Input,
  Button,
  Switch,
  Drawer,
  Form,
  Select,
  message,
  Modal,
} from "antd";
import axios from "axios";
import UserContext from "../context/UserContext";

const { Option } = Select;

const ViewMembers = () => {
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [editingMember, setEditingMember] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const addressId = user?.address?.id;
        if (!addressId) return;

        const [membersRes, mentorsRes] = await Promise.all([
          axios.get(`http://localhost:2025/api/member/all-members/address/${addressId}`),
          axios.get(`http://localhost:2025/api/member/mentor/address/${addressId}`),
        ]);

        const members = membersRes.data.map((m) => ({
          ...m,
          key: m.id,
          address: m.address?.fullAddress,
          mentorName: m.mentor ? `${m.mentor.name} ${m.mentor.surname}` : "-",
          isActive: m.active,
        }));

        setData(members);
        setMentors(mentorsRes.data);
      } catch (err) {
        console.error("Error fetching members or mentors:", err);
        message.error("Failed to load member data");
      }
    };

    fetchData();
  }, [user]);

  const filteredData = data.filter((item) =>
    `${item.name} ${item.surname}`.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSave = async (values) => {
    try {
      // Post or put request to save values
      message.success("Member updated successfully");
      setEditingMember(null);
    } catch (err) {
      console.error(err);
      message.error("Failed to update member");
    }
  };

  const openPasswordModal = (record) => {
    setEditingMember(record);
    setPasswordModalVisible(true);
  };

  const handlePasswordSubmit = (values) => {
    const { newPassword, confirmPassword } = values;
    if (newPassword !== confirmPassword) {
      return message.error("Passwords do not match");
    }
    message.success("Password updated (simulated)");
    setPasswordModalVisible(false);
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Surname", dataIndex: "surname", key: "surname" },
    { title: "Nation", dataIndex: "nation.nation", key: "nation" },
    { title: "Status", dataIndex: "isActive", key: "isActive", render: (text) => (text ? "Active" : "Inactive") },
    {
      title: "Action",
      dataIndex: "action",
      render: (_, record) => (
        <>
          <Button onClick={() => setEditingMember(record)}>Edit</Button>
          <Button type="link" onClick={() => openPasswordModal(record)}>
            Change Password
          </Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: "50px" }}>
      <Input
        placeholder="Search by name or surname"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ width: 300, marginBottom: 20 }}
      />

      <Table columns={columns} dataSource={filteredData} bordered rowKey="id" />

      <Drawer
        title="Edit Member"
        open={!!editingMember}
        onClose={() => setEditingMember(null)}
        width={500}
      >
        {editingMember && (
          <Form layout="vertical" initialValues={editingMember} onFinish={handleSave} form={form}>
            <Form.Item name="name" label="Name">
              <Input />
            </Form.Item>
            <Form.Item name="surname" label="Surname">
              <Input />
            </Form.Item>
            <Form.Item name="gender" label="Gender">
              <Select>
                <Option value="Male">Male</Option>
                <Option value="Female">Female</Option>
              </Select>
            </Form.Item>
            <Form.Item name="email" label="Email">
              <Input />
            </Form.Item>
            <Form.Item name="cellNumber" label="Cell Number">
              <Input />
            </Form.Item>
            <Form.Item name="address" label="Address">
              <Input disabled />
            </Form.Item>
            <Form.Item name="role" label="Role">
              <Select>
                <Option value="MENTOR">Mentor</Option>
                <Option value="SECRETARY">Secretary</Option>
                <Option value="MEMBER">Member</Option>
              </Select>
            </Form.Item>
            <Form.Item name={["mentor", "id"]} label="Mentor">
              <Select>
                {mentors.map((mentor) => (
                  <Option key={mentor.id} value={mentor.id}>
                    {mentor.name} {mentor.surname}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name={["nation", "nation"]} label="Nation">
              <Input disabled />
            </Form.Item>
            <Form.Item name="residentialAddress" label="Residential Address">
              <Input />
            </Form.Item>
            <Form.Item name="isActive" label="Active" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Button type="primary" htmlType="submit">Save</Button>
          </Form>
        )}
      </Drawer>

      <Modal
        title="Change Password"
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        onOk={passwordForm.submit}
      >
        <Form layout="vertical" form={passwordForm} onFinish={handlePasswordSubmit}>
          <Form.Item name="newPassword" label="New Password" rules={[{ required: true }]}> <Input.Password /> </Form.Item>
          <Form.Item name="confirmPassword" label="Confirm Password" rules={[{ required: true }]}> <Input.Password /> </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ViewMembers;
