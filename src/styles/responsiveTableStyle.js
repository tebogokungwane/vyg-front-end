// responsiveTableStyle.js
export const injectResponsiveStyles = () => {
    const style = document.createElement("style");
    style.innerHTML = `
      @media (max-width: 600px) {
        .editable-row td {
          font-size: 12px !important;
          padding: 6px !important;
        }
  
        .ant-modal {
          width: 95% !important;
        }
  
        .ant-table {
          font-size: 12px !important;
        }
  
        .ant-input, .ant-select {
          font-size: 12px !important;
        }
      }
    `;
    document.head.appendChild(style);
  };
  