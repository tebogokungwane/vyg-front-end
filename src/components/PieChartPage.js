import React, { useEffect, useState, useContext } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Select, Row, Col, message } from "antd";
import axios from "axios";
import UserContext from "../context/UserContext";

ChartJS.register(ArcElement, Tooltip, Legend);
const { Option } = Select;

const NATION_COLORS = {
  Explosion: "#f5222d",
  Flawless: "#1890ff",
  Impact: "#52c41a",
  Invincible: "#fa8c16",
  Revolution: "#722ed1",
  Unbeatable: "#13c2c2",
  Other: "#eb2f96"
};

const PieChartPage = () => {
  const { user } = useContext(UserContext);
  const [data, setData] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [viewMode, setViewMode] = useState("week");
  const [chartData, setChartData] = useState(null);

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
        setData(res.data);

        if (res.data.length > 0) {
          setSelectedWeek(res.data[0].weekNumber);
          setSelectedMonth(res.data[0].month);
          setSelectedYear(res.data[0].year);
        }
      } catch (err) {
        console.error("Error fetching nation points:", err);
        message.error("Failed to load performance data");
      }
    };
    fetchNationPoints();
  }, [user]);

  useEffect(() => {
    if (!selectedYear) return;

    let filtered = data;

    if (viewMode === "week" && selectedWeek && selectedMonth) {
      filtered = data.filter(
        (item) =>
          item.weekNumber === selectedWeek &&
          item.month === selectedMonth &&
          item.year === selectedYear
      );
    } else if (viewMode === "month" && selectedMonth) {
      filtered = data.filter(
        (item) => item.month === selectedMonth && item.year === selectedYear
      );
    } else if (viewMode === "year") {
      filtered = data.filter((item) => item.year === selectedYear);
    }

    const totals = {};
    filtered.forEach((item) => {
      const nation = item.nation.nation;
      if (!totals[nation]) {
        totals[nation] = 0;
      }
      totals[nation] += item.totalPointsEarnedPerWeek;
    });

    const labels = Object.keys(totals);
    const values = Object.values(totals);
    const backgroundColors = labels.map(
      (nation) => NATION_COLORS[nation] || NATION_COLORS.Other
    );

    setChartData({
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: backgroundColors,
          hoverOffset: 10
        }
      ]
    });
  }, [selectedWeek, selectedMonth, selectedYear, data, viewMode]);

  const uniqueWeeks = [...new Set(data.map((item) => item.weekNumber))];
  const uniqueMonths = [...new Set(data.map((item) => item.month))];
  const uniqueYears = [...new Set(data.map((item) => item.year))];

  // Define Chart.js options to disable aspect ratio
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return (
    <div style={{ padding: "80px", textAlign: "center" }}>
      <h2 style={{ marginBottom: "40px" }}>📊 Nation Performance - Pie Chart</h2>

      <Row gutter={16} justify="center" style={{ marginBottom: "20px" }}>
        <Col>
          <Select
            value={viewMode}
            onChange={setViewMode}
            style={{ width: 160 }}
          >
            <Option value="week">Per Week</Option>
            <Option value="month">Per Month</Option>
            <Option value="year">Per Year</Option>
          </Select>
        </Col>

        {viewMode !== "year" && (
          <Col>
            <Select
              placeholder="Select Month"
              value={selectedMonth}
              onChange={setSelectedMonth}
              style={{ width: 120 }}
            >
              {uniqueMonths.map((m) => (
                <Option key={m} value={m}>
                  Month {m}
                </Option>
              ))}
            </Select>
          </Col>
        )}

        {viewMode === "week" && (
          <Col>
            <Select
              placeholder="Select Week"
              value={selectedWeek}
              onChange={setSelectedWeek}
              style={{ width: 120 }}
            >
              {uniqueWeeks.map((w) => (
                <Option key={w} value={w}>
                  Week {w}
                </Option>
              ))}
            </Select>
          </Col>
        )}

        <Col>
          <Select
            placeholder="Select Year"
            value={selectedYear}
            onChange={setSelectedYear}
            style={{ width: 120 }}
          >
            {uniqueYears.map((y) => (
              <Option key={y} value={y}>
                {y}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      {chartData ? (
        <div
          style={{
            width: "60%",
            maxWidth: "600px",
            height: "400px", // Fixed height to avoid scrollbars
            margin: "0 auto",
          }}
        >
          <Pie data={chartData} options={chartOptions} />
        </div>
      ) : (
        <p style={{ color: "gray" }}>No data to display for selected filters.</p>
      )}
    </div>
  );
};

export default PieChartPage;
