import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const firebaseConfig = {
  // Your configuration here
  apiKey: "AIzaSyAbWQORwYA70-4WEldZSd5ddRoFjDy1KlA",
  authDomain: "razvojsoftvera-77ee6.firebaseapp.com",
  databaseURL:
    "https://razvojsoftvera-77ee6-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "razvojsoftvera-77ee6",
  storageBucket: "razvojsoftvera-77ee6.appspot.com",
  messagingSenderId: "782055124213",
  appId: "1:782055124213:web:cbed2767325c9d1931e9bc",
  measurementId: "G-GQE351847P",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.querySelector("#userForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  //function that generates a random password every time
  function generatePassword(length) {
    var result = "";
    for (var i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  // Capture form values
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const country = document.getElementById("country").value;
  const checkInDate = new Date(document.getElementById("checkindate").value);
  const checkOutDate = new Date(document.getElementById("checkoutdate").value);
  const adults = document.getElementById("adults").value;
  const children = document.getElementById("children").value;

  try {
    // Add a document to the 'reservations' collection
    const docRef = await addDoc(collection(db, "UsersReservation"), {
      firstName,
      lastName,
      email,
      phone,
      country,
      checkInDate,
      checkOutDate,
      adults,
      children,
      password: generatePassword(8),
      checkedIn: false,
    });

    console.log("Document written with ID: ", docRef.id);
    //logic for sending to thank you page
    window.location.href = "thankYouPage.html";
  } catch (error) {
    console.error("Error adding document: ", error);
  }
});



