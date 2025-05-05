import React, { useEffect, useState, useContext } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import { Select, Row, Col, message } from "antd";
import UserContext from "../context/UserContext";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);
const { Option } = Select;

// Nation colors (same as in your PieChartPage)
const NATION_COLORS = {
  Explosion: "#f5222d",
  Flawless: "#1890ff",
  Impact: "#52c41a",
  Invincible: "#fa8c16",
  Revolution: "#722ed1",
  Unbeatable: "#13c2c2",
  Other: "#eb2f96"
};

const BarChartPage = () => {
  const { user } = useContext(UserContext);
  const [data, setData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [years, setYears] = useState([]);
  const [displayMode, setDisplayMode] = useState("points"); // "points" or "people"
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Update mobile state on resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch performance data
  useEffect(() => {
    const fetchPoints = async () => {
      if (!user?.address?.id) {
        message.error("User address ID not found.");
        return;
      }
      try {
        const res = await axios.get(
          `http://localhost:2025/api/points/summary/address/${user.address.id}`
        );
        setData(res.data);

        const uniqueYears = [...new Set(res.data.map((item) => item.year))];
        setYears(uniqueYears);
        if (uniqueYears.length > 0) {
          setSelectedYear(uniqueYears[0]);
        }
      } catch (err) {
        console.error("Error loading bar chart data:", err);
        message.error("Failed to fetch bar chart data.");
      }
    };
    fetchPoints();
  }, [user]);

  // Process data for the chart
  useEffect(() => {
    if (!selectedYear || !displayMode) return;

    const filtered = data.filter((d) => d.year === selectedYear);
    const nationData = {};

    filtered.forEach((item) => {
      const nation = item.nation.nation;
      if (!nationData[nation]) {
        nationData[nation] = { points: 0, people: 0 };
      }
      nationData[nation].points += item.totalPointsEarnedPerWeek;
      nationData[nation].people += item.numberOfPeople;
    });

    const labels = Object.keys(nationData);
    const values = labels.map((nation) => nationData[nation][displayMode]);
    const backgroundColors = labels.map(
      (nation) => NATION_COLORS[nation] || NATION_COLORS.Other
    );

    setChartData({
      labels,
      datasets: [
        {
          label: displayMode === "points" ? "Total Points" : "Total People",
          data: values,
          backgroundColor: backgroundColors,
        },
      ],
    });
  }, [selectedYear, displayMode, data]);

  // Define chart options – these are responsive
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${context.formattedValue}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: displayMode === "points" ? "Points" : "People",
        },
      },
    },
  };

  // Determine container styles based on screen size
  const containerStyle = isMobile
    ? { width: "90%", height: "300px", margin: "0 auto" }
    : { width: "80%", maxWidth: "800px", height: "500px", margin: "0 auto" };

  return (
    <div style={{ padding: "30px", textAlign: "center" }}>
      <h2 style={{ marginBottom: "20px" }}>📊 Nation Performance Bar Chart</h2>

      <Row gutter={16} justify="center" style={{ marginBottom: 20 }}>
        <Col>
          <Select
            placeholder="Select Year"
            value={selectedYear}
            onChange={setSelectedYear}
            style={{ width: 150 }}
          >
            {years.map((y) => (
              <Option key={y} value={y}>
                {y}
              </Option>
            ))}
          </Select>
        </Col>
        <Col>
          <Select
            placeholder="Display"
            value={displayMode}
            onChange={setDisplayMode}
            style={{ width: 200 }}
          >
            <Option value="points">Show Total Points</Option>
            <Option value="people">Show Number of People</Option>
          </Select>
        </Col>
      </Row>

      {chartData ? (
        <div style={containerStyle}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      ) : (
        <p style={{ color: "gray" }}>No data to display</p>
      )}
    </div>
  );
};

export default BarChartPage;
