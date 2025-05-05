import React, { useEffect, useState, useContext } from "react";
import {
  Avatar,
  Input,
  Select,
  Row,
  Col,
  message,
  Typography,
  Button,
  Alert,
  Modal,
  Form,
} from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  LockOutlined,
} from "@ant-design/icons";
import axios from "axios";
import UserContext from "../context/UserContext";
import "../styles/profile.css";

const { Option } = Select;
const { Title } = Typography;

const Profile = () => {
  const { user } = useContext(UserContext);
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [passwordForm] = Form.useForm();
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);

  useEffect(() => {
    if (user) setFormData(user);
    axios
      .get("http://localhost:2025/api/addresses")
      .then((res) => setAddresses(res.data))
      .catch(() => {
        message.error("Failed to load church addresses");
      });
  }, [user]);

  const handleChange = (field, value) => {
    setHasChanges(true);
    setFormData((prev) => ({
      ...prev,
      [field]: field === "address" ? addresses.find((addr) => addr.id === value) : value,
    }));
  };

  const validateFields = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      message.error("Invalid email format.");
      return false;
    }
    if (!/^\d{10}$/.test(formData.cellNumber)) {
      message.error("Cell number must be 10 digits (SA format).");
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validateFields()) return;
    const payload = {
      name: formData.name,
      surname: formData.surname,
      email: formData.email,
      gender: formData.gender,
      cellNumber: formData.cellNumber,
      residentialAddress: formData.residentialAddress,
      addressId: formData.address?.id,
      role: formData.role,
      password: formData.password,
      isActive: formData.isActive,
      nation: formData.nation,
    };

    axios
      .put(`http://localhost:2025/api/member/updateMember/${user.id}`, payload)
      .then(() => {
        setShowSuccessAlert(true);
        setTimeout(() => setShowSuccessAlert(false), 3000);
        message.success("Profile updated successfully!");
        setEditingField(null);
        setHasChanges(false);
      })
      .catch((err) => {
        console.error("Update failed:", err);
        message.error(err.response?.data?.message || "Failed to update profile.");
      });
  };

  const handlePasswordUpdate = (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("New passwords do not match.");
      return;
    }
    if (values.currentPassword !== user.password) {
      message.error("Current password is incorrect.");
      return;
    }
    setFormData((prev) => ({ ...prev, password: values.newPassword }));
    setHasChanges(true);
    setIsPasswordModalVisible(false);
    message.success("Password updated locally. Don't forget to click 'Save Changes'.");
  };

  const renderEditableField = (field, value, type = "text", options = []) => {
    return editingField === field ? (
      type === "select" ? (
        <Select
          defaultValue={value}
          onChange={(val) => handleChange(field, val)}
          onBlur={() => setEditingField(null)}
          autoFocus
          style={{ width: "100%" }}
          showSearch
          optionFilterProp="children"
        >
          {options.map((opt) => (
            <Option key={opt.value || opt.id} value={opt.value || opt.id}>
              {opt.label || `${opt.fullAddress} (${opt.branch}, ${opt.province})`}
            </Option>
          ))}
        </Select>
      ) : (
        <Input
          defaultValue={value}
          onBlur={() => setEditingField(null)}
          onPressEnter={() => setEditingField(null)}
          onChange={(e) => handleChange(field, e.target.value)}
          autoFocus
        />
      )
    ) : (
      <span onDoubleClick={() => setEditingField(field)} style={{ cursor: "pointer", wordBreak: "break-word" }}>
        {value || "-"}
      </span>
    );
  };

  if (!formData) return <p style={{ textAlign: "center" }}>Loading profile...</p>;

  const selectedAddress = formData.address
    ? `${formData.address.fullAddress} (${formData.address.branch}, ${formData.address.province})`
    : "-";

  return (
    <div
      className="profile-wrapper"
      style={{
        padding: "40px 0",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        height: "100%",
        background: "none",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: 800, width: "100%", padding: 24 }}>
        {showSuccessAlert && (
          <Alert message="Profile updated successfully!" type="success" showIcon style={{ marginBottom: 16 }} />
        )}

        <Row gutter={[24, 24]}>
          <Col xs={24} md={6} style={{ textAlign: "center" }}>
            <Avatar size={100} icon={<UserOutlined />} />
            <Title level={5} style={{ marginTop: 8, fontWeight: "bold" }}>
              {formData.role}
            </Title>
          </Col>
          <Col xs={24} md={18}>
            <Title level={4} style={{ fontSize: "18px" }}>
              {renderEditableField("name", formData.name)} {renderEditableField("surname", formData.surname)}
            </Title>

            <p><MailOutlined /> {renderEditableField("email", formData.email)}</p>
            <p><PhoneOutlined /> {renderEditableField("cellNumber", formData.cellNumber)}</p>
            <p>
              <UserOutlined /> {renderEditableField("gender", formData.gender, "select", [
                { value: "MALE", label: "Male" },
                { value: "FEMALE", label: "Female" },
              ])}
            </p>
            <p><HomeOutlined /> {renderEditableField("residentialAddress", formData.residentialAddress)}</p>
            <p><TeamOutlined /> Nation: {formData.nation?.nation || "-"}</p>
            <p>
              <EnvironmentOutlined /> Church Address: {renderEditableField("address", formData.address?.id, "select", addresses)}
              <br />
              <small style={{ color: "#888" }}>{selectedAddress}</small>
            </p>
            <p><b>Created On:</b> {formData.dateCreated || "-"}</p>
            <p><b>Status:</b> {formData.isActive ? "✅ Active" : "❌ Inactive"}</p>

            <div style={{ marginTop: 16, display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Button icon={<LockOutlined />} onClick={() => setIsPasswordModalVisible(true)}>
                Change Password
              </Button>
              {hasChanges && (
                <Button type="primary" onClick={handleSave}>
                  Save Changes
                </Button>
              )}
            </div>
          </Col>
        </Row>

        <Modal
          title="Change Password"
          open={isPasswordModalVisible}
          onCancel={() => setIsPasswordModalVisible(false)}
          onOk={() => passwordForm.submit()}
          okText="Update"
        >
          <Form form={passwordForm} layout="vertical" onFinish={handlePasswordUpdate}>
            <Form.Item
              label="Current Password"
              name="currentPassword"
              rules={[{ required: true, message: "Please input your current password" }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              label="New Password"
              name="newPassword"
              rules={[{ required: true, message: "Please input your new password" }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              label="Confirm New Password"
              name="confirmPassword"
              rules={[{ required: true, message: "Please confirm your new password" }]}
            >
              <Input.Password />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default Profile;
