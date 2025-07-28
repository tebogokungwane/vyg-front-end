import React, { useState, useEffect, useContext } from 'react';
import { Button, Form, Input, Select, message, Alert, Spin } from 'antd';
import axios from "../utils/axios";
import UserContext from '../context/UserContext';

const { Option } = Select;

const AddMember = () => {
  const [form] = Form.useForm();
  const [nations, setNations] = useState([]);
  const [alertInfo, setAlertInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(UserContext);

  useEffect(() => {
    axios.get( `/api/nations`)
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
        residentialAddress: values.residentialAddress,
        nation: {
          id: values.nationId,
          nation: values.nationName.toUpperCase(),
        },
        addressId: user?.address?.id,
        role: "MEMBER",
        password: "VYG@123",
        isActive: true,
        createBy: `${user?.name} ${user?.surname}`,
      };

      const response = await axios.post( `/api/member/register`, payload);
      message.success(`🎉 ${response.data.name} ${response.data.surname} registered successfully!`);
      setAlertInfo({ type: 'success', text: `${response.data.name} ${response.data.surname} registered successfully!` });
      form.resetFields();

      setTimeout(() => setAlertInfo(null), 5000);
    } catch (error) {
      console.error("❌ Failed to create member:", error);
      setAlertInfo({ type: 'error', text: 'Failed to register member. Please try again.' });
      message.error("Failed to register member.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "60px 10px",
        minHeight: "calc(100vh - 120px)",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <div
        style={{
          width: window.innerWidth > 768 ? "500px" : "100%",
          maxWidth: "900px",
          backgroundColor: "#ffffff",
          borderRadius: "10px",
          boxShadow: window.innerWidth > 768 ? "0px 4px 10px rgba(0, 0, 0, 0.1)" : "none",
          padding: "20px",
          boxSizing: "border-box",
          position: "relative",
          opacity: loading ? 0.6 : 1,
          pointerEvents: loading ? "none" : "auto",
        }}
      >
        {loading && (
          <div
            style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1,
              borderRadius: "10px"
            }}
          >
            <Spin size="large" tip="Submitting..." />
          </div>
        )}

        <Form
          form={form}
          name="addMemberForm"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[{ type: "email", message: "Invalid email" }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              { required: true, message: 'Phone number is required' },
              {
                pattern: /^0[6-8][0-9]{8}$/,
                message: 'Enter a valid SA number (e.g. 0821234567)',
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

          <Form.Item name="residentialAddress" label="Residential Address" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item name="nation" label="Nation" rules={[{ required: true }]}>
            <Select
              placeholder="Select the nation"
              onChange={(value, option) => {
                form.setFieldsValue({
                  nationId: option.key,
                  nationName: option.label,
                });
              }}
            >
              {nations.map((n) => (
                <Option key={n.id} value={n.nation} label={n.nation}>
                  {n.nation}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="nationId" noStyle hidden>
            <Input />
          </Form.Item>
          <Form.Item name="nationName" noStyle hidden>
            <Input />
          </Form.Item>

          {alertInfo && (
            <Form.Item>
              <Alert message={alertInfo.text} type={alertInfo.type} showIcon />
            </Form.Item>
          )}

          <Form.Item>
            

            <Button
              type="primary"
              htmlType="submit"
              loading={loading} // ✅ Button shows spinner
              style={{ width: "100%" }}
              disabled={loading}
            >
              Submit
            </Button>

          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default AddMember;
