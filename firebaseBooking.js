import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

    const firebaseConfig = {
      // Your configuration here
      apiKey: "AIzaSyAbWQORwYA70-4WEldZSd5ddRoFjDy1KlA",
      authDomain: "razvojsoftvera-77ee6.firebaseapp.com",
      databaseURL: "https://razvojsoftvera-77ee6-default-rtdb.europe-west1.firebasedatabase.app",
      projectId: "razvojsoftvera-77ee6",
      storageBucket: "razvojsoftvera-77ee6.appspot.com",
      messagingSenderId: "782055124213",
      appId: "1:782055124213:web:cbed2767325c9d1931e9bc",
      measurementId: "G-GQE351847P"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    document.querySelector('.form form').addEventListener('submit', async (e) => {
      e.preventDefault();

      // Convert date strings to Date objects
      const checkInDate = new Date(document.getElementById('checkin-date').value);
      const checkOutDate = new Date(document.getElementById('checkout-date').value);
      const adults = document.querySelector('input[name="adults"]').value;
      const children = document.querySelector('input[name="children"]').value;

      try {
        const docRef = await addDoc(collection(db, "reservations"), {
          checkInDate: checkInDate,
          checkOutDate: checkOutDate,
          adults: adults,
          children: children
        });

        console.log("Document written with ID: ", docRef.id);
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    });