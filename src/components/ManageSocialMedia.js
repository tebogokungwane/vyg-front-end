import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Popconfirm,
  message,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  LinkedinOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import {
  FaTiktok,
  FaWhatsapp,
  FaTelegram,
  FaPinterest,
  FaSnapchat,
  FaSpotify,
} from "react-icons/fa";
import axios from "../utils/axios";

const { Option } = Select;

// Available platform options with icons
const platformOptions = [
  { value: "facebook", label: "Facebook", color: "#1877f2" },
  { value: "twitter", label: "Twitter / X", color: "#1da1f2" },
  { value: "instagram", label: "Instagram", color: "#e1306c" },
  { value: "tiktok", label: "TikTok", color: "#000000" },
  { value: "youtube", label: "YouTube", color: "#ff0000" },
  { value: "linkedin", label: "LinkedIn", color: "#0077b5" },
  { value: "whatsapp", label: "WhatsApp", color: "#25d366" },
  { value: "telegram", label: "Telegram", color: "#0088cc" },
  { value: "pinterest", label: "Pinterest", color: "#e60023" },
  { value: "snapchat", label: "Snapchat", color: "#fffc00" },
  { value: "spotify", label: "Spotify", color: "#1db954" },
  { value: "website", label: "Website", color: "#595959" },
];

const getPlatformIcon = (platform, size = 18) => {
  const style = { fontSize: size };
  switch (platform) {
    case "facebook": return <FacebookOutlined style={{ ...style, color: "#1877f2" }} />;
    case "twitter": return <TwitterOutlined style={{ ...style, color: "#1da1f2" }} />;
    case "instagram": return <InstagramOutlined style={{ ...style, color: "#e1306c" }} />;
    case "tiktok": return <FaTiktok style={{ ...style, color: "#000" }} />;
    case "youtube": return <YoutubeOutlined style={{ ...style, color: "#ff0000" }} />;
    case "linkedin": return <LinkedinOutlined style={{ ...style, color: "#0077b5" }} />;
    case "whatsapp": return <FaWhatsapp style={{ ...style, color: "#25d366" }} />;
    case "telegram": return <FaTelegram style={{ ...style, color: "#0088cc" }} />;
    case "pinterest": return <FaPinterest style={{ ...style, color: "#e60023" }} />;
    case "snapchat": return <FaSnapchat style={{ ...style, color: "#fffc00" }} />;
    case "spotify": return <FaSpotify style={{ ...style, color: "#1db954" }} />;
    default: return <GlobalOutlined style={{ ...style, color: "#595959" }} />;
  }
};

const ManageSocialMedia = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [form] = Form.useForm();

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/social-media");
      setLinks(res.data);
    } catch (error) {
      console.error("Failed to fetch social media links:", error);
      message.error("Failed to load social media links");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const openModal = (record = null) => {
    setEditingLink(record);
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/social-media/${id}`);
      message.success("Social media link deleted");
      fetchLinks();
      window.dispatchEvent(new Event("social-media-updated"));
    } catch (error) {
      console.error("Delete error:", error);
      message.error("Failed to delete link");
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingLink) {
        await axios.put(`/api/social-media/${editingLink.id}`, values);
        message.success("Social media link updated");
      } else {
        await axios.post("/api/social-media", values);
        message.success("Social media link added");
      }
      setModalVisible(false);
      form.resetFields();
      fetchLinks();
      window.dispatchEvent(new Event("social-media-updated"));
    } catch (error) {
      console.error("Save error:", error);
      message.error("Failed to save social media link");
    }
  };

  const columns = [
    {
      title: "Platform",
      dataIndex: "platform",
      key: "platform",
      render: (platform) => (
        <Space>
          {getPlatformIcon(platform)}
          <span style={{ textTransform: "capitalize" }}>{platform}</span>
        </Space>
      ),
    },
    {
      title: "URL",
      dataIndex: "url",
      key: "url",
      ellipsis: true,
      render: (url) => (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
      ),
    },
    {
      title: "Status",
      dataIndex: "active",
      key: "active",
      render: (active) => (
        <Tag color={active !== false ? "green" : "red"}>
          {active !== false ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          />
          <Popconfirm
            title="Delete this social media link?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h2 style={{ margin: 0 }}>📱 Manage Social Media</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
          size="large"
        >
          Add Link
        </Button>
      </div>

      <Table
        dataSource={links}
        columns={columns}
        rowKey="id"
        loading={loading}
        bordered
        scroll={{ x: true }}
        pagination={false}
      />

      <Modal
        title={editingLink ? "Edit Social Media Link" : "Add Social Media Link"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={form.submit}
        okText="Save"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="platform"
            label="Platform"
            rules={[{ required: true, message: "Please select a platform" }]}
          >
            <Select placeholder="Select platform">
              {platformOptions.map((p) => (
                <Option key={p.value} value={p.value}>
                  <Space>
                    {getPlatformIcon(p.value, 14)}
                    {p.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="url"
            label="URL"
            rules={[
              { required: true, message: "Please enter the URL" },
              { type: "url", message: "Please enter a valid URL" },
            ]}
          >
            <Input placeholder="https://www.example.com/your-page" />
          </Form.Item>

          <Form.Item name="active" label="Active" initialValue={true}>
            <Select>
              <Option value={true}>Active</Option>
              <Option value={false}>Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export { getPlatformIcon };
export default ManageSocialMedia;
