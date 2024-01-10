const functions = require("firebase-functions");
const admin = require("firebase-admin");

const { Resend } = require("resend");

admin.initializeApp();

const resend = new Resend("re_Vecg5k6M_PvVBCWq2fbmahGcpFz4VFyrs");

exports.sendCheckInEmails = functions
    .region("europe-west1")
    .pubsub.schedule("every 24 hours") // Run daily
    .onRun(async (context) => {
      const db = admin.firestore();

      const todayStart = new Date();
      todayStart.setUTCHours(0, 0, 0, 0); // Start of the day UTC

      const todayEnd = new Date(todayStart);
      todayEnd.setUTCDate(todayEnd.getUTCDate() + 1); // End of the day UTC

      console.log(`todayStart: ${todayStart.toISOString()}`);
      console.log(`todayEnd: ${todayEnd.toISOString()}`);

      const reservationsSnapshot = await db
          .collection("UsersReservation")
          .where("checkInDate", ">=", admin.firestore.Timestamp.fromDate(todayStart))
          .where("checkInDate", "<", admin.firestore.Timestamp.fromDate(todayEnd))
          .get();

      if (reservationsSnapshot.empty) {
        console.log("No check-ins for today.");
        return null;
      }

      const tasks = reservationsSnapshot.docs.map(async (doc) => {
        const reservation = doc.data();
        const email = reservation.email;
        const firstName = reservation.firstName;
        const password = reservation.password;
        
        try {
          const userRecord = await admin.auth().createUser({ email, password });
          console.log("Successfully created new user:", userRecord.uid);

          const emailContent = `...`; // Your email content here

          await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "Your Aedis Check-In Account Information",
            html: emailContent,
          });

          console.log("Email sent to:", email);
        } catch (error) {
          console.error("Error in operation for:", email, error);
        }
      });
      await Promise.all(tasks);
    });

exports.deletePastReservations = functions.pubsub.schedule('0 22 * * *') // Runs at 10 PM UTC daily
    .timeZone('Europe/Zagreb') // Specify Zadar time zone
    .onRun(async (context) => {
        const now = admin.firestore.Timestamp.now();
        const reservationsRef = admin.firestore().collection('UsersReservation');

        const snapshot = await reservationsRef.where('checkInDate', '<', now).get();
        if (snapshot.empty) {
          console.log("No past reservations to delete.");
          return;
        }

        const batch = admin.firestore().batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));

        await batch.commit();
        console.log("Past reservations deleted.");
    });