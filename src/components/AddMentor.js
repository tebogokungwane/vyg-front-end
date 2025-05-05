import React, { useState, useEffect, useContext } from 'react';
import { Button, Form, Input, Select, message } from 'antd';
import axios from 'axios';
import UserContext from '../context/UserContext';

const { Option } = Select;

const AddMentor = () => {
  const [form] = Form.useForm();
  const [nations, setNations] = useState([]);
  const [role, setRole] = useState("MENTOR");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // ✅ Track screen size
  const { user } = useContext(UserContext);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:2025/api/nations")
      .then((res) => setNations(res.data))
      .catch((err) => {
        console.error("❌ Error fetching Nations:", err);
        message.error("Failed to load Nations");
      });
  }, []);

  const onFinish = async (values) => {
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
        addressId: role !== "PR" ? user?.address?.id : null,
        role: values.role,
        password: "VYG@123",
        isActive: true,
        createBy: `${user?.name} ${user?.surname}`,
      };

      const response = await axios.post("http://localhost:2025/api/member/register", payload);
      message.success(`🎉 ${response.data.name} ${response.data.surname} registered successfully!`);
      form.resetFields();
    } catch (error) {
      console.error("❌ Failed to create member:", error);
      message.error("Failed to register member. Please try again.");
    }
  };

  const prefixSelector = (
    <Form.Item name="prefix" noStyle>
      <Select style={{ width: 70 }} defaultValue="27">
        <Option value="27">+27</Option>
        <Option value="1">+1</Option>
        <Option value="44">+44</Option>
      </Select>
    </Form.Item>
  );

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: isMobile ? "10px" : "50px",
        height: "100vh",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: isMobile ? "100%" : "500px",
          margin: "auto",
          backgroundColor: "#ffffff",
          borderRadius: isMobile ? 0 : "10px",
          boxShadow: isMobile ? "none" : "0px 4px 10px rgba(0, 0, 0, 0.1)",
          padding: "20px",
          boxSizing: "border-box",
          overflowY: "auto",
        }}
      >
        <Form
          form={form}
          name="addMemberForm"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: "Please enter the first name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: "Please enter the last name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: "email", message: "Invalid email" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[{ required: true, message: "Please enter the phone number" }]}
          >
            <Input addonBefore={prefixSelector} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="gender"
            label="Gender"
            rules={[{ required: true, message: "Please select a gender" }]}
          >
            <Select placeholder="Select gender">
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Please select a role" }]}
          >
            <Select placeholder="Select role" onChange={(value) => setRole(value)}>
              <Option value="MENTOR">MENTOR</Option>
              <Option value="SECRETARY">SECRETARY</Option>
              <Option value="PR">PR</Option>
            </Select>
          </Form.Item>

          {role !== "PR" && (
            <>
              <Form.Item
                name="residentialAddress"
                label="Residential Address"
                rules={[{ required: true, message: "Please enter the residential address" }]}
              >
                <Input.TextArea rows={3} />
              </Form.Item>

              <Form.Item
                name="nation"
                label="Nation"
                rules={[{ required: true, message: "Please select the nation" }]}
              >
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
            </>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default AddMentor;
