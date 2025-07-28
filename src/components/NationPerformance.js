import React, { useState, useEffect, useContext } from "react";
import {
  Table,
  Select,
  Avatar,
  Spin,
  DatePicker,
  message,
} from "antd";
import { TrophyTwoTone } from "@ant-design/icons";
import axios from "../utils/axios";
import UserContext from "../context/UserContext";
import defaultImage from "../images/vyg.jpg";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isoWeek);

const { Option } = Select;
const baseURL = axios.defaults.baseURL;


const NationPerformance = () => {
  const [nationsInfo, setNationsInfo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("yearly");
  const [dateFilter, setDateFilter] = useState(dayjs());
  const { user } = useContext(UserContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchStandings = async () => {
      if (!user?.address?.id) return;

      setLoading(true);
      try {
        const year = dateFilter.year();
        const week = dateFilter.isoWeek();
        const month = dateFilter.month() + 1;

        const res = await axios.get(`/api/points/top-performance/address/${user.address.id}`, {
          params: {
            viewMode,
            week,
            month,
            year,
          },
        });

        const nationsRes = await axios.get(`/api/nations`);

        const enriched = res.data.map((stat) => {
          const match = nationsRes.data.find((n) => n.nation === stat.nation);
          return {
            ...stat,
            logo: match?.imageName
            ? `${axios.defaults.baseURL}/api/nations/${match.id}/image`
            : defaultImage,
          
          };
        });

        const sorted = enriched
          .sort((a, b) => b.totalPoints - a.totalPoints)
          .map((row, index) => ({
            ...row,
            rank: index + 1,
            rankDisplay:
              index === 0 ? (
                <>
                  <TrophyTwoTone
                    twoToneColor="#FFD700"
                    style={{ fontSize: "20px", marginRight: 5 }}
                  />
                  {index + 1}
                </>
              ) : (
                index + 1
              ),
          }));

        setNationsInfo(sorted);
      } catch (err) {
        console.error("Failed to fetch standings", err);
        message.error("Failed to load nation performance.");
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, [user, viewMode, dateFilter]);

  const columns = [
    {
      title: "#",
      dataIndex: "rankDisplay",
      key: "rank",
      align: "center",
    },
    {
      title: "Nation",
      dataIndex: "nation",
      key: "nation",
      render: (text, record) => (
        <span>
          <Avatar
            src={record.logo}
            onError={() => {
              const updated = nationsInfo.map((n) =>
                n.nation === record.nation ? { ...n, logo: defaultImage } : n
              );
              setNationsInfo(updated);
            }}
            style={{ marginRight: 4 }}
          />
          {text}
        </span>
      ),
    },
    {
      title: "Total Points",
      dataIndex: "totalPoints",
      key: "totalPoints",
      align: "center",
    },
  ];

  const getPickerType = () => {
    if (viewMode === "weekly") return "week";
    if (viewMode === "monthly") return "month";
    if (viewMode === "yearly") return "year";
    return "date";
  };

  const getFormat = () => {
    if (viewMode === "weekly") return "YYYY-[W]WW";
    if (viewMode === "monthly") return "MMMM YYYY";
    if (viewMode === "yearly") return "YYYY";
    return "YYYY-MM-DD";
  };

  return (
    <div
      style={{
        padding: isMobile ? "10px" : "90px",
        backgroundColor: "#fff",
        minHeight: "100vh",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Select
          style={{ width: 160, marginRight: 10 }}
          value={viewMode}
          onChange={setViewMode}
        >
          <Option value="weekly">Weekly</Option>
          <Option value="monthly">Monthly</Option>
          <Option value="yearly">Yearly</Option>
        </Select>

        <DatePicker
          picker={getPickerType()}
          format={getFormat()}
          value={dateFilter}
          allowClear={false}
          onChange={(value) => {
            if (value) setDateFilter(value);
          }}
          onPanelChange={(value) => {
            if (value && viewMode !== "weekly") {
              setDateFilter(value);
            }
          }}
        />
      </div>

      <Table
        dataSource={nationsInfo}
        columns={columns}
        pagination={false}
        bordered
        rowClassName={(r) => (r.rank === 1 ? "first-place" : "")}
        scroll={{ x: true }}
        loading={loading}
        locale={{
          emptyText: loading ? "Loading data..." : "No nation data available",
        }}
      />
    </div>
  );
};

export default NationPerformance;
