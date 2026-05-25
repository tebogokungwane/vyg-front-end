import React, { useState, useEffect } from "react";
import { Card, Switch, Typography } from "antd";
import { BulbOutlined, BulbFilled } from "@ant-design/icons";

const { Title, Text } = Typography;

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    applyTheme(isDark);
  }, [isDark]);

  const applyTheme = (dark) => {
    if (dark) {
      document.body.classList.add("dark-theme");
      document.body.classList.remove("light-theme");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.add("light-theme");
      document.body.classList.remove("dark-theme");
      localStorage.setItem("theme", "light");
    }
    window.dispatchEvent(new Event("theme-changed"));
  };

  const handleToggle = (checked) => {
    setIsDark(checked);
  };

  return (
    <div style={{ padding: "24px", maxWidth: 500, margin: "0 auto" }}>
      <Card bordered>
        <div style={{ textAlign: "center" }}>
          <Title level={3}>
            {isDark ? <BulbFilled style={{ color: "#faad14" }} /> : <BulbOutlined />}{" "}
            Theme Settings
          </Title>
          <Text type="secondary" style={{ display: "block", marginBottom: 24 }}>
            Switch between light and dark mode
          </Text>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              padding: "20px",
              borderRadius: 12,
              background: isDark ? "#1f1f1f" : "#f5f5f5",
              transition: "all 0.3s ease",
            }}
          >
            <BulbOutlined style={{ fontSize: 24, color: isDark ? "#666" : "#faad14" }} />
            <Switch
              checked={isDark}
              onChange={handleToggle}
              checkedChildren="Dark"
              unCheckedChildren="Light"
              style={{ minWidth: 70 }}
            />
            <BulbFilled style={{ fontSize: 24, color: isDark ? "#faad14" : "#666" }} />
          </div>

          <Text
            style={{
              display: "block",
              marginTop: 16,
              fontSize: 14,
              color: isDark ? "#aaa" : "#666",
            }}
          >
            Currently using: <strong>{isDark ? "Dark" : "Light"}</strong> mode
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default ThemeToggle;
