import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";

// Ambil isi setiap koleksi (users, pmt)
const getCollectionData = async (colName) => {
  const colRef = collection(db, colName);
  const snapshot = await getDocs(colRef);
  const data = {};

  snapshot.forEach((docSnap) => {
    data[docSnap.id] = docSnap.data();
  });

  return data;
};

// Fungsi utama untuk ekspor struktur Firestore
export const getFirestoreStructure = async () => {
  const collections = ["users", "pmtdatas"]; // koleksi kamu
  const result = {};

  for (const colName of collections) {
    result[colName] = await getCollectionData(colName);
  }

  return result;
};