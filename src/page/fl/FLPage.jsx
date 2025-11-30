import React, { useEffect } from "react";
import userActivityLogic from "../../hooks/userActivityLogic";

// Components
import ActivityList from "../../components/activity/ActivityList";
import EditSection from "../../components/section/fl/edit/EditSection";
import DeleteSection from "../../components/section/fl/delete/DeleteSection";
import Report from "../../components/section/fl/report/button/Report";
import ReportPopUp from "../../components/section/fl/report/popup/Report";
import Loader from "../../components/item/loader/Loader";
import Search from "../../components/section/search/Search";
import Logo from "../../../public/Logo";
import { LogoutIcon } from "../../../public/Icon";
import BrandButton from "../../components/brandButton/brandButton";

import { userStore } from "../../state/state";
import styles from "./style.module.css";

export default function FLPage() {
  const logout = userStore((state) => state.logout);
  const { currentUser } = userStore();

  const {
    flData,
    loading,
    dateFiltered,
    isEditing,
    isDeleting,
    editData,
    selectedId,
    selectedImei,
    selectedProduct,
    selectedColor,
    selectedCapacity,
    active,
    toogleDeact,
    setIsEditing,
    setIsDeleting,
    handleEdit,
    handleDelete,
    handleEditAcc,
    handleDeleteAcc,
    formatRupiah,
    date,
    idAcc,
    allTotal,
    productType,
  } = userActivityLogic();

  return (
    <>
      <EditSection
        isOpen={isEditing}
        docId={selectedId}
        data={editData}
        imei={selectedImei}
        onClose={() => setIsEditing("")}
        edit={isEditing}
        id={idAcc}
        productType={productType}
      />

      {isDeleting && (
        <DeleteSection
          docId={selectedId}
          imei={selectedImei}
          product={selectedProduct}
          capacity={selectedCapacity}
          color={selectedColor}
          onClose={() => setIsDeleting("")}
          productType={productType}
          id={idAcc}
        />
      )}

      {active && <ReportPopUp />}
      <Report />
      <div
        className={styles.container}
        onClick={() => {
          if (isEditing || isDeleting || active) {
            toogleDeact();
            setIsEditing("");
            setIsDeleting("");
          }
        }}
        style={{
          transition: "ease-in 300ms",
          opacity: isEditing || isDeleting || active ? 0.2 : 1,
        }}
      >
        <div className={styles.topContainer}>
          <Logo />
          <div onClick={logout} className={styles.logoutButton}>
            <LogoutIcon />
            Logout
          </div>
        </div>
        {flData.map((item) => (
          <div key={item.id} className={styles.top}>
            <div className={styles.pmtContainer}>
              <p>Bismillah, {item.name}👋</p>
              <p className={styles.pmt}>FrontLiner</p>
            </div>
          </div>
        ))}

        <div
          className={styles.brandButton}
          style={{
            pointerEvents: isEditing || isDeleting || active ? "none" : "auto",
          }}
        >
          <BrandButton label="Samsung" />
          <BrandButton label="Xiaomi" />
          <BrandButton label="Vivo" />
          <BrandButton label="Oppo" />
          <BrandButton label="Infinix" />
          <BrandButton label="Realme" />
          <BrandButton label="Tecno" />
          <BrandButton label="Iphone" />
          <BrandButton label="Nokia" />
        </div>

        {loading && <Loader />}

        <ActivityList
          date={date}
          dateFiltered={dateFiltered}
          formatRupiah={formatRupiah}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleDeleteAcc={handleDeleteAcc}
          handleEditAcc={handleEditAcc}
          total={allTotal}
        />
      </div>
    </>
  );
}
