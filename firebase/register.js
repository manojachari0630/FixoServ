console.log("Register JS Loaded");

import { auth, db } from "./firebase-config.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


/* ==========================================
   REGISTER USER
========================================== */

export async function createNewUser(
    fullName,
    email,
    phone,
    password
) {

    try {

        // Remove accidental spaces
        email = email.trim().toLowerCase();

        /* ==========================================
           CREATE FIREBASE AUTH ACCOUNT
        ========================================== */

        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = userCredential.user;


        /* ==========================================
           CREATE FIRESTORE USER DOCUMENT
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


        /* ==========================================
           SUCCESS
        ========================================== */

        return {
            success: true,
            uid: user.uid
        };

    }

    catch (error) {

        console.error(
            "Registration error:",
            error
        );


        /* ==========================================
           EMAIL ALREADY EXISTS
        ========================================== */

        if (
            error.code ===
            "auth/email-already-in-use"
        ) {

            return {
                success: false,
                message:
                    "This email is already registered. Please login instead."
            };

        }


        /* ==========================================
           INVALID EMAIL
        ========================================== */

        if (
            error.code ===
            "auth/invalid-email"
        ) {

            return {
                success: false,
                message:
                    "Please enter a valid email address."
            };

        }


        /* ==========================================
           WEAK PASSWORD
        ========================================== */

        if (
            error.code ===
            "auth/weak-password"
        ) {

            return {
                success: false,
                message:
                    "Password must be at least 6 characters."
            };

        }


        /* ==========================================
           OTHER ERRORS
        ========================================== */

        return {
            success: false,
            message: error.message
        };

    }

}
