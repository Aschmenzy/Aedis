const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {Resend} = require("resend");


admin.initializeApp();

const resend = new Resend("re_Vecg5k6M_PvVBCWq2fbmahGcpFz4VFyrs");

exports.sendCheckInEmails = functions
    .region("europe-west1")
    .pubsub.schedule("every 24 hours") // Run daily at 8 AM UTC
    .onRun(async (context) => {
      const db = admin.firestore();

      const todayStart = new Date();
      todayStart.setUTCHours(-1, 0, 0, 0); // 00:00:00 CET

      const todayEnd = new Date(todayStart);
      todayEnd.setUTCDate(todayEnd.getUTCDate() + 1); // Next day

      console.log(`todayStart: ${todayStart.toISOString()}`);
      console.log(`todayEnd: ${todayEnd.toISOString()}`);

      const reservations = await db
          .collection("UsersReservation")
          .where(
              "checkInDate",
              ">=",
              admin.firestore.Timestamp.fromDate(todayStart),
          )
          .where("checkInDate", "<", admin.firestore
              .Timestamp.fromDate(todayEnd))
          .get();

      if (reservations.empty) {
        console.log("No check-ins for today.");
        return null;
      }
      reservations.forEach(async (doc) => {
        const reservation = doc.data();
        const email = reservation.email;
        const firstName = reservation.firstName;
        const password = reservation.password;
        // Create user in Firebase Auth
        try {
          const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
          });
          console.log("Successfully created new user:", userRecord.uid);
        } catch (error) {
          console.error("Error creating new user:", error);
        }

        const emailContent = `
    <p>Hello ${firstName},</p>
    <p>Welcome to Aedis! Here are your login 
    credentials for our online check-in system:</p>
    <p><b>Email:</b> ${email}</p>
    <p><b>Password:</b> ${password}</p>
    <p>We recommend changing your password after your
     first login for security reasons. If you have any questions or
      need assistance, please feel free to contact us.</p>
    <p>Looking forward to welcoming you,</p>
    <p>The Aedis Team</p>
  `;

        resend.emails
            .send({
              from: "onboarding@resend.dev",
              to: email,
              subject: "Your Aedis Check-In Account Information",
              html: emailContent,
            })
            .then((response) => {
              console.log("Email sent to:", email);
            })
            .catch((error) => {
              console.error("Error sending email:", error);
            });
      });
    });
