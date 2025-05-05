import React from 'react';
import { Button, Form, Input, Select } from 'antd';

const { Option } = Select;

const prefixSelector = (
  <Form.Item name="prefix" noStyle>
    <Select style={{ width: 70 }}>
      <Option value="27">+27</Option> {/* South Africa */}
      <Option value="1">+1</Option> {/* USA */}
      <Option value="44">+44</Option> {/* UK */}
    </Select>
  </Form.Item>
);

const onFinish = (values) => {
  console.log('Success:', values);
};

const onFinishFailed = (errorInfo) => {
  console.log('Failed:', errorInfo);
};

const AddSecretary = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      padding: "40px",
      backgroundColor: "#f5f5f5",
      minHeight: "70vh",
    }}
  >
    <div
      style={{
        width: window.innerWidth > 768 ? "500px" : "100%",
        maxWidth: "900px",
        padding: "20px",
        backgroundColor: "#ffffff",
        borderRadius: "10px",
        boxShadow: window.innerWidth > 768 ? "0px 4px 10px rgba(0, 0, 0, 0.1)" : "none",
      }}
    >
  
      <Form
        name="basic"
        layout="vertical"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}
      >
        <Form.Item
          label="First Name"
          name="firstName"
          rules={[{ required: true, message: "Please input your first name!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Last Name"
          name="lastName"
          rules={[{ required: true, message: "Please input your last name!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="email"
          label="E-mail"
          rules={[
            { type: "email", message: "The input is not a valid E-mail!" },
            { required: true, message: "Please input your E-mail!" }
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Phone Number"
          rules={[{ required: true, message: "Please input your phone number!" }]}
        >
          <Input addonBefore={prefixSelector} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="gender" label="Gender" rules={[{ required: true }]}> 
          <Select placeholder="Select your gender">
            <Option value="male">Male</Option>
            <Option value="female">Female</Option>
          </Select>
        </Form.Item>

        <Form.Item name="mentor" label="Mentor" rules={[{ required: true }]}> 
          <Select placeholder="Select the mentor">
            <Option value="mentor1">Mentor 1</Option>
            <Option value="mentor2">Mentor 2</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  </div>
);

export default AddSecretary;
