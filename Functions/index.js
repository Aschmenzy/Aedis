const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {Resend} = require("resend");

admin.initializeApp();

const resend = new Resend("re_Vecg5k6M_PvVBCWq2fbmahGcpFz4VFyrs");

exports.sendCheckInEmails = functions
    .region("europe-west1")
    .pubsub.schedule("0 8 * * *")
    .timeZone("Europe/Zagreb")
    .onRun(async (context) => {
      const db = admin.firestore();

      const zadarTimeOffset = 1; // Zadar is currently UTC+1

      const todayStart = new Date();
      todayStart.setHours(todayStart.getHours() + zadarTimeOffset);
      todayStart.setHours(0, 0, 0, 0); // Start of the day in Zadar time

      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1); // End of the day in Zadar time

      console.log(`todayStart: ${todayStart.toISOString()}`);
      console.log(`todayEnd: ${todayEnd.toISOString()}`);

      const reservationsSnapshot = await db
          .collection("UsersReservation")
          .where(
              "checkInDate",
              ">=",
              admin.firestore.Timestamp.fromDate(todayStart),
          )
          .where("checkInDate", "<", admin.firestore
              .Timestamp.fromDate(todayEnd))
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
        // Attempt to create a user
          try {
            await admin.auth().createUser({email, password});
            console.log("Successfully created new user:", email);
          } catch (error) {
            if (error.code ===
              "auth/email-already-exists") {
              console.log("User already exists with email:"
                  , email);
            } else {
              throw error;
            }
          }

          // Email content
          const emailContent = `
          <p>Hello ${firstName},</p>
          <p>Welcome to Aedis! Here are 
          your login credentials for our 
          online check-in system:</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Password:</b> ${password}</p>
          <p>We recommend changing your password 
          after your first login for security reasons. 
          If you have any questions or need assistance, 
          please feel free to contact us.</p>
          <p>Looking forward to welcoming you,</p>
          <p>The Aedis Team</p>
        `;

          // Send email regardless of user creation status
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

exports.deletePastReservations = functions.pubsub
    .schedule("0 22 * * *")
    .timeZone("Europe/Zagreb") // Specify Zadar time zone
    .onRun(async (context) => {
      const now = admin.firestore.Timestamp.now();
      const reservationsRef = admin.firestore().collection("UsersReservation");
      const deletedReservationsRef = admin.firestore()
          .collection("DeletedReservations");

      const snapshot = await reservationsRef
          .where("checkInDate", "<", now).get();
      if (snapshot.empty) {
        console.log("No past reservations to delete.");
        return;
      }

      const batch = admin.firestore().batch();

      snapshot.docs.forEach((doc) => {
        // Add the reservation to the DeletedReservations collection
        const deletedReservationData = {...doc.data(), deletedAt: now};
        deletedReservationsRef.doc(doc.id).set(deletedReservationData);
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log("Past reservations deleted.");
    });
