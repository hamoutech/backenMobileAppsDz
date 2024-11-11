
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, child, push } from "firebase/database";


const firebaseConfig = {
  apiKey: "AIzaSyCA1AvHXwpX28UblLFRcmvpjKNjRLMXL3Y",
  authDomain: "mygardenyt-68ab7.firebaseapp.com",
  databaseURL: "https://footballapp-28b11-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "mygardenyt-68ab7",
  storageBucket: "mygardenyt-68ab7.appspot.com",
  messagingSenderId: "367174797044",
  appId: "1:367174797044:web:e3c4bb58a9440f83d780a1",
  measurementId: "G-GB3YDP4Q0N",
};

export const _ = initializeApp(firebaseConfig);
const db = getDatabase();
const dbRef = ref(db);


export  const saveTokenbyid = async (userId: string, token: string) => {
    const values = (await get(child(dbRef, `userTokens/${userId}/`))).val() ?? {};
    const payload = { ...values, token };
    set(ref(db, `userTokens/${userId}/`), payload);
  };
  export  const saveToken = async (token: string) => {
    const values = (await get(child(dbRef, 'expoTokens/'))).val() ?? {};
    const tokenList = Object.keys(values).map((key) => ({
      id: key,
      token :values[key],
    }));
    const containstoken = tokenList.some((obj: any) => obj.token === token);
    const tokenref = child(dbRef,'expoTokens/');
    if(!containstoken){
      push(tokenref,token);
    }
    return containstoken ;
  };

  export const getallToken = async () => {
    const values = (await get(child(dbRef, 'expoTokens/'))).val() ?? {};
    const tokenList = Object.keys(values).map((key) => ({
      id: key,
      token :values[key],
    }));
    return tokenList ?? {};
  };
  
  export const getToken = async (userId: string) => {
    const values = (await get(child(dbRef, `userTokens/${userId}`))).val();
    return values ?? {};
  };
  