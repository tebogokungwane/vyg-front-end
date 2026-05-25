// src/components/ManageNations.jsx

import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  Space,
  Popconfirm,
  message,
} from "antd";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "../utils/axios";

const ManageNations = () => {
  const [nations, setNations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNation, setEditingNation] = useState(null);
  const [form] = Form.useForm();

  const fetchNations = async () => {
    try {
      const res = await axios.get( `/api/nations`);
      setNations(res.data);
    } catch (err) {
      message.error("Failed to fetch nations");
    }
  };

  useEffect(() => {
    fetchNations();
  }, []);

  const openModal = (record = null) => {
    setEditingNation(record);
    form.setFieldsValue(record || { nation: "" });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/nations/${id}`);
      message.success("Nation deleted");
      fetchNations();
    } catch {
      message.error("Failed to delete nation");
    }
  };

  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append("nation", values.nation);
    if (values.image && values.image.file) {
      formData.append("image", values.image.file.originFileObj);
    }

    try {
      if (editingNation) {
        await axios.put(
          `api/nations/${editingNation.id}`,
          formData
        );
        message.success("Nation updated");
      } else {
        await axios.post( `/api/nations`, formData);
        message.success("Nation added");
      }

      setModalVisible(false);
      form.resetFields();
      fetchNations();
    } catch {
      message.error("Failed to save nation");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    { title: "Nation", dataIndex: "nation", key: "nation" },
    {
      title: "Image",
      dataIndex: "imageUrl",
      render: (text) =>
        text ? <img src={text} alt="nation" height={40} /> : "No image",
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openModal(record)}>Edit</Button>
          <Popconfirm
            title="Are you sure?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger type="link">Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      {/* Button bar - always visible */}
      <div
        style={{
          position: "sticky",
          top: 80,
          zIndex: 99,
          background: "#fff",
          padding: "12px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          borderBottom: "1px solid #f0f0f0",
          marginBottom: 16,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18 }}>🇿🇦 Manage Nations</h2>
        <Button
          type="primary"
          onClick={() => openModal()}
          icon={<PlusOutlined />}
          size="large"
        >
          Add Nation
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={nations}
        columns={columns}
        loading={loading}
        scroll={{ x: true }}
      />

      <Modal
        open={modalVisible}
        title={editingNation ? "Edit Nation" : "Add Nation"}
        onCancel={() => setModalVisible(false)}
        onOk={form.submit}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            name="nation"
            label="Nation Name"
            rules={[{ required: true, message: "Nation name is required" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="image" label="Nation Image">
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Choose Image</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageNations;
