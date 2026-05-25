import React, { useState, useEffect } from "react";
import { Upload, Button, Alert, Card, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "../utils/axios";

const UploadLogo = () => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(true);

  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    // Load current logo on mount
    setLogoUrl(`${BASE_URL}/api/branding/logo?t=${Date.now()}`);
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
      showError("Please select a logo image to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileList[0]);

    setUploading(true);
    try {
      await axios.post("/api/branding/logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showSuccess("Logo uploaded successfully!");
      setFileList([]);
      // Refresh preview
      setLogoUrl(`${BASE_URL}/api/branding/logo?t=${Date.now()}`);
      // Notify Header to refresh the logo
      window.dispatchEvent(new Event("logo-updated"));
    } catch (error) {
      console.error("Logo upload error:", error);
      showError("Failed to upload logo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        showError("You can only upload image files (PNG, JPG, SVG, etc.).");
        return Upload.LIST_IGNORE;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        showError("Image must be smaller than 5MB.");
        return Upload.LIST_IGNORE;
      }
      setFileList([file]);
      return false; // Prevent auto upload
    },
    fileList,
    onRemove: () => setFileList([]),
    maxCount: 1,
    accept: "image/*",
  };

  return (
    <div style={{ padding: "24px", maxWidth: 600, margin: "0 auto" }}>
      <Card title="Upload Logo" bordered>
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
          <h4 style={{ marginBottom: 8 }}>Current Logo</h4>
          {loadingPreview ? (
            <Spin />
          ) : (
            <img
              src={logoUrl}
              alt="Current Logo"
              style={{
                maxWidth: "100%",
                maxHeight: 150,
                objectFit: "contain",
                border: "1px solid #d9d9d9",
                borderRadius: 8,
                padding: 8,
                background: "#fafafa",
              }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          )}
        </div>

        <Upload {...uploadProps} listType="picture">
          <Button icon={<UploadOutlined />}>Select Logo Image</Button>
        </Upload>

        <Button
          type="primary"
          onClick={handleUpload}
          loading={uploading}
          disabled={fileList.length === 0}
          style={{ marginTop: 16 }}
        >
          {uploading ? "Uploading..." : "Upload Logo"}
        </Button>
      </Card>
    </div>
  );
};

export default UploadLogo;
