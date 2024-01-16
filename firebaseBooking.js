import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  where,
  orderBy,
  query,
  updateDoc,
  doc,
  getDocs,
  getDoc,
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

//function that generates a random password every time
function generatePassword(length) {
  var result = "";
  for (var i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Utility function to convert a date to UTC and set the time to midnight
function toUtcMidnight(date) {
  let newDate = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  return newDate;
}

document.querySelector("#userForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Capture form values
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const country = document.getElementById("country").value;
  const checkInDate = toUtcMidnight(
    new Date(document.getElementById("checkindate").value)
  );
  const checkOutDate = toUtcMidnight(
    new Date(document.getElementById("checkoutdate").value)
  );
  const adults = document.getElementById("adults").value;
  const children = document.getElementById("children").value;

  console.log(
    `Check out date: ${checkOutDate.toISOString()}, Check-in Date: ${checkInDate.toISOString()}`
  );
  try {
    const availableRoomsRef = collection(db, "AvailableRooms");
    const q = query(availableRoomsRef, orderBy("roomNumber"));
    const querySnapshot = await getDocs(q);

    console.log(
      "Fetched Rooms in Order: ",
      querySnapshot.docs.map((doc) => doc.data().roomNumber)
    );

    let roomAssigned = false;
    let assignedRoomId;
    let nextAvailableDate;

    for (const roomDoc of querySnapshot.docs) {
      const roomData = roomDoc.data();
      const roomNextAvailableDate = toUtcMidnight(
        new Date(roomData.nextAvailableDate.toDate())
      );

      console.log(
        `Room ${
          roomData.roomNumber
        }, Next Available: ${roomNextAvailableDate.toISOString()}, Check-in Date: ${checkInDate.toISOString()}`
      );

      if (roomNextAvailableDate <= checkInDate) {
        assignedRoomId = roomDoc.id;
        nextAvailableDate = new Date(checkOutDate);
        nextAvailableDate.setDate(nextAvailableDate.getDate() + 1); // Set to day after checkout
        roomAssigned = true;
        console.log(`Assigning Room ${roomData.roomNumber}`);
        break; // Found an available room, exit the loop
      }
    }

    if (roomAssigned) {
      // array for all reservations
      const reservationDetails = {
        firstName,
        lastName,
        checkInDate,
        checkOutDate,
        adults,
        children,
      };
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
        ...reservationDetails,
        password: generatePassword(8),
        checkedIn: false,
        roomNumber: assignedRoomId,
      });

      // Get the current room document reference
      const roomDocRef = doc(db, "AvailableRooms", assignedRoomId);

      // Retrieve the current room document
      const roomDoc = await getDoc(roomDocRef);

      // Check if the room document exists and has a reservations array
      const roomData = roomDoc.exists() ? roomDoc.data() : {};
      const currentReservations = roomData.reservations || [];

      // Update the room's next available date and append the new reservation
      await updateDoc(roomDocRef, {
        nextAvailableDate: nextAvailableDate,
        reservations: [...currentReservations, reservationDetails],
      });

      console.log("Reservation made with Room Number: ", assignedRoomId);

      console.log("Document written with ID: ", docRef.id);
      //logic for sending to thank you page
      window.location.href = "thankYouPage.html";
    } else {
      console.error("No available rooms for the selected date.");
      //logic for no available rooms
      window.location.href = "noAvailableRooms.html";
    }
  } catch (error) {
    console.error("Error adding document: ", error);
  }
});



