import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Popconfirm,
  Space,
  message,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import "../styles/ManageChurchAddresses.css";

const ManageChurchAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [filteredAddresses, setFilteredAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:2025/api/addresses");
      setAddresses(res.data);
      setFilteredAddresses(res.data);
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
      message.error("Failed to load addresses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openModal = (record = null) => {
    setEditingAddress(record);
    form.setFieldsValue(record || { province: "", branch: "", fullAddress: "" });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:2025/api/addresses/${id}`);
      message.success("Address deleted successfully");
      fetchAddresses();
    } catch (err) {
      console.error("Delete error:", err);
      message.error("Failed to delete address");
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingAddress) {
        await axios.put(
          `http://localhost:2025/api/addresses/${editingAddress.id}`,
          values
        );
        message.success("Address updated successfully");
      } else {
        await axios.post("http://localhost:2025/api/addresses", values);
        message.success("Address created successfully");
      }
      setModalVisible(false);
      form.resetFields();
      fetchAddresses();
    } catch (err) {
      console.error("Save error:", err);
      message.error("Failed to save address");
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = addresses.filter((addr) =>
      Object.values(addr).some((val) =>
        val?.toString().toLowerCase().includes(value.toLowerCase())
      )
    );
    setFilteredAddresses(filtered);
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Province", dataIndex: "province", key: "province" },
    { title: "Branch", dataIndex: "branch", key: "branch" },
    { title: "Full Address", dataIndex: "fullAddress", key: "fullAddress" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="text"
            onClick={() => openModal(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this address?"
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
    <div className="manage-address-wrapper">
      <div className="manage-address-header">
        <Input.Search
          placeholder="Search by province, branch or address"
          allowClear
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <Button disabled type="primary" onClick={() => openModal()}>
          ➕ Add New Address
        </Button>
      </div>

      <div className="manage-address-table-wrapper">
        <Table
          dataSource={filteredAddresses}
          columns={columns}
          rowKey="id"
          bordered
          loading={loading}
          pagination={{ pageSize: 8 }}
        />
      </div>

      <Modal
        title={editingAddress ? "Edit Address" : "Add Address"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={form.submit}
        okText="Save"
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            name="province"
            label="Province"
            rules={[{ required: true, message: "Please enter province" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="branch"
            label="Branch"
            rules={[{ required: true, message: "Please enter branch" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="fullAddress"
            label="Full Address"
            rules={[{ required: true, message: "Please enter full address" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageChurchAddresses;
