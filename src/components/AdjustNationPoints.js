import { useState, useEffect, useContext } from "react";
import {
  Select,
  InputNumber,
  Button,
  message,
  Form,
  Input,
  Alert,
  Avatar,
  Tag,
  Spin,
} from "antd";
import {
  PlusCircleOutlined,
  MinusCircleOutlined,
  TrophyOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import axios from "../utils/axios";
import UserContext from "../context/UserContext";
import defaultImage from "../images/vyg.jpg";

const { Option } = Select;
const { TextArea } = Input;

const AdjustNationPoints = () => {
  const { user } = useContext(UserContext);
  const [nations, setNations] = useState([]);
  const [nationPoints, setNationPoints] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingNations, setLoadingNations] = useState(true);
  const [form] = Form.useForm();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [selectedNation, setSelectedNation] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchNationsAndPoints();
  }, [user]);

  const fetchNationsAndPoints = async () => {
    setLoadingNations(true);
    try {
      const addressId = user?.address?.id;
      const [nationsRes, pointsRes] = await Promise.all([
        axios.get(`/api/nations`),
        addressId
          ? axios.get(`/api/points/summary/address/${addressId}`)
          : Promise.resolve({ data: [] }),
      ]);

      setNations(nationsRes.data || []);

      // Aggregate approved points per nation
      const pointsData = pointsRes.data || [];
      const aggregated = {};
      pointsData.forEach((entry) => {
        const nationName = entry.nation?.nation;
        if (!nationName) return;
        if (!aggregated[nationName]) aggregated[nationName] = 0;
        aggregated[nationName] += (entry.points * entry.numberOfPeople) || entry.totalPoints || entry.points || 0;
      });

      setNationPoints(aggregated);
    } catch (err) {
      console.error("Failed to fetch nations:", err);
      message.error("Could not load nations.");
    } finally {
      setLoadingNations(false);
    }
  };

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
      await axios.post(`/api/manual-adjustment/request`, payload);
      setShowSuccessAlert(true);
      form.resetFields();
      setSelectedNation(null);
      setTimeout(() => setShowSuccessAlert(false), 4000);
    } catch (error) {
      console.error("Error adjusting points:", error);
      message.error("Failed to submit adjustment.");
    } finally {
      setLoading(false);
    }
  };

  const getNationLogo = (nation) => {
    if (nation?.imageName) {
      return `${BASE_URL}/api/nations/${nation.id}/image`;
    }
    return defaultImage;
  };

  const handleNationChange = (nationId) => {
    const nation = nations.find((n) => n.id === nationId);
    setSelectedNation(nation);
  };

  if (loadingNations) {
    return <div style={{ textAlign: "center", padding: 60 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ padding: isMobile ? 12 : 24, maxWidth: 650, margin: "0 auto" }}>
      {/* Info Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #e6f7ff, #f0f5ff)",
          borderRadius: 14,
          padding: "14px 18px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 10,
          border: "1px solid #91d5ff",
        }}
      >
        <InfoCircleOutlined style={{ fontSize: 20, color: "#1890ff" }} />
        <span style={{ fontSize: 13, color: "#333" }}>
          Adjustments are sent for approval. Points will only reflect after being approved.
        </span>
      </div>

      {showSuccessAlert && (
        <Alert
          message="✅ Adjustment submitted for approval!"
          description="The adjustment will reflect once approved by an administrator."
          type="success"
          showIcon
          closable
          style={{ marginBottom: 20, borderRadius: 10 }}
        />
      )}

      {/* Nation Points Overview */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 24,
        }}
      >
        {nations.map((nation) => (
          <div
            key={nation.id}
            onClick={() => {
              form.setFieldsValue({ nationId: nation.id });
              setSelectedNation(nation);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              borderRadius: 12,
              border: selectedNation?.id === nation.id ? "2px solid #1890ff" : "1px solid #f0f0f0",
              background: selectedNation?.id === nation.id ? "#e6f7ff" : "#fafafa",
              cursor: "pointer",
              transition: "all 0.2s ease",
              flex: isMobile ? "1 1 calc(50% - 10px)" : "0 0 auto",
            }}
          >
            <Avatar
              src={getNationLogo(nation)}
              size={28}
              shape="square"
              style={{ borderRadius: 8 }}
              onError={() => true}
            />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{nation.nation}</div>
              <div style={{ fontSize: 11, color: "#888" }}>
                <TrophyOutlined style={{ marginRight: 3 }} />
                {(nationPoints[nation.nation] || 0).toLocaleString()} pts
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: isMobile ? 16 : 24,
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          border: "1px solid #f0f0f0",
        }}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            name="nationId"
            label="Select Nation"
            rules={[{ required: true, message: "Please select a nation" }]}
          >
            <Select
              placeholder="Choose nation"
              onChange={handleNationChange}
              style={{ borderRadius: 8 }}
              showSearch
              optionFilterProp="children"
            >
              {nations.map((n) => (
                <Option key={n.id} value={n.id}>
                  {n.nation} — {(nationPoints[n.nation] || 0).toLocaleString()} pts
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Selected nation points display */}
          {selectedNation && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                borderRadius: 10,
                background: "#f6ffed",
                border: "1px solid #b7eb8f",
                marginBottom: 16,
              }}
            >
              <Avatar
                src={getNationLogo(selectedNation)}
                size={40}
                shape="square"
                style={{ borderRadius: 10 }}
              />
              <div>
                <div style={{ fontWeight: 600 }}>{selectedNation.nation}</div>
                <div style={{ fontSize: 13, color: "#52c41a" }}>
                  Current Points: <strong>{(nationPoints[selectedNation.nation] || 0).toLocaleString()}</strong>
                </div>
              </div>
            </div>
          )}

          <Form.Item
            name="adjustmentType"
            label="Adjustment Type"
            rules={[{ required: true, message: "Select adjustment type" }]}
          >
            <Select placeholder="Add or Subtract">
              <Option value="ADD">
                <PlusCircleOutlined style={{ color: "#52c41a", marginRight: 6 }} />
                Add Points
              </Option>
              <Option value="SUBTRACT">
                <MinusCircleOutlined style={{ color: "#ff4d4f", marginRight: 6 }} />
                Subtract Points
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="points"
            label="Points"
            rules={[{ required: true, message: "Enter point value" }]}
          >
            <InputNumber min={1} style={{ width: "100%", borderRadius: 8 }} placeholder="Enter points amount" />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Reason for Adjustment"
            rules={[{ required: true, message: "Please provide a reason" }]}
          >
            <TextArea
              rows={3}
              placeholder="E.g. Correction for missing attendance, bonus for event..."
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={loading}
              block
              size="large"
              style={{ borderRadius: 10, height: 46 }}
            >
              Submit for Approval
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default AdjustNationPoints;
