import React, { useState, useEffect, useContext } from 'react';
import { Button, Form, Input, Select, message, Spin, Row, Col } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import axios from '../utils/axios';
import UserContext from '../context/UserContext';
import "../styles/AddUserBranch.css";

const { Option } = Select;

const AddUserBranch = () => {
  const [form] = Form.useForm();
  const [ setNations] = useState([]);
  const [churches, setChurches] = useState([]);
  const [role, setRole] = useState("MENTOR");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [nationsRes, churchesRes] = await Promise.all([
          axios.get(`/api/nations`),
          axios.get(`/api/addresses`)
        ]);
        setNations(nationsRes.data);
        setChurches(churchesRes.data);
      } catch (error) {
        message.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        name: values.firstName,
        surname: values.lastName,
        email: values.email,
        gender: values.gender.toUpperCase(),
        cellNumber: values.phone,
        residentialAddress: role !== "PR" ? values.residentialAddress : null,
        nation: role !== "PR"
          ? { id: values.nationId, nation: values.nationName?.toUpperCase() }
          : null,
        addressId: values.churchId || (role !== "PR" ? user?.address?.id : null),
        role: values.role,
        password: "VYG@123",
        isActive: true,
        createBy: `${user?.name} ${user?.surname}`,
      };

      const response = await axios.post(`/api/member/register`, payload);
      message.success(`🎉 ${response.data.name} ${response.data.surname} registered successfully!`);
      form.resetFields();
    } catch (error) {
      console.error("❌ Failed to create member:", error);
      message.error(error.response?.data?.message || "Failed to register member. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
      </div>
    );
  }

  return (
    <div className="add-user-container" style={{ paddingTop: "60px" }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        className="responsive-form"
      >
        <Row gutter={[16, 8]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: 'Please input first name!' }]}
            >
              <Input placeholder="Enter first name" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: 'Please input last name!' }]}
            >
              <Input placeholder="Enter last name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 8]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please input email!' },
                { type: "email", message: "Invalid email format" }
              ]}
            >
              <Input placeholder="Enter email" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[
                { required: true, message: 'Please input phone number!' },
                {
                  pattern: /^0[6-8][0-9]{8}$/,
                  message: 'Enter a valid SA number (e.g. 0821234567)',
                },
              ]}
            >
              <Input maxLength={10} placeholder="e.g. 0821234567" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 8]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="gender"
              label="Gender"
              rules={[{ required: true, message: 'Please select gender!' }]}
            >
              <Select placeholder="Select gender">
                <Option value="male">Male</Option>
                <Option value="female">Female</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: 'Please select role!' }]}
            >
              <Select
                placeholder="Select role"
                onChange={(value) => setRole(value)}
              >
                <Option value="MENTOR">MENTOR</Option>
                <Option value="SECRETARY">SECRETARY</Option>
                <Option value="PR">PR</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {role !== "PR" && (
          <Form.Item
            name="residentialAddress"
            label="Residential Address"
            rules={[{ required: true, message: 'Please input residential address!' }]}
          >
            <Input.TextArea rows={3} placeholder="Enter full residential address" />
          </Form.Item>
        )}

        <Form.Item
          name="churchId"
          label="Church"
          rules={[{ required: true, message: 'Please select church!' }]}
        >
          <Select
            showSearch
            placeholder="Select church"
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
            optionFilterProp="children"
          >
            {churches.map((church) => (
              <Option key={church.id} value={church.id}>
                {church.fullAddress}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item className="submit-button-wrapper">
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={submitting}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddUserBranch;