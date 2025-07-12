// src/components/Profile.js

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
  Progress,
  Spin
} from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  LockOutlined,
  EditOutlined,
} from "@ant-design/icons";
import axios from "axios";
import UserContext from "../context/UserContext";
import "../styles/profile.css";

const { Option } = Select;
const { Title } = Typography;

const validatePasswordStrength = (password) => {
  const strongPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{}|;:',.<>?]).{8,}$/;
  return strongPattern.test(password);
};

const getPasswordStrength = (password) => {
  let strength = 0;
  if (password.length > 0) strength += 20;
  if (password.length >= 8) strength += 20;
  if (/[A-Z]/.test(password)) strength += 20;
  if (/[0-9]/.test(password)) strength += 20;
  if (/[^A-Za-z0-9]/.test(password)) strength += 20;
  return Math.min(strength, 100);
};

const Profile = () => {
  const { user: contextUser } = useContext(UserContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [editingField, setEditingField] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [passwordForm] = Form.useForm();
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [passwordAlert, setPasswordAlert] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const [profileResponse, addressesResponse] = await Promise.all([
          axios.get(`http://localhost:2025/api/member/${contextUser.id}`, {
            headers: { Authorization: `Bearer ${contextUser.token}` }
          }),
          axios.get("http://localhost:2025/api/addresses", {
            headers: { Authorization: `Bearer ${contextUser.token}` }
          })
        ]);
  
        console.log("📦 Profile Response Data:", profileResponse.data);
        console.log("🏠 Profile Address:", profileResponse.data.address);
  
        setProfileData(profileResponse.data);
        setAddresses(addressesResponse.data);
      } catch (error) {
        console.error("❌ Error fetching profile data:", error);
        message.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
  
    if (contextUser?.id) fetchProfileData();
  }, [contextUser]);
  

  const handleChange = (field, value) => {
    setHasChanges(true);
    setProfileData((prev) => ({
      ...prev,
      [field]: field === "address" ? addresses.find((addr) => addr.id === value) : value,
    }));
  };

  const validateFields = () => {
    if (!/^\d{10}$/.test(profileData.cellNumber)) {
      message.error("Cell number must be 10 digits (SA format).");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateFields() || !profileData) return;

    const payload = {
      cellNumber: profileData.cellNumber,
      addressId: profileData.address?.id,
    };

    try {
      const response = await axios.put(
        `http://localhost:2025/api/member/updateMember/${contextUser.id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${contextUser.token}` }
        }
      );

      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
      message.success("Profile updated successfully!");
      setEditingField(null);
      setHasChanges(false);
      setIsEditing(false);
      setProfileData(prev => ({ ...prev, ...response.data }));
    } catch (err) {
      console.error("Update failed:", err);
      message.error(err.response?.data?.message || "Failed to update profile.");
    }
  };

  const handlePasswordUpdate = async (values) => {
    const { currentPassword, newPassword, confirmPassword } = values;
    setIsUpdatingPassword(true);
    setPasswordAlert(null);

    try {
      const verifyResponse = await axios.post(
        'http://localhost:2025/api/member/verifyPassword',
        { memberId: contextUser.id, password: currentPassword },
        { headers: { Authorization: `Bearer ${contextUser.token}` } }
      );

      if (!verifyResponse.data.isValid) {
        setPasswordAlert({ type: "error", message: "Current password is incorrect." });
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordAlert({ type: "error", message: "New passwords do not match." });
        return;
      }

      if (!validatePasswordStrength(newPassword)) {
        setPasswordAlert({
          type: "error",
          message: "Password too weak. Use at least 8 characters with uppercase, lowercase, number, and special character.",
        });
        return;
      }

      const updateResponse = await axios.put(
        `http://localhost:2025/api/member/updatePassword/${contextUser.id}`,
        { newPassword },
        { headers: { Authorization: `Bearer ${contextUser.token}` } }
      );

      if (updateResponse.data.success) {
        setPasswordAlert({ type: "success", message: "Password updated successfully!" });
        setTimeout(() => {
          setIsPasswordModalVisible(false);
          passwordForm.resetFields();
          setPasswordStrength(0);
        }, 1500);
      } else {
        setPasswordAlert({ type: "error", message: updateResponse.data.message || "Failed to update password." });
      }
    } catch (err) {
      console.error("Password update error:", err);
      setPasswordAlert({ type: "error", message: err.response?.data?.message || "Failed to update password." });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordStrength(getPasswordStrength(e.target.value));
  };

  const renderEditableField = (field, value, icon, type = "text", options = []) => {
    if (!isEditing && (field !== "cellNumber" && field !== "address")) {
      return <p>{icon} {value || "-"}</p>;
    }

    return editingField === field ? (
      type === "select" ? (
        <Select
          value={value?.id || value}
          onChange={(val) => handleChange(field, val)}
          onBlur={() => setEditingField(null)}
          autoFocus
          style={{ width: "100%" }}
          showSearch
          optionFilterProp="children"
        >
          {options.map((opt) => (
            <Option key={opt.id} value={opt.id}>
              {`${opt.fullAddress} (${opt.branch}, ${opt.province})`}
            </Option>
          ))}
        </Select>
      ) : (
        <Input
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
          onBlur={() => setEditingField(null)}
          onPressEnter={() => setEditingField(null)}
          autoFocus
        />
      )
    ) : (
      <p>
        {icon}{" "}
        <span
          onClick={() => isEditing && setEditingField(field)}
          style={{ cursor: isEditing ? "pointer" : "default", wordBreak: "break-word" }}
        >
          {field === "address" && value
            ? `${value.fullAddress} (${value.branch}, ${value.province})`
            : value || "-"}
        </span>
      </p>
    );
  };

  if (loading) {
    return (
      <div className="center-loader">
        <Spin size="large" />
      </div>
    );
  }

  if (!profileData) {
    return <p style={{ textAlign: "center" }}>Failed to load profile data</p>;
  }

  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        {showSuccessAlert && (
          <Alert message="Profile updated successfully!" type="success" showIcon style={{ marginBottom: 16 }} />
        )}

        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} sm={8} md={6} className="profile-avatar-col">
            <Avatar size={100} icon={<UserOutlined />} />
            <Title level={5} className="profile-role">{profileData.role}</Title>
          </Col>
          <Col xs={24} sm={16} md={18}>
            <Title level={4} className="profile-name">
              {profileData.name} {profileData.surname}
            </Title>

            {renderEditableField("email", profileData.email, <MailOutlined />)}
            {renderEditableField("cellNumber", profileData.cellNumber, <PhoneOutlined />)}
            {renderEditableField("gender", profileData.gender, <UserOutlined />)}
            {renderEditableField("residentialAddress", profileData.residentialAddress, <HomeOutlined />)}
            <p><TeamOutlined /> Nation: {profileData.nation?.nation || "Unassigned"}</p>
            <p><b>Status:</b> {profileData.isActive ? "✅ Active" : "❌ Inactive"}</p>

              <div className="profile-actions">
                {!isEditing ? (
                  <Button icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button type="primary" onClick={handleSave} disabled={!hasChanges}>
                      Save Changes
                    </Button>
                    <Button onClick={() => {
                      setIsEditing(false);
                      setEditingField(null);
                    }}>
                      Cancel
                    </Button>
                  </>
                )}
                <Button icon={<LockOutlined />} onClick={() => setIsPasswordModalVisible(true)}>
                  Change Password
                </Button>
              </div>
          </Col>
        </Row>

        <Modal
          title="Change Password"
          open={isPasswordModalVisible}
          onCancel={() => {
            setIsPasswordModalVisible(false);
            passwordForm.resetFields();
            setPasswordAlert(null);
            setPasswordStrength(0);
          }}
          onOk={() => passwordForm.submit()}
          okText={isUpdatingPassword ? "Updating..." : "Update"}
          okButtonProps={{ loading: isUpdatingPassword }}
          cancelButtonProps={{ disabled: isUpdatingPassword }}
        >
          {passwordAlert && (
            <Alert
              type={passwordAlert.type}
              message={passwordAlert.message}
              showIcon
              style={{ marginBottom: 12 }}
            />
          )}
          <Form form={passwordForm} layout="vertical" onFinish={handlePasswordUpdate}>
            <Form.Item name="currentPassword" label="Current Password" rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
            <Form.Item name="newPassword" label="New Password" rules={[{ required: true }]}>
              <Input.Password onChange={handlePasswordChange} />
            </Form.Item>
            <Progress percent={passwordStrength} status={
              passwordStrength < 40 ? "exception" : passwordStrength < 80 ? "active" : "success"
            } showInfo={false} style={{ marginBottom: 16 }} />
            <Form.Item name="confirmPassword" label="Confirm Password" rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
            <Form.Item>
              <small style={{ color: "#888" }}>
                Password must include:
                <ul>
                  <li>At least 8 characters</li>
                  <li>Uppercase and lowercase letters</li>
                  <li>At least one number</li>
                  <li>At least one special character</li>
                </ul>
              </small>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default Profile;
