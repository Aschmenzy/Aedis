// Initialize Firebase
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.querySelector('.form').addEventListener('submit', function(e) {
    e.preventDefault();

    //get the values
    const checkInDate = document.getElementById('checkin-date').value;
    const checkOutDate = document.getElementById('checkout-date').value;
    const email = document.getElementById('email').value;
    const password = generatePassword();

    //update the password field
    document.getElementById('password').value = password;
    
    //send data to Firebase
    db.collection("reservations").add({
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        email: email,
        password: password
    })
    .then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
        //send email to the user
        sendEmail(email, password);
    })
    .catch((error) => {
        console.error("Error adding document: ", error);
    });
});

function generatePassword() {
    //generating a random password
    return Math.random().toString(36).slice(-8);
}

function sendEmail(email, password) {
    //email sending logic
    
}
