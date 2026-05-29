import React, { useState, useEffect } from "react";
import { Upload, Button, Alert, Card, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "../utils/axios";
import { validateFavicon } from "../utils/imageValidator";

const UploadFavicon = () => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [faviconUrl, setFaviconUrl] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(true);

  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    // Load current favicon on mount
    setFaviconUrl(`${BASE_URL}/api/branding/favicon?t=${Date.now()}`);
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
      showError("Please select a favicon image to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileList[0]);

    setUploading(true);
    try {
      await axios.post("/api/branding/favicon", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showSuccess("Favicon uploaded successfully!");
      setFileList([]);
      // Refresh preview
      const newUrl = `${BASE_URL}/api/branding/favicon?t=${Date.now()}`;
      setFaviconUrl(newUrl);
      // Update the browser favicon dynamically
      updateBrowserFavicon(newUrl);
    } catch (error) {
      console.error("Favicon upload error:", error);
      showError("Failed to upload favicon. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const updateBrowserFavicon = (url) => {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = url;
  };

  const uploadProps = {
    beforeUpload: async (file) => {
      const result = await validateFavicon(file);
      if (!result.valid) {
        showError(result.error);
        return Upload.LIST_IGNORE;
      }
      if (result.warning) {
        showError(result.warning); // Show as info
      }
      setFileList([file]);
      return false;
    },
    fileList,
    onRemove: () => setFileList([]),
    maxCount: 1,
    accept: "image/png,image/jpeg,image/x-icon,image/svg+xml,.ico",
  };

  return (
    <div style={{ padding: "24px", maxWidth: 600, margin: "0 auto" }}>
      <Card title="Upload Favicon" bordered>
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
          <h4 style={{ marginBottom: 8 }}>Current Favicon</h4>
          {loadingPreview ? (
            <Spin />
          ) : (
            <img
              src={faviconUrl}
              alt="Current Favicon"
              style={{
                width: 64,
                height: 64,
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
          <Button icon={<UploadOutlined />}>Select Favicon Image</Button>
        </Upload>

        <Button
          type="primary"
          onClick={handleUpload}
          loading={uploading}
          disabled={fileList.length === 0}
          style={{ marginTop: 16 }}
        >
          {uploading ? "Uploading..." : "Upload Favicon"}
        </Button>
      </Card>
    </div>
  );
};

export default UploadFavicon;
