import React, { useState, useRef } from "react";
import { Input, List, Tag, Typography, Spin } from "antd";
import {
  EnvironmentOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

/**
 * LocationPicker — Uber-style address search bar
 *
 * Uses Photon (free OpenStreetMap geocoder by Komoot) for instant autocomplete.
 * Fast, free, no API key needed. Biased to South Africa.
 *
 * Props:
 * - onLocationSelect(lat, lng, displayAddress) — called when user picks an address
 * - placeholder — optional custom placeholder text
 * - style — optional container style
 */
const LocationPicker = ({ onLocationSelect, placeholder, style = {} }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  /**
   * Format a Photon result into a readable address
   */
  const formatAddress = (properties) => {
    const parts = [];
    if (properties.housenumber) parts.push(properties.housenumber);
    if (properties.street) parts.push(properties.street);
    if (properties.district) parts.push(properties.district);
    if (properties.city) parts.push(properties.city);
    else if (properties.county) parts.push(properties.county);
    if (properties.state) parts.push(properties.state);
    return parts.join(", ") || properties.name || "Unknown location";
  };

  /**
   * Get a short label (primary text) for the result
   */
  const getLabel = (properties) => {
    if (properties.name && properties.name !== properties.street) {
      return properties.name;
    }
    if (properties.housenumber && properties.street) {
      return `${properties.housenumber} ${properties.street}`;
    }
    return properties.street || properties.district || properties.city || properties.name || "";
  };

  /**
   * Get secondary text (suburb, city)
   */
  const getSubLabel = (properties) => {
    const parts = [];
    if (properties.district && properties.district !== getLabel(properties)) {
      parts.push(properties.district);
    }
    if (properties.city && properties.city !== properties.district) {
      parts.push(properties.city);
    }
    if (properties.state) parts.push(properties.state);
    return parts.join(", ");
  };

  /**
   * Search addresses using Photon (OpenStreetMap geocoder)
   * Biased to South Africa (lat/lon of Johannesburg)
   */
  const searchAddress = (value) => {
    setQuery(value);
    setConfirmed(false);

    if (!value || value.trim().length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    // Debounce 300ms
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const encoded = encodeURIComponent(value.trim());
        // Photon API — biased to South Africa (Johannesburg coordinates)
        const res = await fetch(
          `https://photon.komoot.io/api/?q=${encoded}&limit=6&lat=-26.2041&lon=28.0473&lang=en`
        );
        const data = await res.json();

        if (data.features && data.features.length > 0) {
          // Filter to prioritize South African results
          const saResults = data.features.filter(
            (f) => f.properties.country === "South Africa"
          );
          const finalResults = saResults.length > 0 ? saResults : data.features;

          setResults(
            finalResults.slice(0, 5).map((feature) => ({
              lat: feature.geometry.coordinates[1],
              lng: feature.geometry.coordinates[0],
              label: getLabel(feature.properties),
              subLabel: getSubLabel(feature.properties),
              fullAddress: formatAddress(feature.properties),
              type: feature.properties.osm_value || feature.properties.type || "",
            }))
          );
          setShowDropdown(true);
        } else {
          setResults([]);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Geocoding error:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSelect = (result) => {
    setQuery(result.fullAddress);
    setSelectedAddress(result.fullAddress);
    setLat(result.lat);
    setLng(result.lng);
    setConfirmed(true);
    setShowDropdown(false);
    setResults([]);
    onLocationSelect(result.lat, result.lng, result.fullAddress);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setConfirmed(false);
    setSelectedAddress("");
    setLat(null);
    setLng(null);
    setShowDropdown(false);
  };

  return (
    <div ref={containerRef} style={{ position: "relative", ...style }}>
      {/* Search Input */}
      <Input
        size="large"
        placeholder={placeholder || "Search address (e.g. 12 Vilakazi St, Soweto)"}
        prefix={<EnvironmentOutlined style={{ color: confirmed ? "#52c41a" : "#bbb" }} />}
        suffix={
          loading ? (
            <Spin size="small" />
          ) : query ? (
            <CloseCircleOutlined
              style={{ color: "#bbb", cursor: "pointer" }}
              onClick={handleClear}
            />
          ) : null
        }
        value={query}
        onChange={(e) => searchAddress(e.target.value)}
        onFocus={() => {
          if (results.length > 0) setShowDropdown(true);
        }}
        onBlur={() => {
          // Delay to allow click on dropdown item
          setTimeout(() => setShowDropdown(false), 200);
        }}
        style={{
          borderRadius: 10,
          borderColor: confirmed ? "#52c41a" : undefined,
          boxShadow: showDropdown ? "0 2px 8px rgba(0,0,0,0.1)" : undefined,
        }}
      />

      {/* Dropdown Results */}
      {showDropdown && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 1050,
            background: "#fff",
            borderRadius: "0 0 10px 10px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            maxHeight: 280,
            overflowY: "auto",
            border: "1px solid #f0f0f0",
            borderTop: "none",
          }}
        >
          {results.length === 0 && !loading && query.length >= 3 && (
            <div style={{ padding: "16px", textAlign: "center", color: "#999", fontSize: 13 }}>
              No addresses found. Try a different search.
            </div>
          )}

          {results.map((result, index) => (
            <div
              key={index}
              onMouseDown={() => handleSelect(result)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                cursor: "pointer",
                borderBottom: index < results.length - 1 ? "1px solid #f5f5f5" : "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f6f6f6")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#f0f5ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <EnvironmentOutlined style={{ color: "#1890ff", fontSize: 14 }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#1a1a1a",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {result.label}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#888",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {result.subLabel}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmed Badge */}
      {confirmed && lat && lng && (
        <div
          style={{
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <CheckCircleOutlined style={{ color: "#52c41a" }} />
          <Text style={{ fontSize: 12, color: "#52c41a" }}>Location set</Text>
          <Tag color="blue" style={{ fontSize: 11 }}>
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </Tag>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
