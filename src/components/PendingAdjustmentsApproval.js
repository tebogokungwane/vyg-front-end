import React, { useEffect, useState, useContext } from 'react';
import {
  Table,
  Button,
  message,
  Typography,
  Modal,
  Descriptions,
  Popconfirm,
  Space,
  Tooltip,
  Empty,
  Tag
} from 'antd';
import axios from 'axios';
import UserContext from '../context/UserContext';

const { Title } = Typography;

const PendingAdjustmentsApproval = () => {
  const { user } = useContext(UserContext);
  const [pendingAdjustments, setPendingAdjustments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [approving, setApproving] = useState(false);

  const fetchPendingAdjustments = async () => {
    if (!user?.address?.id) return;

    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:2025/api/manual-adjustment/pending/${user.address.id}`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      setPendingAdjustments(res.data);
    } catch (err) {
      console.error("❌ Failed to load adjustments:", err);
      message.error("Could not load pending adjustments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAdjustments();
  }, [user]);

  const handleApprove = async (record) => {
    try {
      setApproving(true);
      await axios.put(
        `http://localhost:2025/api/manual-adjustment/approve/${record.id}`,
        null,
        {
          params: { approvedBy: `${user.name} ${user.surname}` },
          headers: { Authorization: `Bearer ${user?.token}` }
        }
      );
      message.success("Adjustment approved successfully");
      setModalVisible(false);
      fetchPendingAdjustments();
    } catch (err) {
      console.error("Approval failed:", err);
      if (err.response?.data?.message?.includes("approve your own")) {
        message.error("You cannot approve your own adjustment");
      } else {
        message.error("Failed to approve adjustment");
      }
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (record) => {
    try {
      await axios.delete(
        `http://localhost:2025/api/manual-adjustment/reject/${record.id}`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`
          }
        }
      );
      message.success("Adjustment rejected successfully");
      setModalVisible(false);
      fetchPendingAdjustments();
    } catch (err) {
      console.error("Rejection failed:", err);
      message.error("Failed to reject adjustment");
    }
  };

  const columns = [
    {
      title: 'Nation',
      dataIndex: 'nationName',
      key: 'nationName',
      render: (name) => <Tag color="green">{name}</Tag>
    },
    {
      title: 'Points',
      dataIndex: 'points',
      key: 'points'
    },
    {
      title: 'Type',
      dataIndex: 'adjustmentType',
      key: 'adjustmentType',
      render: (type) => (
        <Tag color={type === 'ADD' ? 'blue' : 'red'}>
          {type === 'ADD' ? 'Add' : 'Subtract'}
        </Tag>
      )
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason'
    },
    {
      title: 'Captured By',
      dataIndex: 'capturedBy',
      key: 'capturedBy'
    },
    {
      title: 'Date',
      dataIndex: 'dateCaptured',
      key: 'dateCaptured',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => {
            setSelectedRecord(record);
            setModalVisible(true);
          }}
        >
          Review
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: '20px 16px', maxWidth: '100%', boxSizing: 'border-box' }}>

      {/* ✅ Only this container scrolls left/right */}
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <div style={{ minWidth: '800px' }}>
          <Table
            columns={columns}
            dataSource={pendingAdjustments}
            loading={loading}
            rowKey="id"
            bordered
            pagination={{ pageSize: 10 }}
            locale={{
              emptyText: <Empty description={loading ? "Loading..." : "No pending adjustments"} />
            }}
          />
        </div>
      </div>

      <Modal
        title="Review Adjustment Request"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        bodyStyle={{ maxHeight: '60vh', overflowY: 'auto' }}
        centered
      >
        {selectedRecord && (
          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label="Nation">
              <Tag color="green">{selectedRecord.nationName}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Adjustment Type">
              <Tag color={selectedRecord.adjustmentType === 'ADD' ? 'blue' : 'red'}>
                {selectedRecord.adjustmentType === 'ADD' ? 'Add' : 'Subtract'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Points">{selectedRecord.points}</Descriptions.Item>
            <Descriptions.Item label="Reason">{selectedRecord.reason}</Descriptions.Item>
            <Descriptions.Item label="Captured By">{selectedRecord.capturedBy}</Descriptions.Item>
            <Descriptions.Item label="Date Captured">
              {new Date(selectedRecord.dateCaptured).toLocaleDateString()}
            </Descriptions.Item>
          </Descriptions>
        )}

        <Space style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Popconfirm
            title="Reject this adjustment?"
            onConfirm={() => handleReject(selectedRecord)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger>Reject</Button>
          </Popconfirm>

          <Tooltip
            title={selectedRecord?.capturedBy === `${user.name} ${user.surname}`
              ? "You cannot approve your own adjustment"
              : "Approve this adjustment"}
          >
            <Button
              type="primary"
              onClick={() => handleApprove(selectedRecord)}
              disabled={selectedRecord?.capturedBy === `${user.name} ${user.surname}` || approving}
              loading={approving}
            >
              Approve
            </Button>
          </Tooltip>
        </Space>
      </Modal>
    </div>
  );
};

export default PendingAdjustmentsApproval;
