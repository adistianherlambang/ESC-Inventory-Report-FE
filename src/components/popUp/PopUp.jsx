import { useState, useEffect } from "react";
import { pmtReport } from "../../state/state";
import userActivityLogic from "../../hooks/userActivityLogic";

export default function PopUp({ children, onClose }) {
  const { toogleStockDeact } = pmtReport();
  const { active, toogleDeact } = userActivityLogic()

  // Overlay click: call provided onClose, otherwise fallback to toogleStockDeact
  const handleOverlayClick = () => {
    if (typeof onClose === "function") {
      onClose();
    } else if (typeof toogleStockDeact === "function") {
      toogleStockDeact();
    }
  };

  return (
    <div>
      <div
        style={{
          zIndex: 1,
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: "100vw",
        }}
        onClick={handleOverlayClick}
      />
      {/* prevent overlay click when interacting with popup content */}
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}