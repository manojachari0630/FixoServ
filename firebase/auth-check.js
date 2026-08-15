import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

/* ==========================================
   ADMIN AUTH CHECK
========================================== */

export function protectAdminPage(){

    onAuthStateChanged(auth, async(user)=>{

        if(!user){

            window.location.href="../../login.html";

            return;

        }

        try{

            const snap = await getDoc(
                doc(db,"users",user.uid)
            );

            if(!snap.exists()){

                await auth.signOut();

                window.location.href="../../login.html";

                return;

            }

            const data = snap.data();

            if(data.role !== "admin"){

                window.location.href="../../index.html";

                return;

            }

        }

        catch(error){

            console.error(error);

            window.location.href="../../login.html";

        }

    });

}

/* ==========================================
   USER AUTH CHECK
========================================== */

export function protectUserPage(){

    onAuthStateChanged(auth, async(user)=>{

        if(!user){

            window.location.href="login.html";

            return;

        }

    });

}