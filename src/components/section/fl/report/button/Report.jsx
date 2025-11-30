import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../../../../firebase";

import styles from "./style.module.css";

import ReportPopUp from "../popup/Report";

import { pmtReport } from "../../../../../state/state";

export default function Report({ name, brand, open }) {
  const { active, toogleActive } = pmtReport();

  return (
    <>
      <div className={styles.container}>
        <div className={styles.wrapper} onClick={toogleActive}>
          <svg
            width="37"
            height="29"
            viewBox="0 0 37 29"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M26.0346 5.61319L23.8589 2.1756C23.4004 1.64108 22.7719 1.30762 22.0674 1.30762H14.5481C13.8436 1.30762 13.2151 1.64108 12.7566 2.1756L10.5809 5.61319C10.1224 6.14853 9.53149 6.53839 8.82697 6.53839H3.92312C3.22948 6.53839 2.56425 6.81394 2.07377 7.30442C1.58329 7.79489 1.30774 8.46013 1.30774 9.15377V24.8461C1.30774 25.5397 1.58329 26.205 2.07377 26.6954C2.56425 27.1859 3.22948 27.4615 3.92312 27.4615H32.6924C33.386 27.4615 34.0512 27.1859 34.5417 26.6954C35.0322 26.205 35.3077 25.5397 35.3077 24.8461V9.15377C35.3077 8.46013 35.0322 7.79489 34.5417 7.30442C34.0512 6.81394 33.386 6.53839 32.6924 6.53839H27.8702C27.1633 6.53839 26.4931 6.14853 26.0346 5.61319Z"
              stroke="white"
              strokeWidth="2.61538"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18.3077 22.2312C21.9188 22.2312 24.8462 19.3039 24.8462 15.6928C24.8462 12.0817 21.9188 9.1543 18.3077 9.1543C14.6967 9.1543 11.7693 12.0817 11.7693 15.6928C11.7693 19.3039 14.6967 22.2312 18.3077 22.2312Z"
              stroke="white"
              strokeWidth="2.61538"
              strokeMiterlimit="10"
            />
            <path
              d="M7.51928 6.37523V4.57715H5.55774V6.37523"
              stroke="white"
              strokeWidth="2.61538"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </>
  );
}
