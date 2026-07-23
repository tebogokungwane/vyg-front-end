import React, { useState, useEffect, useContext } from 'react';
import { Button, Form, Input, Select, message, Spin, Row, Col } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import axios from '../utils/axios';
import UserContext from '../context/UserContext';
import LocationPicker from './LocationPicker';
import "../styles/AddUserBranch.css";

const { Option } = Select;

const AddUserBranch = () => {
  const [form] = Form.useForm();
  const [nations, setNations] = useState([]);
  const [churches, setChurches] = useState([]);
  const [role, setRole] = useState("MENTOR");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useContext(UserContext);

  // Location state
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [nationsRes, churchesRes] = await Promise.all([
          axios.get(`/api/nations`, { headers }),
          axios.get(`/api/addresses`, { headers })
        ]);

        setNations(nationsRes.data);
        setChurches(churchesRes.data);
      } catch (error) {
        console.error("Fetch error:", error);
        if (error.response?.status === 403) {
          message.error("You don't have permission to access this page.");
        } else if (error.response?.status === 401) {
          message.error("Session expired. Please log in again.");
        } else {
          message.error("Failed to load data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLocationSelect = (lat, lng, displayAddress) => {
    setLatitude(lat);
    setLongitude(lng);
    form.setFieldsValue({ residentialAddress: displayAddress });
  };

  const onFinish = async (values) => {
    // Require location for roles that need a residential address
    if (role !== "PR" && (!latitude || !longitude)) {
      message.warning("Please search and select the user's address");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: values.firstName,
        surname: values.lastName,
        email: values.email,
        gender: values.gender.toUpperCase(),
        cellNumber: values.phone,
        residentialAddress: role !== "PR" ? values.residentialAddress : null,
        latitude: role !== "PR" ? latitude : null,
        longitude: role !== "PR" ? longitude : null,
        nation: role !== "PR"
          ? { id: values.nationId, nation: values.nationName?.toUpperCase() }
          : null,
        addressId: values.churchId || (role !== "PR" ? user?.address?.id : null),
        role: values.role,
        password: "VYG@123",
        isActive: true,
        createdBy: `${user?.name} ${user?.surname}`,
        capturedBy: `${user?.name} ${user?.surname}`,
      };

      const response = await axios.post(`/api/member/register`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      message.success(`${response.data.name} ${response.data.surname} registered successfully!`);
      form.resetFields();
      setLatitude(null);
      setLongitude(null);
    } catch (error) {
      console.error("Failed to create member:", error);
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
    <div className="page-wrapper">
      <div className="page-header">
        <h2>Add User for Branch</h2>
        <p>Register a new mentor, secretary, or PR for a branch</p>
      </div>

      <div className="page-card">
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

        {/* Location Picker - only for roles that need residential address */}
        {role !== "PR" && (
          <Form.Item
            label="Residential Address"
            required
            help="Search the address to capture this user's location"
          >
            <LocationPicker
              onLocationSelect={handleLocationSelect}
              placeholder="Search address (e.g. CBC Flats, Soweto, Roodepoort...)"
            />
          </Form.Item>
        )}

        {role !== "PR" && (
          <Form.Item name="residentialAddress" noStyle hidden>
            <Input />
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
    </div>
  );
};

export default AddUserBranch;
