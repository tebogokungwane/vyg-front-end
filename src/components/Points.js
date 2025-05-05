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
    current.day() !== 0 || // Only Sunday
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
        setNations(nationRes.data);
        setEvents(eventRes.data);
      } catch (err) {
        console.error("❌ Failed to load data", err);
        message.error("Failed to load nations or events.");
      }
    };

    fetchData();
  }, []);

  const openModal = (nationObj) => {
    setSelectedNation(nationObj);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    form.resetFields();
    setShowSuccessAlert(false);
  };

  const handleSubmit = async (values) => {
    try {
      const dateCaptured = values.selectedDate.format("YYYY-MM-DD");
      const eventAttendance = {};

      let invalid = false;

      events.forEach((event) => {
        const fieldName = `event_${event.id}`;
        const value = values[fieldName];
        if (value == null || value < 0 || isNaN(value)) {
          invalid = true;
        } else {
          eventAttendance[event.id] = value;
        }
      });

      if (invalid) {
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

      await axios.post("http://localhost:2025/api/base-events/capture", payload);

      setShowSuccessAlert(true);
      setTimeout(() => {
        setShowSuccessAlert(false);
        closeModal();
      }, 3000);
    }

    catch (error) {
      console.error("❌ Error submitting attendance:", error);
      console.log("📦 Full error response:", error.response);

      const backendMessage = error.response?.data || "Failed to capture attendance."; // not .data.message, just .data

      if (
        backendMessage.toLowerCase().includes("once a day") ||
        backendMessage.toLowerCase().includes("already captured")
      ) {
        setErrorAlert("⚠️ You have already captured points for this nation on the selected date.");
      } else {
        setErrorAlert(`❌ ${backendMessage}`);
      }
    }

  };

  return (
    <div
      className="nation-container"
      style={{ padding: isMobile ? "20px" : "60px" }}
    >
      <Row gutter={[24, 24]} justify="center">
        {nations.map((nationObj, index) => (
          <Col xs={24} sm={12} md={8} key={index}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Card
                hoverable
                className="nation-card"
                cover={
                  <img
                    src={`http://localhost:2025/api/nations/${nationObj.id}/image`}
                    alt={nationObj.nation}
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
                  {nationObj.nation.toUpperCase()}
                </h3>
              </Card>
            </motion.div>
          </Col>
        ))}
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
          <Button key="submit" type="primary" onClick={form.submit}>
            Submit
          </Button>,
        ]}
      >
        {selectedNation && (
          <div className="popup-header">
            <img
              src={`http://localhost:2025/api/nations/${selectedNation.id}/image`}
              alt={selectedNation.nation}
              className="nation-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultImage;
              }}
            />
            <h3 className="nation-title">
              {selectedNation.nation.toUpperCase()}
            </h3>
          </div>
        )}



        <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
              message="✅ Points captured successfully!"
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
