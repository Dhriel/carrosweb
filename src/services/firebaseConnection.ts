import { initializeApp } from "firebase/app";

import {getFirestore} from 'firebase/firestore';
import {getAuth} from 'firebase/auth';
import {getStorage} from 'firebase/storage';


const firebaseConfig = {
  apiKey: "AIzaSyC3Q0VIZgwg6wcVBZp9CJzVcMrWmy2NFCc",
  authDomain: "webcarros-5bd2a.firebaseapp.com",
  projectId: "webcarros-5bd2a",
  storageBucket: "webcarros-5bd2a.appspot.com",
  messagingSenderId: "929989651110",
  appId: "1:929989651110:web:dcabcec6320df7e5d76267"
};


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };

