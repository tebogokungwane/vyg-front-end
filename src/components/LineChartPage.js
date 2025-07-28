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
import axios from "../utils/axios";
import UserContext from "../context/UserContext";
import { message, Select, Row, Tabs, Radio, Card } from "antd";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);
const { Option } = Select;
const { TabPane } = Tabs;

const COLORS = [
  "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40",
  "#8AC24A", "#EA5F89", "#00BFFF", "#FFD700", "#32CD32", "#BA55D3",
];

const LineChartPage = () => {
  const { user } = useContext(UserContext);
  const [chartData, setChartData] = useState(null);
  const [data, setData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);
  const [timeView, setTimeView] = useState("weekly"); // 'weekly' or 'monthly'
  const [metric, setMetric] = useState("points"); // 'points' or 'people'

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.address?.id) {
        message.error("User address ID not found.");
        return;
      }

      try {
        const res = await axios.get(
          `/api/points/summary/address/${user.address.id}`
        );
        setData(res.data);

        const uniqueYears = [...new Set(res.data.map((item) => item.year))].sort((a, b) => b - a);
        const uniqueMonths = [...new Set(res.data.map((item) => item.month))].sort((a, b) => b - a);
        
        setYears(uniqueYears);
        setMonths(uniqueMonths);
        
        if (!selectedYear && uniqueYears.length > 0) {
          setSelectedYear(uniqueYears[0]);
        }
        if (!selectedMonth && uniqueMonths.length > 0) {
          setSelectedMonth(uniqueMonths[0]);
        }
      } catch (err) {
        console.error("Error fetching nation data:", err);
        message.error("Failed to load line chart data.");
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    if (!data.length) return;

    let filtered = [...data];
    let labels = [];
    const grouped = {};

    if (timeView === "weekly") {
      if (!selectedYear) return;
      filtered = filtered.filter((item) => item.year === selectedYear);
      
      const allWeeks = new Set(filtered.map(item => item.weekNumber));
      labels = Array.from(allWeeks).sort((a, b) => a - b).map(w => `Week ${w}`);
    } else {
      if (!selectedMonth) return;
      filtered = filtered.filter((item) => item.month === selectedMonth);
      
      const allWeeks = new Set(filtered.map(item => item.weekNumber));
      labels = Array.from(allWeeks).sort((a, b) => a - b).map(w => `Week ${w}`);
    }

    filtered.forEach((item) => {
      const nation = item.nation.nation;
      const timeKey = timeView === "weekly" ? item.weekNumber : item.weekNumber;
      
      if (!grouped[nation]) {
        grouped[nation] = {};
      }

      const value = metric === "points" ? item.totalPointsEarnedPerWeek : item.numberOfPeople;
      grouped[nation][timeKey] = (grouped[nation][timeKey] || 0) + value;
    });

    const datasets = Object.entries(grouped).map(([nation, timeData], index) => {
      const color = COLORS[index % COLORS.length];
      return {
        label: nation,
        data: labels.map((_, i) => timeData[labels[i].split(" ")[1]] || 0),
        borderColor: color,
        backgroundColor: color,
        tension: 0.3,
        fill: false,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
      };
    });

    setChartData({
      labels,
      datasets,
    });
  }, [data, selectedYear, selectedMonth, timeView, metric]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 14,
            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
          },
          padding: 20,
          usePointStyle: true,
        }
      },
      tooltip: {
        bodyFont: {
          size: 14
        },
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value}`;
          }
        }
      },
      title: {
        display: true,
        text: '',
        font: {
          size: 18,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: metric === 'points' ? 'Points Earned' : 'Number of Members',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      }
    }
  };

  return (
<div style={{ padding: "60px 20px 24px", maxWidth: "100vw" }}>
{/* <h2 style={{ 
        textAlign: "center", 
        marginBottom: "24px",
        fontSize: '24px',
        fontWeight: '600',
        color: '#1a1a1a'
      }}>
        📈 Nation Performance Trends
      </h2> */}

      <Row justify="center" style={{ marginBottom: '24px' }}>
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
        style={{ 
          marginBottom: '24px',
          fontSize: '16px'
        }}
        tabBarStyle={{ fontWeight: '500' }}
      >
        <TabPane tab="Weekly View" key="weekly" />
        <TabPane tab="Monthly View" key="monthly" />
      </Tabs>

      <Row justify="center" style={{ marginBottom: '24px' }}>
        {timeView === "weekly" ? (
          <Select
            value={selectedYear}
            onChange={setSelectedYear}
            style={{ width: 200 }}
            size="large"
          >
            {years.map((year) => (
              <Option key={year} value={year}>
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
              <Option key={month} value={month}>
                Month {month}
              </Option>
            ))}
          </Select>
        )}
      </Row>

      <Card 
        bordered={false}
        style={{ 
          height: '70vh',
          minHeight: '600px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          borderRadius: '12px'
        }}
        bodyStyle={{ 
          padding: '24px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {chartData ? (
          <div style={{ 
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            width: '100%'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              maxWidth: '1000px',
              position: 'relative'
            }}>
              <Line 
                data={chartData} 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      ...chartOptions.plugins.title,
                      text: `${timeView === 'weekly' ? 'Weekly' : 'Monthly'} Performance Trends (${metric === 'points' ? 'Points' : 'Members'})`,
                    }
                  }
                }}
              />
            </div>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            color: 'gray',
            fontSize: '16px'
          }}>
            {data.length ? 'Loading chart data...' : 'No data available'}
          </div>
        )}
      </Card>
    </div>
  );
};

export default LineChartPage;