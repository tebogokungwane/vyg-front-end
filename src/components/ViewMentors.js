import React, { useState, useEffect, useContext } from 'react';
import { Table, Input, message } from 'antd';
import axios from 'axios';
import UserContext from '../context/UserContext';

const ViewMentors = () => {
  const [mentors, setMentors] = useState([]);
  const [searchText, setSearchText] = useState('');
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchMentors = async () => {
      if (!user?.address?.id) {
        message.error("User address ID not found.");
        return;
      }

      try {
        const response = await axios.get(`http://localhost:2025/api/member/mentor/address/${user.address.id}`);
        const formatted = response.data.map((mentor) => ({
          key: mentor.id,
          name: mentor.name,
          surname: mentor.surname,
          cellNumber: mentor.cellNumber,
          nation: mentor.nation?.nation || '',
          residentialAddress: mentor.residentialAddress,
        }));
        setMentors(formatted);
      } catch (error) {
        console.error("❌ Failed to fetch mentors:", error);
        message.error("Failed to load mentors.");
      }
    };

    fetchMentors();
  }, [user]);

  const filteredMentors = mentors.filter((mentor) =>
    `${mentor.name} ${mentor.surname}`.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', responsive: ['xs', 'sm', 'md', 'lg'] },
    { title: 'Surname', dataIndex: 'surname', key: 'surname', responsive: ['xs', 'sm', 'md', 'lg'] },
    { title: 'Cell Number', dataIndex: 'cellNumber', key: 'cellNumber', responsive: ['sm', 'md', 'lg'] },
    { title: 'Nation', dataIndex: 'nation', key: 'nation', responsive: ['sm', 'md', 'lg'] },
    { title: 'Residential Address', dataIndex: 'residentialAddress', key: 'residentialAddress', responsive: ['md', 'lg'] },
    {
      title: 'Operation',
      key: 'operation',
      render: (_, record) => (
        <span style={{ color: '#1890ff', cursor: 'pointer' }}>View</span>
      ),
      responsive: ['xs', 'sm', 'md', 'lg'],
    },
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <Input
        placeholder="Search by name or surname..."
        style={{ marginBottom: 16, width: '100%' }}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />

      <Table
        columns={columns}
        dataSource={filteredMentors}
        rowKey="key"
        bordered
        pagination={{ pageSize: 5 }}
        scroll={{ x: 'max-content' }} // allows responsive overflow when needed
      />
    </div>
  );
};

export default ViewMentors;
