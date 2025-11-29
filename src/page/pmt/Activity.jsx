import React from "react";
import styles from "./style.module.css";
import { ActivityIcon } from "../../components/Icon/Icon";

export default function Activity({
  dateFiltered,
  date,
  formatRupiah,
  handleEdit,
  handleDelete,
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
          {item.report.map((i, reportIndex) => {
            const totalAmount = i.price.reduce(
              (sum, item) => sum + item.amount,
              0,
            );
            return (
              <div
                key={`${item.id}-${reportIndex}-${i.product}`}
                className={styles.activity}
              >
                <div className={styles.productContainer}>
                  <p className={styles.productName}>{i.product}</p>
                  <div className={styles.productDetail}>
                    <p>Warna : {i.color}</p>
                    <p>Ukuran: {i.capacity}</p>
                  </div>
                </div>
                <div className={styles.priceContainer}>
                  {i.price.map((r, priceIndex) => (
                    <div
                      key={`${item.id}-${reportIndex}-${priceIndex}-${r.type}-${r.amount}`}
                      className={styles.price}
                    >
                      <p className={styles.priceAmount}>
                        {formatRupiah(r.amount)}
                      </p>
                      <p className={styles.type}>
                        {i.userType} {r.type}
                      </p>
                    </div>
                  ))}
                </div>
                <div className={styles.totalPriceContainer}>
                  <p>Total :</p>
                  <p>{formatRupiah(totalAmount)}</p>
                </div>
                <div className={styles.buttonContainer}>
                  <div
                    className={styles.editButton}
                    onClick={() => handleEdit({ id: item.id, imei: i.IMEI })}
                  >
                    Edit
                  </div>
                  <div
                    className={styles.deleteButton}
                    onClick={() =>
                      handleDelete({
                        id: item.id,
                        imei: i.IMEI,
                        product: i.product,
                        color: i.color,
                        capacity: i.capacity,
                        type: i.type,
                      })
                    }
                  >
                    Batalkan
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
