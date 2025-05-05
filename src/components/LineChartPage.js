import React, { useEffect, useState, useContext } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import UserContext from "../context/UserContext";
import { message } from "antd";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const COLORS = [
  "#f5222d", "#1890ff", "#52c41a", "#fa8c16", "#722ed1", "#13c2c2", "#eb2f96",
  "#b37feb", "#ff85c0", "#ffc069", "#95de64", "#5cdbd3",
];

const LineChartPage = () => {
  const { user } = useContext(UserContext);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchWeeklyData = async () => {
      if (!user?.address?.id) {
        message.error("User address ID not found.");
        return;
      }

      try {
        const res = await axios.get(`http://localhost:2025/api/points/summary/address/${user.address.id}`);
        const data = res.data;

        // Group by nation and week
        const grouped = {};
        const allWeeks = new Set();

        data.forEach(item => {
          const nation = item.nation.nation;
          const week = item.weekNumber;
          allWeeks.add(week);

          if (!grouped[nation]) {
            grouped[nation] = {};
          }

          grouped[nation][week] = (grouped[nation][week] || 0) + item.totalPointsEarnedPerWeek;
        });

        const sortedWeeks = Array.from(allWeeks).sort((a, b) => a - b);
        const weekLabels = sortedWeeks.map(w => `Week ${w}`);

        const datasets = Object.entries(grouped).map(([nation, weekData], index) => {
          const color = COLORS[index % COLORS.length];
          return {
            label: nation,
            data: sortedWeeks.map(week => weekData[week] || 0),
            borderColor: color,
            tension: 0.4,
            fill: false,
          };
        });

        setChartData({
          labels: weekLabels,
          datasets,
        });
      } catch (err) {
        console.error("Error fetching weekly nation data:", err);
        message.error("Failed to load line chart data.");
      }
    };

    fetchWeeklyData();
  }, [user]);

  return (
    <div style={{ width: "80%", margin: "auto", padding: "30px 0" }}>
      <h2 style={{ textAlign: "center" }}>📈 Weekly Nation Performance - Line Chart</h2>
      {chartData ? (
        <Line data={chartData} />
      ) : (
        <p style={{ textAlign: "center", color: "gray" }}>Loading chart...</p>
      )}
    </div>
  );
};

export default LineChartPage;
