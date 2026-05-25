import React, { useState, useEffect, useContext } from 'react';
import { Button, Form, Input, Select, message, Alert } from 'antd';
import axios from "../utils/axios";
import UserContext from '../context/UserContext';

const { Option } = Select;

const AddMentor = () => {
  const [form] = Form.useForm();
  const [role, setRole] = useState("MENTOR");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { user } = useContext(UserContext);
  const [alertInfo, setAlertInfo] = useState(null);
  const [nations, setNations] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔧 You can change these to control height easily
  const mobileHeight = "100vh";       // height for mobile
  const desktopHeight = "90vh";       // height for desktop

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    axios
      .get( `/api/nations`)
      .then((res) => setNations(res.data))
      .catch((err) => {
        console.error("❌ Error fetching Nations:", err);
        message.error("Failed to load Nations");
      });
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        name: values.firstName,
        surname: values.lastName,
        email: values.email,
        gender: values.gender.toUpperCase(),
        cellNumber: values.phone,
        residentialAddress: role !== "PR" ? values.residentialAddress : null,
        addressId: user?.address?.id,
        role: values.role,
        nation: role === "MENTOR"
          ? { id: values.nationId, nation: values.nationName?.toUpperCase() }
          : null,
        password: "VYG@123",
        isActive: true,
        createdBy: `${user?.name} ${user?.surname}`,
        capturedBy: `${user?.name} ${user?.surname}`,
      };

      const response = await axios.post( `/api/member/register`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setAlertInfo({
        text: `🎉 ${response.data.name} ${response.data.surname} has been successfully registered!`,
        type: "success",
      });

      form.resetFields();
    } catch (error) {
      console.error("❌ Failed to create member:", error);
      setAlertInfo({
        text: "⚠️ Something went wrong! Unable to register the member. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setAlertInfo(null), 5000);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: isMobile ? "flex-start" : "center",
        padding: isMobile ? "20px 10px" : "40px",
        minHeight: isMobile ? mobileHeight : desktopHeight,
        boxSizing: "border-box",
        // backgroundColor: "#f5f5f5",
      }}
    >
      <div
        style={{
          width: isMobile ? "100%" : "450px",
          backgroundColor: "#ffffff",
          padding: isMobile ? "20px" : "40px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
        }}
      >
        <Form form={form} name="addMentorForm" layout="vertical" onFinish={onFinish}>
          <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[{ type: "email" }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              { required: true },
              {
                pattern: /^0[6-8][0-9]{8}$/,
                message: "Enter a valid SA number (e.g. 0821234567)",
              },
            ]}
          >
            <Input maxLength={10} placeholder="e.g. 0821234567" />
          </Form.Item>

          <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
            <Select placeholder="Select gender">
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
            </Select>
          </Form.Item>

          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select placeholder="Select role" onChange={(value) => setRole(value)}>
              <Option value="MEMBER">MEMBER</Option>
              <Option value="MENTOR">MENTOR</Option>
              <Option value="SECRETARY">SECRETARY</Option>
              <Option value="PR">PR</Option>
            </Select>
          </Form.Item>

          {role === "MENTOR" && (
            <Form.Item
              name="nationId"
              label="Nation"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="Select the nation"
                onChange={(value) => {
                  const selected = nations.find(n => n.id === value);
                  form.setFieldsValue({
                    nationId: value,
                    nationName: selected?.nation,
                  });
                }}
              >
                {nations.map((n) => (
                  <Option key={n.id} value={n.id}>
                    {n.nation}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {role !== "PR" && (
            <Form.Item
              name="residentialAddress"
              label="Residential Address"
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
          )}

          {alertInfo && (
            <Form.Item>
              <Alert
                message={alertInfo.text}
                type={alertInfo.type}
                showIcon
                closable
                onClose={() => setAlertInfo(null)}
              />
            </Form.Item>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={loading}
              style={{ width: "100%" }}
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default AddMentor;
