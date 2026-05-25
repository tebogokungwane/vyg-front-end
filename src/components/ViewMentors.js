// ViewMembersAssignMentor.js
import React, { useState, useEffect, useContext } from 'react';
import {
  Table,
  Input,
  message,
  Typography,
  Space,
  Card,
  Tag,
  Avatar,
  Tooltip,
  Modal,
  Select,
  Button,
} from 'antd';
import {
  DownOutlined,
  RightOutlined,
  TeamOutlined,
  UserOutlined,
  SearchOutlined,
  EditOutlined,
} from '@ant-design/icons';
import axios from '../utils/axios';
import UserContext from '../context/UserContext';
const { Title } = Typography;
const { Option } = Select;

const ViewMembersAssignMentor = () => {
  const { user } = useContext(UserContext);
  const [mentors, setMentors] = useState([]);
  const [allMentors, setAllMentors] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalMentors, setTotalMentors] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [selectedMentorId, setSelectedMentorId] = useState(null);

  useEffect(() => {
    if (user?.address?.id) {
      fetchMentors(currentPage, pageSize);
      fetchAllMentors();
      fetchUnassigned();
    }
  }, [user]);

  const fetchMentors = async (page = 1, size = 5) => {
    try {
      const response = await axios.get(
        `/api/member/mentor/with-mentees/address/${user.address.id}`,
        { params: { page: page - 1, size } }
      );
      const { content, totalElements } = response.data;
      const formatted = content.map((mentor) => ({
        key: mentor.id,
        ...mentor,
        nationName: mentor.nation?.nation || 'N/A',
        mentees: mentor.mentees.map((m) => ({
          key: m.id,
          ...m,
          nationName: m.nation?.nation || 'N/A',
        })),
      }));
      setMentors(formatted);
      setTotalMentors(totalElements);
      setCurrentPage(page);
    } catch (error) {
      console.error('❌ Failed to fetch mentors:', error);
      message.error('Failed to load mentors.');
    }
  };

  const fetchAllMentors = async () => {
    try {
      const res = await axios.get(
        `/api/member/mentor/address/${user.address.id}`
      );
      setAllMentors(res.data);
    } catch (error) {
      console.error('❌ Failed to load mentor list:', error);
    }
  };

  const fetchUnassigned = async () => {
    try {
      const res = await axios.get(
        `/api/member/unassigned/${user.address.id}`
      );
      const formatted = (res.data || []).map((mentee) => ({
        key: mentee.id,
        ...mentee,
        nationName: mentee.nation?.nation || 'N/A',
      }));
      setUnassigned(formatted);
    } catch (error) {
      console.error('❌ Failed to load unassigned mentees:', error);
      // Don't show error toast for this — backend has members with null nation
      // This is a backend data issue, page should still load
      setUnassigned([]);
    }
  };

  const handleSearch = (e) => setSearchText(e.target.value);

  const openAssignModal = (mentee) => {
    setSelectedMentee(mentee);
    setSelectedMentorId(null);
    setIsModalOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedMentorId || !selectedMentee) return;
    try {
      await axios.patch(
        `/api/member/${selectedMentee.id}/assign-mentor`,
        { mentorId: selectedMentorId }
      );
      message.success('Mentor assigned successfully!');
      fetchMentors(currentPage, pageSize);
      fetchUnassigned();
      setIsModalOpen(false);
    } catch (error) {
      console.error('❌ Failed to assign mentor:', error);
      message.error('Failed to assign mentor.');
    }
  };

  const filteredMentors = mentors.filter((mentor) =>
    `${mentor.name} ${mentor.surname}`.toLowerCase().includes(searchText.toLowerCase())
  );

  const mentorColumns = [
    {
      title: 'Mentor',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          {record.name} {record.surname}
        </Space>
      ),
    },
    { title: 'Cell Number', dataIndex: 'cellNumber' },
    {
      title: 'Nation',
      render: (_, record) => <Tag color="blue">{record.nationName}</Tag>,
    },
    { title: 'Residential Address', dataIndex: 'residentialAddress' },
  ];

  const expandedRowRender = (mentor) => {
    if (!mentor.mentees.length)
      return <p style={{ marginLeft: 30 }}>No mentees assigned.</p>;

    return (
      <div style={{ overflowX: 'auto' }}>
        <Table
          columns={[
            {
              title: 'Mentee',
              render: (_, mentee) => (
                <Space>
                  <Avatar size="small" icon={<UserOutlined />} />
                  {mentee.name} {mentee.surname}
                </Space>
              ),
            },
            { title: 'Cell Number', dataIndex: 'cellNumber' },
            {
              title: 'Nation',
              render: (_, mentee) => <Tag color="purple">{mentee.nationName}</Tag>,
            },
            { title: 'Residential Address', dataIndex: 'residentialAddress' },
            {
              title: 'Action',
              render: (_, mentee) => (
                <Tooltip title="Reassign Mentor">
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => openAssignModal(mentee)}
                  />
                </Tooltip>
              ),
            },
          ]}
          dataSource={mentor.mentees}
          pagination={false}
          bordered
          size="small"
          scroll={{ x: 'max-content' }}
        />
      </div>
    );
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ flexShrink: 0, background: '#fff', padding: '40px 24px', borderBottom: '1px solid #f0f0f0' }}>
        <Title level={4}>Mentor & Mentee Management</Title>
        <Input
          placeholder="Search mentor by name..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={handleSearch}
          style={{ maxWidth: 400, marginTop: 10 }}
        />
      </div>

      {/* Scrollable Table Section */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, paddingBottom: 100 }}>
        <div style={{ margin: '0 auto', width: '100%', maxWidth: '95%' }}>
          <Table
            columns={mentorColumns}
            dataSource={filteredMentors}
            expandable={{
              expandedRowRender,
              expandIcon: ({ expanded, onExpand, record }) => (
                <Space style={{ cursor: 'pointer' }} onClick={(e) => onExpand(record, e)}>
                  {expanded ? <DownOutlined /> : <RightOutlined />}
                  <Tooltip title="View Mentees">
                    <TeamOutlined style={{ color: '#1890ff' }} />
                  </Tooltip>
                </Space>
              ),
            }}
            pagination={{
              current: currentPage,
              pageSize,
              total: totalMentors,
              onChange: fetchMentors,
            }}
            rowKey="key"
            bordered
            scroll={{ x: 'max-content' }}
          />

          {unassigned.length > 0 && (
            <Card title="Unassigned Member(s)" style={{ marginTop: 24, width: '100%' }}>
              <Table
                columns={[
                  {
                    title: 'Mentee',
                    render: (_, record) => (
                      <Space>
                        <Avatar size="small" icon={<UserOutlined />} />
                        {record.name} {record.surname}
                      </Space>
                    ),
                  },
                  { title: 'Cell Number', dataIndex: 'cellNumber' },
                  {
                    title: 'Nation',
                    render: (_, record) => (
                      <Tag color="orange">{record.nationName}</Tag>
                    ),
                  },
                  { title: 'Residential Address', dataIndex: 'residentialAddress' },
                  {
                    title: 'Action',
                    render: (_, record) => (
                      <Tooltip title="Assign Mentor">
                        <Button
                          type="link"
                          icon={<EditOutlined />}
                          onClick={() => openAssignModal(record)}
                        />
                      </Tooltip>
                    ),
                  },
                ]}
                dataSource={unassigned}
                pagination={false}
                rowKey="key"
                bordered
                size="small"
                scroll={{ x: 'max-content' }}
              />
            </Card>
          )}
        </div>
      </div>

      {/* Modal for Assignment */}
      <Modal
        title="Assign Mentor"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleAssign}
        okText="Assign"
        okButtonProps={{ disabled: !selectedMentorId }}
      >
        <p>
          Select a new mentor for{' '}
          <strong>
            {selectedMentee?.name} {selectedMentee?.surname}
          </strong>
          :
        </p>
        <Select
          placeholder="Select a mentor"
          style={{ width: '100%' }}
          onChange={(value) => setSelectedMentorId(value)}
        >
          {allMentors.map((m) => (
            <Option key={m.id} value={m.id}>
              {m.name} {m.surname}
            </Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
};

export default ViewMembersAssignMentor;
