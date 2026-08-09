console.log("Register JS Loaded");

import { auth, db } from "./firebase-config.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";


/* ==========================================
   PREVENT DOUBLE REGISTRATION
========================================== */

let registrationInProgress = false;


/* ==========================================
   REGISTER USER
========================================== */

export async function createNewUser(
    fullName,
    email,
    phone,
    password
) {

    // IMPORTANT:
    // Prevent the function from running twice
    if (registrationInProgress) {

        return {
            success: false,
            message: "Registration is already in progress."
        };

    }

    registrationInProgress = true;

    try {

        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = userCredential.user;


        /* ==========================================
           SAVE USER TO FIRESTORE
        ========================================== */

        await setDoc(
            doc(db, "users", user.uid),
            {
                uid: user.uid,
                fullName: fullName,
                email: email,
                phone: phone,
                role: "user",
                createdAt: serverTimestamp()
            }
        );


        return {
            success: true
        };

    }

    catch (error) {

        console.error("Registration Error:", error);

        return {
            success: false,
            message: error.message
        };

    }

    finally {

        // Allow another registration attempt
        // only after this attempt has finished
        registrationInProgress = false;

    }
}
