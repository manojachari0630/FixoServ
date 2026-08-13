import { auth, db } from "./firebase-config.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/* ==========================================
   REGISTER USER
========================================== */

export async function registerUser(name, email, password) {

    const userCredential =
        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {

        uid: user.uid,

        name: name,

        email: email,

        role: "user",

        createdAt: serverTimestamp()

    });

    return user;

}

/* ==========================================
   LOGIN USER
========================================== */

export async function loginUser(email, password) {

    const userCredential =
        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

    const user = userCredential.user;

    const snap =
        await getDoc(doc(db, "users", user.uid));

    if (!snap.exists()) {

        throw new Error("User data not found.");

    }

    return {

        user: user,

        role: snap.data().role,

        data: snap.data()

    };

}

/* ==========================================
   LOGOUT
========================================== */

export async function logoutUser() {

    await signOut(auth);

}

/* ==========================================
   FORGOT PASSWORD
========================================== */

export async function forgotPassword(email) {

    await sendPasswordResetEmail(auth, email);

}

/* ==========================================
   GET CURRENT USER
========================================== */

export function getCurrentUser() {

    return auth.currentUser;

}
/* ==========================================
   GET USER ROLE
========================================== */

export async function getUserRole(uid) {

    const snap =
        await getDoc(doc(db, "users", uid));

    if (!snap.exists()) {

        return null;

    }

    return snap.data().role;

}

/* ==========================================
   CHECK LOGIN STATE
========================================== */

export function checkAuth(callback) {

    onAuthStateChanged(auth, async (user) => {

        if (!user) {

            callback(null);

            return;

        }

        const snap =
            await getDoc(doc(db, "users", user.uid));

        if (!snap.exists()) {

            callback(null);

            return;

        }

        callback({

            uid: user.uid,

            email: user.email,

            ...snap.data()

        });

    });

}

/* ==========================================
   GOOGLE SIGN IN
========================================== */

export async function googleSignIn() {

    const provider = new GoogleAuthProvider();

    const result =
        await signInWithPopup(auth, provider);

    const user = result.user;

    const userRef =
        doc(db, "users", user.uid);

    const snap =
        await getDoc(userRef);

    if (!snap.exists()) {

        await setDoc(userRef, {

            uid: user.uid,

            name: user.displayName || "",

            email: user.email || "",

            phone: user.phoneNumber || "",

            role: "user",

            createdAt: serverTimestamp()

        });

    }

    return {

        success: true,

        user: user,

        role: snap.exists()
            ? snap.data().role
            : "user"

    };

}