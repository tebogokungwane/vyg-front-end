import React, { useState, useEffect, useContext } from "react";
import { Button, Modal, Form, Table, message, Tag, Select, Avatar } from "antd";
import { TrophyTwoTone } from "@ant-design/icons";
import axios from "axios";
import UserContext from "../context/UserContext";
import defaultImage from "../images/vyg.jpg";

const { Option } = Select;

const NationPerformance = () => {
  const [form] = Form.useForm();
  const [selectedNation, setSelectedNation] = useState(null);
  const [nationPoints, setNationPoints] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [currentKey, setCurrentKey] = useState(null);
  const [topNation, setTopNation] = useState({});
  const [nationsInfo, setNationsInfo] = useState([]);
  const [viewMode, setViewMode] = useState("weekly");
  const [availableKeys, setAvailableKeys] = useState([]);
  const { user } = useContext(UserContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!user?.address?.id) return;

    const fetchData = async () => {
      try {
        const [pointsRes, nationsRes, topRes] = await Promise.all([
          axios.get(`http://localhost:2025/api/points/summary/address/${user.address.id}`),
          axios.get("http://localhost:2025/api/nations"),
          axios.get(`http://localhost:2025/api/points/top-performance/address/${user.address.id}`),
        ]);

        const grouped = {};
        const keysSet = new Set();

        pointsRes.data.forEach((entry) => {
          const key =
            viewMode === "weekly"
              ? entry.weekNumber
              : viewMode === "monthly"
                ? entry.month
                : entry.year;

          const nation = entry.nation.nation;
          const points = entry.totalPointsEarnedPerWeek;

          if (!grouped[nation]) grouped[nation] = {};
          if (!grouped[nation][key]) grouped[nation][key] = 0;
          grouped[nation][key] += points;

          keysSet.add(key);
        });

        const sortedKeys = Array.from(keysSet).sort((a, b) => a - b);
        setNationPoints(grouped);
        setNationsInfo(nationsRes.data);
        setTopNation(topRes.data);
        setAvailableKeys(sortedKeys);
        if (!currentKey && sortedKeys.length > 0) setCurrentKey(sortedKeys[0]);
      } catch (err) {
        console.error("❌ Error fetching data:", err);
        message.error("Error loading nation performance.");
      }
    };

    fetchData();
  }, [user, viewMode]);

  const getLabel = (key) => {
    return viewMode.charAt(0).toUpperCase() + viewMode.slice(1) + " " + key;
  };

  const getTableData = () => {
    return nationsInfo.map((nationObj) => ({
      key: nationObj.nation,
      nation: nationObj.nation,
      logo: nationObj.imageName
        ? `http://localhost:2025/api/nations/${nationObj.id}/image`
        : defaultImage,
      members: nationObj.totalMembers || 0,
      mentors: nationObj.totalMentors || 0,
      secretaries: nationObj.totalSecretaries || 0,
      total: nationObj.totalPoints || 0,
    }));
  };
  

  const rankedData = getTableData()
    .sort((a, b) => b.total - a.total)
    .map((row, index) => ({
      ...row,
      rank: index + 1,
      rankDisplay:
        index === 0 ? (
          <>
            <TrophyTwoTone twoToneColor="#FFD700" style={{ fontSize: "20px" }} /> {index + 1}
          </>
        ) : (
          index + 1
        ),
    }));

    const columns = [
      {
        title: "Nation",
        dataIndex: "nation",
        key: "nation",
        render: (text, record) => (
          <span>
            <Avatar src={record.logo} style={{ marginRight: 4 }} />
            {text}
          </span>
        ),
      },
      {
        title: "Total Members",
        dataIndex: "members",
        key: "members",
        align: "center",
      },
      {
        title: "Mentors",
        dataIndex: "mentors",
        key: "mentors",
        align: "center",
      },
      {
        title: "Secretaries",
        dataIndex: "secretaries",
        key: "secretaries",
        align: "center",
      },
      {
        title: "Total Points",
        dataIndex: "total",
        key: "total",
        align: "center",
      },
    ];
    

  return (
    <div
      style={{
        padding: isMobile ? "10px" : "90px",
        backgroundColor: "#fff",
        minHeight: "100vh",
      }}
    >
      {!isMobile && (
        <h2 style={{ textAlign: "center", marginBottom: 30 }}>
          🏆 Nation Performance Standings ({viewMode.toUpperCase()}) 🏆
        </h2>
      )}

      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <Select disabled style={{ width: 200, marginRight: 30 }} value="weekly">
          <Option value="weekly">Weekly</Option>
        </Select>
        <Select disabled style={{ width: 160 }} value="Disabled">
          <Option value="Disabled">Disabled</Option>
        </Select>
      </div>


      {topNation.topWeek && (
        <div style={{ marginBottom: 20, textAlign: "center" }}>
          <Tag color="blue">Week Leader: {topNation.topWeek}</Tag>
          <Tag color="purple">Month Leader: {topNation.topMonth}</Tag>
          <Tag color="green">Year Leader: {topNation.topYear}</Tag>
        </div>
      )}

      <Table
        dataSource={rankedData}
        columns={columns}
        pagination={false}
        bordered
        rowClassName={(r) => (r.rank === 1 ? "first-place" : "")}
        scroll={{ x: true }}
      />

      <Modal
        title={`Capture Attendance - ${selectedNation}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={form.submit}
      >
        <Form form={form} onFinish={() => { }} layout="vertical">
          {/* Future form implementation */}
        </Form>
      </Modal>
    </div>
  );
};

export default NationPerformance;
