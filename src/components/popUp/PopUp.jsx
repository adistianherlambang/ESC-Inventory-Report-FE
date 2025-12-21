import { useState, useEffect } from "react";
import { pmtReport } from "../../state/state";

export default function PopUp({ children }) {

  const { stock, toogleStockActive, toogleStockDeact } = pmtReport();

  return(
    <div>
      {children}
      <div style={{
        zIndex: "1",
        position: "fixed",
        height: "100vh",
        width: "100vw",
        
      }} onClick={stock ? toogleStockDeact: null}></div>
    </div>
  )
}