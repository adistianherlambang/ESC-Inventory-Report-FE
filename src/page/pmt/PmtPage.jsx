import React from "react";
import userActivityLogic from "../../hooks/userActivityLogic";

// Components
import ActivityList from "../../components/activity/ActivityList";
import EditSection from "../../components/section/pmt/edit/EditSection";
import DeleteSection from "../../components/section/pmt/delete/DeleteSection";
import Report from "../../components/section/pmt/report/button/Report";
import ReportPopUp from "../../components/section/pmt/report/popup/Report";
import Loader from "../../components/item/loader/Loader";
import Search from "../../components/section/search/Search";
import Logo from "../../../public/Logo";
import { LogoutIcon } from "../../../public/Icon";

import { userStore } from "../../state/state";
import styles from "./style.module.css";

export default function PmtPage() {
  const logout = userStore((state) => state.logout);

  const {
    pmtData,
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
    formatRupiah,
    date,
  } = userActivityLogic();

  return (
    <>
      {isEditing && (
        <EditSection
          isOpen={isEditing}
          docId={selectedId}
          data={editData}
          imei={selectedImei}
          onClose={() => setIsEditing("")}
        />
      )}

      {isDeleting && (
        <DeleteSection
          docId={selectedId}
          imei={selectedImei}
          product={selectedProduct}
          capacity={selectedCapacity}
          color={selectedColor}
          onClose={() => setIsDeleting("")}
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
        {/* TOP */}
        <div className={styles.topContainer}>
          <Logo />
          <div onClick={logout} className={styles.logoutButton}>
            <LogoutIcon />
            Logout
          </div>
        </div>

        {pmtData.map((item) => (
          <div key={item.id} className={styles.top}>
            <div className={styles.pmtContainer}>
              <p>Bismillah, {item.name}👋</p>
              <p className={styles.pmt}>PMT {item.brand}</p>
            </div>
            <Search brand={item.brand} />
          </div>
        ))}

        {loading && <Loader />}

        <ActivityList
          date={date}
          dateFiltered={dateFiltered}
          formatRupiah={formatRupiah}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      </div>
    </>
  );
}