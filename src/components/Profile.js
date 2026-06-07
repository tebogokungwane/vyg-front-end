import React, { useEffect, useState, useContext } from "react";
import {
  Avatar,
  Input,
  Select,
  message,
  Button,
  Alert,
  Modal,
  Form,
  Progress,
  Spin,
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
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import axios from "../utils/axios";
import UserContext from "../context/UserContext";
import "../styles/profile.css";

const { Option } = Select;

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
          axios.get(`/api/member/${contextUser.id}`, {
            headers: { Authorization: `Bearer ${contextUser.token}` },
          }),
          axios.get(`/api/addresses`, {
            headers: { Authorization: `Bearer ${contextUser.token}` },
          }),
        ]);
        setProfileData(profileResponse.data);
        setAddresses(addressesResponse.data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
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

  const handleSave = async () => {
    if (!profileData) return;
    if (!/^\d{10}$/.test(profileData.cellNumber)) {
      message.error("Cell number must be 10 digits.");
      return;
    }

    try {
      const response = await axios.put(
        `/api/member/updateMember/${contextUser.id}`,
        { cellNumber: profileData.cellNumber, addressId: profileData.address?.id },
        { headers: { Authorization: `Bearer ${contextUser.token}` } }
      );
      message.success("Profile updated!");
      setEditingField(null);
      setHasChanges(false);
      setIsEditing(false);
      setProfileData((prev) => ({ ...prev, ...response.data }));
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to update profile.");
    }
  };

  const handlePasswordUpdate = async (values) => {
    const { currentPassword, newPassword, confirmPassword } = values;
    setIsUpdatingPassword(true);
    setPasswordAlert(null);

    try {
      const verifyResponse = await axios.post(
        `/api/member/verifyPassword`,
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
        setPasswordAlert({ type: "error", message: "Password too weak." });
        return;
      }

      const updateResponse = await axios.put(
        `/api/member/updatePassword/${contextUser.id}`,
        { newPassword },
        { headers: { Authorization: `Bearer ${contextUser.token}` } }
      );

      if (updateResponse.data.success) {
        setPasswordAlert({ type: "success", message: "Password updated!" });
        setTimeout(() => {
          setIsPasswordModalVisible(false);
          passwordForm.resetFields();
          setPasswordStrength(0);
        }, 1500);
      } else {
        setPasswordAlert({ type: "error", message: updateResponse.data.message || "Failed." });
      }
    } catch (err) {
      setPasswordAlert({ type: "error", message: err.response?.data?.message || "Failed to update password." });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (loading) {
    return <div className="center-loader"><Spin size="large" /></div>;
  }

  if (!profileData) {
    return <p style={{ textAlign: "center", padding: 40 }}>Failed to load profile data</p>;
  }

  const renderField = (label, value, icon, iconColor, field, type = "text") => (
    <div className="profile-info-row">
      <div className={`profile-info-icon ${iconColor}`}>{icon}</div>
      <div className="profile-info-content">
        <div className="profile-info-label">{label}</div>
        {isEditing && editingField === field ? (
          type === "select" ? (
            <Select
              value={profileData.address?.id}
              onChange={(val) => { handleChange("address", val); setEditingField(null); }}
              style={{ width: "100%" }}
              size="small"
              showSearch
              optionFilterProp="children"
            >
              {addresses.map((opt) => (
                <Option key={opt.id} value={opt.id}>
                  {`${opt.fullAddress} (${opt.branch})`}
                </Option>
              ))}
            </Select>
          ) : (
            <Input
              value={value}
              onChange={(e) => handleChange(field, e.target.value)}
              onBlur={() => setEditingField(null)}
              onPressEnter={() => setEditingField(null)}
              size="small"
              autoFocus
            />
          )
        ) : (
          <div
            className={`profile-info-value ${isEditing && field ? "editable" : ""}`}
            onClick={() => isEditing && field && setEditingField(field)}
          >
            {field === "address" && value
              ? `${value.fullAddress} (${value.branch})`
              : value || "—"}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        {/* Hero Section */}
        <div className="profile-hero">
          <Avatar size={90} icon={<UserOutlined />} style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
          <div className="profile-hero-name">{profileData.name} {profileData.surname}</div>
          <div className="profile-hero-role">{profileData.role}</div>
          <div className="profile-hero-status">
            {profileData.isActive ? "✅ Active" : "❌ Inactive"}
          </div>
        </div>

        {/* Personal Info */}
        <div className="profile-info-card">
          <h4>Personal Information</h4>
          {renderField("Email", profileData.email, <MailOutlined />, "blue", null)}
          {renderField("Phone", profileData.cellNumber, <PhoneOutlined />, "green", "cellNumber")}
          {renderField("Gender", profileData.gender, <UserOutlined />, "purple", null)}
          {renderField("Nation", profileData.nation?.nation || "Unassigned", <TeamOutlined />, "orange", null)}
        </div>

        {/* Location Info */}
        <div className="profile-info-card">
          <h4>Location</h4>
          {renderField("Residential Address", profileData.residentialAddress, <HomeOutlined />, "pink", null)}
          {renderField("Church Branch", profileData.address, <EnvironmentOutlined />, "blue", "address", "select")}
        </div>

        {/* Actions */}
        <div className="profile-info-card">
          <div className="profile-actions">
            {!isEditing ? (
              <Button type="primary" icon={<EditOutlined />} onClick={() => setIsEditing(true)} block>
                Edit Profile
              </Button>
            ) : (
              <>
                <Button type="primary" icon={<CheckOutlined />} onClick={handleSave} disabled={!hasChanges}>
                  Save
                </Button>
                <Button icon={<CloseOutlined />} onClick={() => { setIsEditing(false); setEditingField(null); }}>
                  Cancel
                </Button>
              </>
            )}
            <Button icon={<LockOutlined />} onClick={() => setIsPasswordModalVisible(true)} block={!isEditing}>
              Change Password
            </Button>
          </div>
        </div>

        {/* Password Modal */}
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
        >
          {passwordAlert && (
            <Alert type={passwordAlert.type} message={passwordAlert.message} showIcon style={{ marginBottom: 12 }} />
          )}
          <Form form={passwordForm} layout="vertical" onFinish={handlePasswordUpdate}>
            <Form.Item name="currentPassword" label="Current Password" rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
            <Form.Item name="newPassword" label="New Password" rules={[{ required: true }]}>
              <Input.Password onChange={(e) => setPasswordStrength(getPasswordStrength(e.target.value))} />
            </Form.Item>
            <Progress
              percent={passwordStrength}
              status={passwordStrength < 40 ? "exception" : passwordStrength < 80 ? "active" : "success"}
              showInfo={false}
              style={{ marginBottom: 16 }}
            />
            <Form.Item name="confirmPassword" label="Confirm Password" rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default Profile;
