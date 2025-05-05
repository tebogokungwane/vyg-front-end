import React, { useState, useEffect, useContext } from "react";
import {
  Select,
  InputNumber,
  Button,
  message,
  Form,
  Row,
  Input,
  Alert,
} from "antd";
import axios from "axios";
import UserContext from "../context/UserContext";


const { Option } = Select;
const { TextArea } = Input;

const AdjustNationPoints = () => {
  const { user } = useContext(UserContext);
  const [nations, setNations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchNations = async () => {
      try {
        const res = await axios.get("http://localhost:2025/api/nations");
        setNations(res.data);
      } catch (err) {
        console.error("Failed to fetch nations:", err);
        message.error("Could not load nations.");
      }
    };

    fetchNations();
  }, []);

  const handleSubmit = async (values) => {
    if (!user?.address?.id) {
      message.error("User address ID not found.");
      return;
    }

    const payload = {
      nationId: values.nationId,
      points: values.points,
      adjustmentType: values.adjustmentType,
      reason: values.reason,
      capturedBy: `${user.name} ${user.surname}`,
      addressId: user.address.id,
    };

    setLoading(true);
    try {
      await axios.post("http://localhost:2025/api/points/adjust", payload);
      setShowSuccessAlert(true); // ✅ Show alert
      form.resetFields();

      // Optional: auto-hide the alert after 3 seconds
      setTimeout(() => setShowSuccessAlert(false), 3000);
    } catch (error) {
      console.error("Error adjusting points:", error);
      message.error("Failed to adjust points.");
    } finally {
      setLoading(false);
    }
  };


  return (


    <div
      style={{
        padding: isMobile ? "0px" : "80px",
        backgroundColor: "#fff",
        minHeight: "100vh",
      }}
    >

      {showSuccessAlert && (
        <Alert
          message="✅ Points adjusted successfully!"
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <div style={{ maxWidth: isMobile ? "100%" : "600px", margin: "0 auto" }}>
        <Form
          layout="vertical"
          form={form}
          onFinish={handleSubmit}
          style={{ padding: isMobile ? "16px" : "0" }}
        >
          <Form.Item
            name="nationId"
            label="Select Nation"
            rules={[{ required: true, message: "Please select a nation" }]}
          >
            <Select placeholder="Choose nation">
              {nations.map((n) => (
                <Option key={n.id} value={n.id}>
                  {n.nation}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="adjustmentType"
            label="Adjustment Type"
            rules={[{ required: true, message: "Select adjustment type" }]}
          >
            <Select placeholder="Add or Subtract">
              <Option value="ADD">Add</Option>
              <Option value="SUBTRACT">Subtract</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="points"
            label="Points"
            rules={[{ required: true, message: "Enter point value" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="reason"
            label="State a Reason"
            rules={[{ required: true, message: "Please provide a reason for the adjustment" }]}
          >
            <TextArea rows={3} placeholder="E.g. Correction for missing attendance" />
          </Form.Item>

          <Form.Item>
            <Row justify="center">
              <Button type="primary" htmlType="submit" loading={loading}>
                Submit Adjustment
              </Button>
            </Row>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default AdjustNationPoints;
