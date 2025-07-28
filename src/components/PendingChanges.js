import React, { useEffect, useState } from "react";
import { Table, Button, message } from "antd";
import axios from "../utils/axios";

const PendingChanges = () => {
  const [pendingChanges, setPendingChanges] = useState([]);

  useEffect(() => {
    fetchPendingChanges();
  }, []);

  const fetchPendingChanges = async () => {
    try {
      const res = await axios.get( `/api/nations/pending-changes`);
      setPendingChanges(res.data);
    } catch (err) {
      message.error("Failed to fetch pending changes.");
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`/api/nations/approve-change/${id}`);
      message.success("Nation change approved.");
      fetchPendingChanges();
    } catch (err) {
      message.error("Failed to approve nation change.");
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.delete('/api/nations/reject-change/${id}');
      message.success("Nation change rejected.");
      fetchPendingChanges();
    } catch (err) {
      message.error("Failed to reject nation change.");
    }
  };

  const columns = [
    { title: "Nation Name", dataIndex: "nationName", key: "nationName" },
    { title: "Submitted By", dataIndex: "submittedBy", key: "submittedBy" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleApprove(record.id)}>Approve</Button>
          <Button type="link" danger onClick={() => handleReject(record.id)}>Reject</Button>
        </>
      ),
    },
  ];

  return <Table dataSource={pendingChanges} columns={columns} rowKey="id" />;
};

export default PendingChanges;
