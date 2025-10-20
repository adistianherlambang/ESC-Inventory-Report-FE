import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userStore } from "../../state/state";

import styles from "./style.module.css";
import { useStore } from "zustand";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../../../firebase";

import FirestoreExport from "./File";

export default function Login() {
  const [unique, setUnique] = useState("");
  const navigate = useNavigate();
  const setCurrentUser = userStore((state) => state.setCurrentUser);
  const user = userStore((state) => state.currentUser);

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
    console.log(user);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const q = query(
        collection(db, "users"),
        where("unique", "==", unique),
        limit(1),
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = { id: doc.id, ...doc.data() };
        alert(`login Sukses: ${JSON.stringify(data)}`);
        setCurrentUser(data);
        navigate("/");
      } else {
        alert("user gaada");
      }
    } catch (err) {
      alert(`error ${err.message}`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        SuperApp
        <FirestoreExport />
      </div>
      <div className={styles.bottom}>
        <p className={styles.title}>
          Selamat <span className={styles.span}>Datang</span>👋 di SuperApp TES
          123
        </p>
        <form onSubmit={handleLogin} className={styles.form}>
          <input
            className={styles.input}
            type="text"
            placeholder="Kode Login"
            value={unique}
            onChange={(e) => setUnique(e.target.value)}
          />
          <button className={styles.button} type="submit">
            Login
          </button>
        </form>
        <p className={styles.text}>
          Dengan menggunakan aplikasi Eldorado, Anda setuju untuk menjaga
          keamanan akun, mengelola data dengan benar, tidak menyalahgunakan
          fitur, menjaga kerahasiaan informasi perusahaan, serta mematuhi
          seluruh ketentuan dan pembaruan resmi yang berlaku.
        </p>
      </div>
    </div>
  );
}
