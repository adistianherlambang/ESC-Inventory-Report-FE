// components/activity/ActivityList.jsx

import ActivityItem from "./ActivityItem";
import styles from "../../page/pmt/style.module.css";
import { ActivityIcon } from "../Icon/Icon";

export default function ActivityList({
  date,
  dateFiltered,
  formatRupiah,
  handleEdit,
  handleDelete,
  handleEditAcc,
  handleDeleteAcc,
  total: allTotal
}) {
  return (
    <div className={styles.activityContainer}>
      <div className={styles.activityTitleContainer}>
        <div className={styles.activityTitleWrapper}>
          <p className={styles.activityTitle}>Activity</p>
          <p className={styles.date}>{date}</p>
        </div>
        <ActivityIcon />
      </div>

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
    </div>
  );
}
