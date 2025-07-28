import React, { useEffect, useState, useContext } from 'react';
import {
  Table,
  Button,
  message,
  Typography,
  Modal,
  List,
  Descriptions,
  Popconfirm,
  Space,
  Tooltip,
  Empty,
  Tag
} from 'antd';
import axios from '../utils/axios';
import UserContext from '../context/UserContext';

const { Title, Text } = Typography;

const PendingPointsApproval = () => {
  const { user } = useContext(UserContext);
  const [groupedPoints, setGroupedPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [eventsMap, setEventsMap] = useState({});
  const [approving, setApproving] = useState(false);

  const fetchPendingPoints = async () => {
    if (!user?.address?.id) return;
    
    try {
      setLoading(true);
      
      // Fetch events if not already loaded
      if (Object.keys(eventsMap).length === 0) {
        const eventsRes = await axios.get( `/api/base-events/allEvents`);
        const newEventsMap = {};
        eventsRes.data.forEach((e) => {
          newEventsMap[e.id] = e.name;
        });
        setEventsMap(newEventsMap);
      }
      
      // Fetch pending points
      const res = await axios.get(`/api/points/pending/address/${user.address.id}`);
      
      const enriched = res.data.map(item => ({
        ...item,
        baseEvent: { 
          name: eventsMap[item.baseEventId] || 'Unknown Event' 
        },
        formattedAddressName: item.addressName?.replace(/_/g, ' ') // Format address name
      }));
      
      const grouped = groupByRequest(enriched);
      setGroupedPoints(grouped);
    } catch (err) {
      console.error("Failed to load data:", err);
      message.error("Failed to load pending points");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPoints();
  }, [user, eventsMap]);

  const groupByRequest = (data) => {
    const groups = {};
    data.forEach(item => {
      const key = `${item.nationName}-${item.dateCaptured}-${item.capturedBy}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return Object.entries(groups).map(([key, value]) => ({
      key,
      nationName: value[0].nationName,
      dateCaptured: value[0].dateCaptured,
      capturedBy: value[0].capturedBy,
      addressName: value[0].addressName,
      formattedAddressName: value[0].formattedAddressName,
      fullAddress: value[0].fullAddress,
      records: value
    }));
  };

  const handleApprove = async (group) => {
    try {
      setApproving(true);
      
      const promises = group.records.map((record) =>
        axios.put(`/api/points/approve/${record.id}`, null, {
          params: {
            approvedBy: `${user.name} ${user.surname}`
          }
        })
      );

      await Promise.all(promises);
      message.success("Points approved successfully!");
      
      await fetchPendingPoints();
      setModalVisible(false);
    } catch (err) {
      console.error("Approval failed:", err);
      
      if (err.response?.data?.message?.includes("already been captured")) {
        message.error("These points were already approved for this week");
      } else if (err.response?.data?.message?.includes("cannot approve your own")) {
        message.error("You cannot approve your own submission");
      } else {
        message.error("Approval failed. Please try again.");
      }
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (group) => {
    try {
      const promises = group.records.map((record) =>
        axios.delete(`/api/points/reject/${record.id}`)
      );
      await Promise.all(promises);
      message.success("Points rejected successfully");
      
      await fetchPendingPoints();
      setModalVisible(false);
    } catch (err) {
      console.error("Rejection failed:", err);
      message.error("Rejection failed");
    }
  };

  const columns = [
    {
      title: 'Branch',
      dataIndex: 'formattedAddressName',
      key: 'addressName',
      render: (name) => <Tag color="blue">{name}</Tag>
    },
    {
      title: 'Address',
      dataIndex: 'fullAddress',
      key: 'fullAddress',
      render: (address) => <Text>{address}</Text>
    },
    {
      title: 'Nation',
      dataIndex: 'nationName',
      key: 'nationName',
      render: (name) => <Tag color="green">{name}</Tag>
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
      width: 120,
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small"
          onClick={() => {
            setSelectedGroup(record); 
            setModalVisible(true);
          }}
        >
          Review
        </Button>
      )
    }
  ];

  return (
    <div style={{ overflowX: 'auto', padding: '50px 20px 20px'}}>
    <Table
      columns={columns}
      dataSource={groupedPoints}
      loading={loading}
      rowKey="key"
      bordered
      pagination={{ pageSize: 10 }}
      scroll={{ x: 'max-content' }}
      size="middle"
      locale={{
        emptyText: (
          <Empty 
            description={loading ? "Loading..." : "No pending points to approve"} 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )
      }}
    />

      <Modal
        title="Review Point Submission"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedGroup && (
          <>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Branch">
                <Tag color="blue">{selectedGroup.formattedAddressName}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                <Text>{selectedGroup.fullAddress}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Nation">
                <Tag color="green">{selectedGroup.nationName}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Captured By">
                {selectedGroup.capturedBy}
              </Descriptions.Item>
              <Descriptions.Item label="Date Captured">
                {new Date(selectedGroup.dateCaptured).toLocaleDateString()}
              </Descriptions.Item>
            </Descriptions>
            
            <List
              itemLayout="horizontal"
              dataSource={selectedGroup.records}
              renderItem={(item, idx) => (
                <List.Item key={idx}>
                  <List.Item.Meta
                    title={`${item.baseEvent?.name}`}
                    description={
                      <>
                        <Text>People: {item.numberOfPeople}</Text><br />
                        <Text>Points per person: {item.defaultPoints}</Text><br />
                        <Text strong>Total points: {item.totalPoints}</Text>
                      </>
                    }
                  />
                </List.Item>
              )}
              style={{ marginTop: 16 }}
            />
            
            <Space style={{ marginTop: 16, display: 'flex', justifyContent: 'end' }}>
              <Popconfirm 
                title="Are you sure you want to reject this submission?" 
                onConfirm={() => handleReject(selectedGroup)}
                okText="Yes"
                cancelText="No"
              >
                <Button danger>Reject</Button>
              </Popconfirm>
              
              <Tooltip
                title={selectedGroup.capturedBy === `${user.name} ${user.surname}` ? 
                  "You cannot approve your own submission" : 
                  "Approve this submission"}
              >
                <Button
                  type="primary"
                  onClick={() => handleApprove(selectedGroup)}
                  disabled={selectedGroup.capturedBy === `${user.name} ${user.surname}` || approving}
                  loading={approving}
                >
                  Approve
                </Button>
              </Tooltip>
            </Space>
          </>
        )}
      </Modal>
    </div>
  );
};

export default PendingPointsApproval;