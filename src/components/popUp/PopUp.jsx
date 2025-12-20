import { useEffect, useRef } from "react";
import { userStore } from "../../state/state";

export default function StockPopup({ children }) {
  const popupRef = useRef(null);
  const stock = userStore((state) => state.stock)
  const toogleStockDeact = userStore((state) => state.toogleStockDeact)

  useEffect(() => {
    if (!stock) return;

    const handleOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        toogleStockDeact();
      }
    };

    document.addEventListener("pointerdown", handleOutside);
    return () => {
      document.removeEventListener("pointerdown", handleOutside);
    };
  }, [stock, toogleStockDeact]);

  if (!stock) return null;

  return (
    <div
      ref={popupRef}
      style={{
        position: "fixed",
        height: "fit-content",
        width: "fit-content"
      }}
    >
      {children}
    </div>
  );
}