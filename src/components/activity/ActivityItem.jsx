import styles from "../../page/pmt/style.module.css";

export default function ActivityItem({
  item,
  i,
  id,
  formatRupiah,
  handleEdit,
  handleDelete,
  handleEditAcc,
  handleDeleteAcc
}) {
  const totalAmount = i.price.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div key={i.product}>
      {i.type === "acc" ? (
        <div className={styles.activity}>
          <p className={styles.productName}>{i.product}</p>

          {i.price.map((r) => (
            <div key={r.amount} className={styles.price}>
              <p className={styles.priceAmount}>{formatRupiah(r.amount)}</p>
              <p className={styles.type}>
                {i.userType} {r.type}
              </p>
            </div>
          ))}

          <div className={styles.totalPriceContainer}>
            <p>Total :</p>
            <p>{formatRupiah(totalAmount)}</p>
          </div>

          <div className={styles.buttonContainer}>
            <div
              className={styles.editButton}
              onClick={() => handleEditAcc({ id: i.id })}
            >
              Edit
            </div>
            <div
              className={styles.deleteButton}
              onClick={() =>
                handleDeleteAcc({
                  id: item.id,
                  product: i.product
                })
              }
            >
              Hapus
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.activity}>
          <div className={styles.productContainer}>
            <p className={styles.productName}>{i.product}</p>
            <div className={styles.productDetail}>
              <p>Warna : {i.color}</p>
              <p>Ukuran: {i.capacity}</p>
            </div>
          </div>

          <div className={styles.priceContainer}>
            {i.price.map((r) => (
              <div key={r.amount} className={styles.price}>
                <p className={styles.priceAmount}>{formatRupiah(r.amount)}</p>
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
                })
              }
            >
              Batalkan
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
