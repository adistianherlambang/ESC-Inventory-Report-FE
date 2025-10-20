import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000",
});

// Tambahkan token otomatis kalau ada
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;

import { getDocs } from "firebase/firestore";
import db from "./firebaseConfig";

// Fungsi rekursif untuk ambil koleksi dan subkoleksi
const getCollectionData = async (colRef) => {
  const snapshot = await getDocs(colRef);
  const data = {};

  for (const docSnap of snapshot.docs) {
    const docData = docSnap.data();
    data[docSnap.id] = { ...docData };

    // Ambil subkoleksi (jika ada)
    const subCollections = await docSnap.ref.listCollections();
    for (const subCol of subCollections) {
      data[docSnap.id][subCol.id] = await getCollectionData(subCol);
    }
  }

  return data;
};

// Fungsi utama: ambil semua koleksi utama Firestore
export const getFirestoreStructure = async () => {
  const collections = await db.listCollections();
  const result = {};

  for (const col of collections) {
    result[col.id] = await getCollectionData(col);
  }

  return result;
};
