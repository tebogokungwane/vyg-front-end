import { OrbitProgress } from "react-loading-indicators";
import vygLogo from "../images/vyg.jpg";

const VygLoader = () => {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      background: "rgba(255, 255, 255, 0.95)",
      gap: 24,
    }}>
      <img
        src={vygLogo}
        alt="VYG"
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          objectFit: "cover",
          boxShadow: "0 4px 20px rgba(24, 144, 255, 0.15)",
        }}
      />
      <OrbitProgress color="#1890ff" size="small" />
    </div>
  );
};

export default VygLoader;
