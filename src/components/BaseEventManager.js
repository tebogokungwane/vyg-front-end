import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, Space, message, Popconfirm } from "antd";
import axios from "axios";
import "../styles/BaseEventManager.css";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";



const BaseEventManager = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form] = Form.useForm();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:2025/api/base-events/allEvents");
      setEvents(res.data);
    } catch (error) {
      console.error("Error fetching events", error);
      message.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openModal = (record = null) => {
    setEditingEvent(record);
    form.setFieldsValue(record || { name: "", defaultPoints: 0 });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:2025/api/base-events/${id}`);
      message.success("Event deleted successfully");
      fetchEvents();
    } catch (error) {
      console.error("Delete error:", error);
      message.error("Failed to delete event");
    }
  };

  const handleFinish = async (values) => {
    try {
      if (editingEvent) {
        await axios.put(`http://localhost:2025/api/base-events/update/${editingEvent.id}`, values);
        message.success("Event updated");
      } else {
        await axios.post("http://localhost:2025/api/base-events/create", values);
        message.success("Event created");
      }
      setModalVisible(false);
      form.resetFields();
      fetchEvents();
    } catch (error) {
      console.error("Save error:", error);
      message.error("Failed to save event");
    }
  };

  const columns = [
    // { title: "ID", dataIndex: "id", key: "id" },
    { title: "Event Name", dataIndex: "name", key: "name" },
    { title: "Default Points", dataIndex: "defaultPoints", key: "defaultPoints", align: "center" },
    
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            onClick={() => openModal(record)}
            icon={<EditOutlined />}
            type="text"
          />
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

        <Table
          dataSource={events}
          columns={columns}
          rowKey="id"
          loading={loading}
          bordered
          pagination={{ pageSize: 8 }} // or 10
          // Removed scroll={{ x: '100%' }}
          style={{ width: "100%" }}
        />



        <Modal
          title={editingEvent ? "Edit Base Event" : "Create Base Event"}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={form.submit}
          okText="Save"
          width={400}
          bodyStyle={{ paddingBottom: 0 }}
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
