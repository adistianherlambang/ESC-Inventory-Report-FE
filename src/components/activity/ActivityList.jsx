// components/activity/ActivityList.jsx

import ActivityItem from "./ActivityItem";
import styles from "../../page/pmt/style.module.css";
import { ActivityIcon } from "../Icon/Icon";
import { useEffect, useState } from "react";

import { userStore } from "../../state/state";

export default function ActivityList({
  date,
  dateFiltered,
  outflow,
  formatRupiah,
  handleEdit,
  handleDelete,
  handleEditAcc,
  handleDeleteAcc,
  total,
}) {

  const [outflowFiltered, setOutflowFiltered] = useState([])
  const {currentUser} = userStore()

  if (currentUser.role == "fl") {
    useEffect(() => {
      if (!outflow.length) return

      const now = new Date()
      const today =
        now.getFullYear() +
        "-" +
        String(now.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(now.getDate()).padStart(2, "0")

      const filtered = outflow.filter((item) => {
        if (!item.createdAt?.toDate) return false

        const d = item.createdAt.toDate()
        const ymd =
          d.getFullYear() +
          "-" +
          String(d.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(d.getDate()).padStart(2, "0")

        return ymd === today
      })

      setOutflowFiltered(filtered)
    }, [outflow]) 
  }

  return (
    <div className={styles.activityContainer}>
      <div className={styles.activityTitleContainer}>
        <div className={styles.activityTitleWrapper}>
          <p className={styles.activityTitle}>Activity</p>
          <p className={styles.date}>{date}</p>
        </div>
        <ActivityIcon />
      </div>

      <div className={styles.activityWrapper}>
        {dateFiltered.map((item) => (
          <div key={item.id} className={styles.activityWrapper}>
            {item.report.map((i) => (
              <ActivityItem
                key={i.id}
                item={item}
                i={i}
                formatRupiah={formatRupiah}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                handleDeleteAcc={handleDeleteAcc}
                handleEditAcc={handleEditAcc}
              />
            ))}
          </div>
        ))}
        {outflowFiltered.map((item) => (
          <div key={item.id} className={styles.activity} style={{backgroundColor: "#d9d9d9ff"}}>
            <div style={{display: "flex", justifyContent: "space-between"}}>
              <p>{item.desc}</p>
              <div style={{backgroundColor: "#DA0909", color: "white", padding: "4px 12px", borderRadius: "1rem"}}>Pengeluaran</div>
            </div>
  
            <div className={styles.totalPriceContainer}>
              <p>Total :</p>
              <p>{formatRupiah(item.amount)}</p>
            </div>

            <div className={styles.buttonContainer}>
              <div className={styles.deleteButton}
              onClick={() => handleDeleteAcc({
                id: item.id,
                type: "outflow"
              })}
              >Hapus</div>
            </div>
          </div>
        ))}
      </div>
      
      <p className={styles.activityTitle}>
        <span style={{ color: "#B0B0B0" }}>Total: </span>
        {total}
      </p>
    </div>
  );
}
