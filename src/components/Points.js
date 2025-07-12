import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  Row,
  Col,
  Modal,
  Form,
  InputNumber,
  Button,
  DatePicker,
  message,
  Alert,
  Spin
} from "antd";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import axios from "axios";
import "../styles/Points.css";
import UserContext from "../context/UserContext";
import defaultImage from "../images/vyg.jpg";

dayjs.extend(customParseFormat);

const disabledDate = (current) => {
  const today = dayjs();
  const currentYear = today.year();
  return (
    current.year() !== currentYear ||
    current.day() !== 0 || // Only Sundays
    current.isAfter(today, "day")
  );
};

const Points = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNation, setSelectedNation] = useState(null);
  const [nations, setNations] = useState([]);
  const [events, setEvents] = useState([]);
  const { user } = useContext(UserContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [errorAlert, setErrorAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [nationRes, eventRes] = await Promise.all([
          axios.get("http://localhost:2025/api/nations"),
          axios.get("http://localhost:2025/api/base-events/allEvents"),
        ]);

        const validNations = nationRes.data.filter(
          (nation) => nation && nation.id && nation.nation
        );

        setNations(validNations);
        setEvents(eventRes.data || []);
      } catch (err) {
        console.error("❌ Failed to load data", err);
        message.error("Failed to load nations or events.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openModal = (nationObj) => {
    if (!nationObj) return;
    setSelectedNation({
      id: nationObj.id,
      nation: nationObj.nation || "Unknown Nation",
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    form.resetFields();
    setShowSuccessAlert(false);
    setErrorAlert(null);
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      if (!selectedNation) {
        message.error("No nation selected");
        return;
      }

      const dateCaptured = values.selectedDate?.format("YYYY-MM-DD");
      if (!dateCaptured) {
        message.error("Please select a valid date");
        return;
      }

      const eventAttendance = {};
      let hasInvalidValue = false;

      events.forEach((event) => {
        const fieldName = `event_${event.id}`;
        const value = values[fieldName];
        if (value == null || value < 0 || isNaN(value)) {
          hasInvalidValue = true;
        } else {
          eventAttendance[event.id] = value;
        }
      });

      if (hasInvalidValue) {
        message.error("Please enter valid numeric values (0 or more) for all events.");
        return;
      }

      const payload = {
        nationId: selectedNation.id,
        capturedBy: user ? `${user.name} ${user.surname}` : "system_admin",
        dateCaptured,
        addressId: user?.address?.id,
        eventAttendance,
      };
      const token = localStorage.getItem("token");

      await axios.post("http://localhost:2025/api/points/capture", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true
      });


      setShowSuccessAlert(true);
      setErrorAlert(null);

      setTimeout(() => {
        setShowSuccessAlert(false);
        closeModal();
      }, 3000);
    } catch (error) {
      console.error("❌ Error submitting attendance:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        "Failed to capture attendance.";

      if (
        errorMessage.toLowerCase().includes("once a day") ||
        errorMessage.toLowerCase().includes("already captured")
      ) {
        setErrorAlert("⚠️ You have already captured points for this nation on the selected date.");
      } else {
        setErrorAlert(`❌ ${errorMessage}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleValidationFail = ({ errorFields }) => {
    if (errorFields.length) {
      form.scrollToField(errorFields[0].name);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Loading nations..." />
      </div>
    );
  }

  return (
    <div
      className="nation-container"
      style={{ padding: isMobile ? "20px" : "60px" }}
    >
      <Row gutter={[24, 24]} justify="center">
        {nations.length > 0 ? (
          nations.map((nationObj, index) => (
            <Col xs={24} sm={12} md={8} key={nationObj.id || index}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Card
                  hoverable
                  className="nation-card"
                  cover={
                    <img
                      src={`http://localhost:2025/api/nations/${nationObj.id}/image`}
                      alt={nationObj.nation || "Nation"}
                      className="nation-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultImage;
                      }}
                    />
                  }
                  onClick={() => openModal(nationObj)}
                >
                  <h3 className="nation-title">
                    {(nationObj.nation || "NATION").toUpperCase()}
                  </h3>
                </Card>
              </motion.div>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Alert
              message="No nations available"
              description="There are currently no nations to display."
              type="info"
              showIcon
            />
          </Col>
        )}
      </Row>

      <Modal
        title=""
        open={modalVisible}
        onCancel={closeModal}
        width={650}
        style={{ top: 70 }}
        footer={[
          <Button key="cancel" onClick={closeModal}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => form.submit()}
            loading={submitting}
            disabled={submitting}
          >
            Submit
          </Button>,
        ]}
      >
        {selectedNation && (
          <div className="popup-header">
            <img
              src={`http://localhost:2025/api/nations/${selectedNation.id}/image`}
              alt={selectedNation.nation || "Nation"}
              className="nation-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultImage;
              }}
            />
            <h3 className="nation-title">
              {(selectedNation.nation || "NATION").toUpperCase()}
            </h3>
          </div>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onFinishFailed={handleValidationFail}
        >
          <Form.Item
            label="Select a Date (Sunday)"
            name="selectedDate"
            rules={[{ required: true, message: "Please select a date!" }]}
          >
            <DatePicker
              disabledDate={disabledDate}
              format="YYYY-MM-DD"
              style={{ width: "100%" }}
              allowClear={false}
            />
          </Form.Item>

          <Row gutter={[16, 16]}>
            {events.map((event) => (
              <Col xs={24} sm={12} key={event.id}>
                <Form.Item
                  label={
                    <span>
                      {event.name} - <strong>{event.defaultPoints}</strong>
                    </span>
                  }
                  name={`event_${event.id}`}
                  rules={[
                    {
                      required: true,
                      type: "number",
                      min: 0,
                      message: "Please enter a valid number (0 or more)",
                    },
                  ]}
                >
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            ))}
          </Row>

          {errorAlert && (
            <Form.Item>
              <Alert
                message={errorAlert}
                type="error"
                showIcon
                closable
                onClose={() => setErrorAlert(null)}
              />
            </Form.Item>
          )}

          {showSuccessAlert && (
            <Alert
              message="✅ Points captured waiting for approval!"
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default Points;
