import React, { useEffect, useState } from "react";
import { Card, Button, Spin, message, Row, Col, Modal, Typography } from "antd";
import axios from "../utils/axios";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { confirm } = Modal;
const { Title, Text } = Typography;

const ApproveNationChanges = ({ approverName, addressId }) => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("📦 Props:", { approverName, addressId });
    if (addressId) fetchPendingRequests();
  }, [addressId]);
  

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/nation/pending/${addressId}`);
      setPendingRequests(res.data);
    } catch (err) {
      message.error("Failed to fetch pending nation requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (requestId) => {
    confirm({
      title: "Approve Nation Request?",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to approve this change?",
      onOk: async () => {
        try {
          await axios.put(`/api/nation-requests/approve/${requestId}`, null, {
            params: { approverName },
          });
          message.success("Nation request approved!");
          fetchPendingRequests();
        } catch (err) {
          message.error("Failed to approve nation request.");
        }
      },
    });
  };

  const handleReject = (requestId) => {
    confirm({
      title: "Reject Nation Request?",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to reject this change?",
      onOk: async () => {
        try {
          await axios.put(`/api/nation-requests/reject/${requestId}`, null, {
            params: { approverName },
          });
          message.success("Nation request rejected.");
          fetchPendingRequests();
        } catch (err) {
          message.error("Failed to reject nation request.");
        }
      },
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <Title level={3}>Pending Nation Change Requests</Title>
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {pendingRequests.map((req) => (
            <Col key={req.id} xs={24} sm={12} md={8}>
              <Card
                hoverable
                cover={
                  <img
                    alt={req.nationName}
                    src={`/api/nations/image/${req.nationId}`}
                    onError={(e) => (e.target.src = "/default-image.jpg")}
                    style={{ height: 200, objectFit: "cover" }}
                  />
                }
                actions={[
                  <Button type="primary" onClick={() => handleApprove(req.id)}>
                    Approve
                  </Button>,
                  <Button danger onClick={() => handleReject(req.id)}>
                    Reject
                  </Button>,
                ]}
              >
                <Title level={5}>{req.nationName}</Title>
                <Text>Submitted by: {req.submittedBy}</Text><br />
                <Text>Date: {new Date(req.submittedAt).toLocaleString()}</Text>
              </Card>
            </Col>
          ))}
        </Row>
        {pendingRequests.length === 0 && !loading && (
          <Text>No pending requests to approve.</Text>
        )}
      </Spin>
    </div>
  );
};

export default ApproveNationChanges;
