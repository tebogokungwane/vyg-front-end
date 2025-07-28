// src/pages/BarChartPage.js

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
import axios from "../utils/axios";
import { Select, Row, Tabs, Radio, Card, message } from "antd";
import UserContext from "../context/UserContext";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const { Option } = Select;

const COLORS = [
  "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40",
  "#8AC24A", "#EA5F89", "#00BFFF", "#FFD700", "#32CD32", "#BA55D3",
];

const BarChartPage = () => {
  const { user } = useContext(UserContext);
  const [chartData, setChartData] = useState(null);
  const [data, setData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);
  const [timeView, setTimeView] = useState("yearly");
  const [metric, setMetric] = useState("points");

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.address?.id) {
        message.error("User address ID not found.");
        return;
      }

      try {
        const res = await axios.get(
          `/api/nation-stats/address/${user.address.id}`
        );
        setData(res.data);

        const uniqueYears = [...new Set(res.data.map((item) => item.year))]
          .filter((year) => year !== undefined && year !== null)
          .sort((a, b) => b - a);

        const uniqueMonths = [...new Set(res.data.map((item) => item.month))]
          .filter((month) => month !== undefined && month !== null)
          .sort((a, b) => b - a);

        setYears(uniqueYears);
        setMonths(uniqueMonths);

        if (uniqueYears.length > 0) setSelectedYear(uniqueYears[0]);
        if (uniqueMonths.length > 0) setSelectedMonth(uniqueMonths[0]);
      } catch (err) {
        console.error("Error fetching nation data:", err);
        message.error("Failed to load bar chart data.");
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    if (!data.length) return;

    let filtered = [...data];
    if (timeView === "yearly" && selectedYear) {
      filtered = filtered.filter((item) => item.year === selectedYear);
    } else if (timeView === "monthly" && selectedMonth) {
      filtered = filtered.filter((item) => item.month === selectedMonth);
    }

    const nationData = {};
    filtered.forEach((item) => {
      const nation = item.nation?.nation || item.nation; // handle both object and string
      if (!nation) return;

      if (!nationData[nation]) {
        nationData[nation] = { points: 0, people: 0 };
      }

      nationData[nation].points += item.totalPoints || 0;
      nationData[nation].people += item.totalMembers || 0;
    });

    const labels = Object.keys(nationData);
    const values = labels.map((nation) => nationData[nation][metric]);

    const backgroundColors = labels.map((_, i) => COLORS[i % COLORS.length]);

    setChartData({
      labels,
      datasets: [
        {
          label: metric === "points" ? "Total Points" : "Total Members",
          data: values,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors,
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    });
  }, [data, selectedYear, selectedMonth, timeView, metric]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: { size: 14 },
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y}`;
          },
        },
      },
      title: {
        display: true,
        text: `${timeView === "yearly" ? "Yearly" : "Monthly"} Performance (${metric === "points" ? "Points" : "Members"})`,
        font: { size: 18, weight: "bold" },
        padding: { top: 10, bottom: 20 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: metric === "points" ? "Points Earned" : "Number of Members",
          font: { size: 14, weight: "bold" },
        },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
<div style={{ padding: "60px 20px 24px", maxWidth: "100vw" }}>
{/* <h2 style={{
        textAlign: "center",
        marginBottom: "24px",
        fontSize: "24px",
        fontWeight: "600",
      }}>
        📋 Nation Performance Comparison
      </h2> */}

      <Row justify="center" style={{ marginBottom: "24px" }}>
        <Radio.Group
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
          buttonStyle="solid"
          size="large"
        >
          <Radio.Button value="points">Points</Radio.Button>
          <Radio.Button value="people">Members</Radio.Button>
        </Radio.Group>
      </Row>

      <Tabs
        activeKey={timeView}
        onChange={setTimeView}
        centered
        size="large"
        items={[
          { key: "yearly", label: "Yearly View" },
          { key: "monthly", label: "Monthly View" },
        ]}
        style={{ marginBottom: "24px" }}
      />

      <Row justify="center" style={{ marginBottom: "24px" }}>
        {timeView === "yearly" ? (
          <Select
            value={selectedYear}
            onChange={setSelectedYear}
            style={{ width: 200 }}
            size="large"
          >
            {years.map((year) => (
              <Option key={`year-${year}`} value={year}>
                {year}
              </Option>
            ))}
          </Select>
        ) : (
          <Select
            value={selectedMonth}
            onChange={setSelectedMonth}
            style={{ width: 200 }}
            size="large"
          >
            {months.map((month) => (
              <Option key={`month-${month}`} value={month}>
                Month {month}
              </Option>
            ))}
          </Select>
        )}
      </Row>

      <Card
        style={{
          height: "70vh",
          minHeight: "600px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          borderRadius: "12px",
        }}
        styles={{
          body: {
            padding: "24px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          },
        }}
        variant="outlined"
      >
        {chartData ? (
          <div style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            width: "100%",
          }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        ) : (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            color: "gray",
            fontSize: "16px",
          }}>
            {data.length ? "Loading chart data..." : "No data available"}
          </div>
        )}
      </Card>
    </div>
  );
};

export default BarChartPage;
