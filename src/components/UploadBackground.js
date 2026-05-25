import React, { useState, useEffect } from "react";
import { Upload, Button, Alert, Card, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "../utils/axios";

const UploadBackground = () => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [bgUrl, setBgUrl] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(true);

  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    setBgUrl(`${BASE_URL}/api/branding/background?t=${Date.now()}`);
    setLoadingPreview(false);
  }, []);

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const showError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 4000);
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      showError("Please select a background image to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileList[0]);

    setUploading(true);
    try {
      await axios.post("/api/branding/background", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showSuccess("Background image uploaded successfully!");
      setFileList([]);
      setBgUrl(`${BASE_URL}/api/branding/background?t=${Date.now()}`);
      window.dispatchEvent(new Event("background-updated"));
    } catch (error) {
      console.error("Background upload error:", error);
      showError("Failed to upload background image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        showError("You can only upload image files (PNG, JPG, etc.).");
        return Upload.LIST_IGNORE;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        showError("Image must be smaller than 10MB.");
        return Upload.LIST_IGNORE;
      }
      setFileList([file]);
      return false;
    },
    fileList,
    onRemove: () => setFileList([]),
    maxCount: 1,
    accept: "image/*",
  };

  return (
    <div style={{ padding: "24px", maxWidth: 600, margin: "0 auto" }}>
      <Card title="Upload Background Image" bordered>
        {successMessage && (
          <Alert
            message={successMessage}
            type="success"
            showIcon
            closable
            style={{ marginBottom: 16 }}
          />
        )}
        {errorMessage && (
          <Alert
            message={errorMessage}
            type="error"
            showIcon
            closable
            style={{ marginBottom: 16 }}
          />
        )}

        <div style={{ marginBottom: 24 }}>
          <h4 style={{ marginBottom: 8 }}>Current Background</h4>
          <p style={{ color: "#666", fontSize: 13, marginBottom: 12 }}>
            This image is used as the login screen background. If no image is uploaded, a default gradient is shown.
          </p>
          {loadingPreview ? (
            <Spin />
          ) : (
            <img
              src={bgUrl}
              alt="Current Background"
              style={{
                maxWidth: "100%",
                maxHeight: 200,
                objectFit: "cover",
                border: "1px solid #d9d9d9",
                borderRadius: 8,
                padding: 4,
                background: "#fafafa",
              }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          )}
        </div>

        <Upload {...uploadProps} listType="picture">
          <Button icon={<UploadOutlined />}>Select Background Image</Button>
        </Upload>

        <Button
          type="primary"
          onClick={handleUpload}
          loading={uploading}
          disabled={fileList.length === 0}
          style={{ marginTop: 16 }}
        >
          {uploading ? "Uploading..." : "Upload Background"}
        </Button>
      </Card>
    </div>
  );
};

export default UploadBackground;
