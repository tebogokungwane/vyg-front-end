import React, { useEffect, useState, useContext } from "react";
import { Table, Select, Card, Row, Col, message } from "antd";
import { TrophyOutlined } from "@ant-design/icons";
import axios from "axios";
import UserContext from "../context/UserContext";

const { Option } = Select;

const NationPoints = () => {
  const [data, setData] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedNation, setSelectedNation] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchNationPoints = async () => {
      if (!user?.address?.id) {
        message.error("User address ID not found.");
        return;
      }

      try {
        const res = await axios.get(
          `http://localhost:2025/api/points/summary/address/${user.address.id}`
        );
        const results = res.data;
        setData(results);

        if (results.length > 0) {
          setSelectedWeek(results[0].weekNumber);
          setSelectedMonth(results[0].month);
          setSelectedYear(results[0].year);
        }
      } catch (err) {
        console.error("Error fetching nation points:", err);
        message.error("Failed to load nation points");
      }
    };

    fetchNationPoints();
  }, [user]);

  useEffect(() => {
    let filtered = data;

    if (selectedWeek) {
      filtered = filtered.filter((item) => item.weekNumber === selectedWeek);
    }
    if (selectedMonth) {
      filtered = filtered.filter((item) => item.month === selectedMonth);
    }
    if (selectedYear) {
      filtered = filtered.filter((item) => item.year === selectedYear);
    }
    if (selectedNation) {
      filtered = filtered.filter((item) => item.nation.nation === selectedNation);
    }

    filtered.sort((a, b) => b.totalPointsEarnedPerWeek - a.totalPointsEarnedPerWeek);
    setFilteredData(filtered);
  }, [selectedWeek, selectedMonth, selectedYear, selectedNation, data]);

  const uniqueWeeks = [...new Set(data.map((item) => item.weekNumber))];
  const uniqueMonths = [...new Set(data.map((item) => item.month))];
  const uniqueYears = [...new Set(data.map((item) => item.year))];
  const uniqueNations = [...new Set(data.map((item) => item.nation.nation))];

  const topNation = filteredData.length > 0 ? filteredData[0].nation.nation : null;

  const columns = [
    {
      title: "#",
      dataIndex: "rank",
      render: (_, __, index) => (
        <span>
          {index === 0 ? (
            <TrophyOutlined style={{ color: "gold", fontSize: 20 }} />
          ) : null}{" "}
          {index + 1}
        </span>
      ),
    },
    {
      title: "Nation",
      dataIndex: ["nation", "nation"],
    },
    {
      title: "Event",
      dataIndex: ["baseEvent", "name"],
    },
    {
      title: "Points per Person",
      dataIndex: "points",
      align: "center",
    },
    {
      title: "Number of People",
      dataIndex: "numberOfPeople",
      align: "center",
    },
    {
      title: "Total Earned (This Event)",
      dataIndex: "totalPointsEarnedPerWeek",
      align: "center",
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>📊 Nation Event Performance Overview</h2>

      <Row gutter={16} justify="center" style={{ marginBottom: 16 }}>
        <Col>
          <Select
            value={selectedWeek}
            onChange={setSelectedWeek}
            placeholder="Select Week"
            style={{ width: 120 }}
            allowClear
          >
            {uniqueWeeks.map((week) => (
              <Option key={week} value={week}>
                Week {week}
              </Option>
            ))}
          </Select>
        </Col>
        <Col>
          <Select
            value={selectedMonth}
            onChange={setSelectedMonth}
            placeholder="Select Month"
            style={{ width: 150 }}
            allowClear
          >
            {uniqueMonths.map((month) => (
              <Option key={month} value={month}>
                Month {month}
              </Option>
            ))}
          </Select>
        </Col>
        <Col>
          <Select
            value={selectedYear}
            onChange={setSelectedYear}
            placeholder="Select Year"
            style={{ width: 120 }}
            allowClear
          >
            {uniqueYears.map((year) => (
              <Option key={year} value={year}>
                {year}
              </Option>
            ))}
          </Select>
        </Col>
        <Col>
          <Select
            value={selectedNation}
            onChange={setSelectedNation}
            placeholder="Filter by Nation"
            style={{ width: 160 }}
            allowClear
          >
            {uniqueNations.map((nation) => (
              <Option key={nation} value={nation}>
                {nation}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      {topNation && (
        <Card
          style={{
            marginBottom: 20,
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "18px",
          }}
        >
        </Card>
      )}

      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        bordered
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default NationPoints;
