import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  message,
  Popconfirm,
  Alert,
} from "antd";
import axios from "../utils/axios";
import "../styles/BaseEventManager.css";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const BaseEventManager = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form] = Form.useForm();

  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 3000);
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get( `/api/base-events/allEvents`);
      setEvents(res.data);
    } catch (error) {
      console.error("Error fetching events", error);
      showError("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openModal = (record = null) => {
    setEditingEvent(record);
    if (record) {
      // map record.name → eventName for the form
      form.setFieldsValue({
        eventName: record.name,
        defaultPoints: record.defaultPoints,
      });
    } else {
      form.setFieldsValue({ eventName: "", defaultPoints: 0 });
    }
    setModalVisible(true);
  };
  

  const handleDelete = async (id) => {
    try {
      
      await axios.delete(`/api/base-events/${id}`);
      showSuccess("Event deleted successfully");
      fetchEvents();
    } catch (error) {
      console.error("Delete error:", error);
      showError("Failed to delete event");
    }
  };

  const handleFinish = async (values) => {
    try {
      if (editingEvent) {
        await axios.put(
          `/api/base-events/update/${editingEvent.id}`,
          values
        );
        showSuccess("Event updated successfully");
      } else {
        await axios.post( `/api/base-events/create`, values);
        showSuccess("Event created successfully");
      }
      setModalVisible(false);
      form.resetFields();
      fetchEvents();
    } catch (error) {
      console.error("Save error:", error);
      showError("Failed to save event");
    }
  };

  const columns = [
    { title: "Event Name", dataIndex: "name", key: "name" },
    { title: "Default Points", dataIndex: "defaultPoints", key: "defaultPoints", align: "center" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button onClick={() => openModal(record)} icon={<EditOutlined />} type="text" />
          <Popconfirm
            title="Are you sure you want to delete this event?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} type="text" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="base-event-wrapper">
      <div className="base-event-container">
        <Button type="primary" style={{ marginBottom: 16 }} onClick={() => openModal()}>
          ➕ Add New Event
        </Button>

        {successMessage && (
          <Alert
            message={successMessage}
            type="success"
            showIcon
            closable
            style={{ marginBottom: 16 }}
          />
        )}

        {errorMessage && (
          <Alert
            message={errorMessage}
            type="error"
            showIcon
            closable
            style={{ marginBottom: 16 }}
          />
        )}

        <Table
          dataSource={events}
          columns={columns}
          rowKey="id"
          loading={loading}
          bordered
          pagination={{ pageSize: 8 }}
          style={{ width: "100%" }}
        />

        <Modal
          title={editingEvent ? "Edit Base Event" : "Create Base Event"}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={form.submit}
          okText="Save"
          width={400}
          styles={{ body: { paddingBottom: 0 } }}
        >
          <Form form={form} layout="vertical" onFinish={handleFinish}>
            <Form.Item
              name="eventName"
              label="Event Name"
              rules={[{ required: true, message: "Please enter the event name" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="defaultPoints"
              label="Default Points"
              rules={[{ required: true, message: "Please enter default points" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default BaseEventManager;
