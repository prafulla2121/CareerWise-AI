'use client';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  signInAnonymously,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getSdks } from '..';

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(auth: Auth, email: string, password: string, displayName: string): void {
  createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
        if(userCredential.user) {
            await updateProfile(userCredential.user, { displayName });
            const { firestore } = getSdks(auth.app);
            const userRef = doc(firestore, 'users', userCredential.user.uid);
            setDoc(userRef, {
                id: userCredential.user.uid,
                name: displayName,
                email: userCredential.user.email,
                role: 'user',
                createdAt: new Date().toISOString(),
                testsCompleted: 0,
                profileStrength: 0,
            }, { merge: true });
        }
    })
    .catch((error) => {
      console.error("Error signing up:", error);
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(auth: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(auth, email, password)
    .catch((error) => {
      console.error("Error signing in:", error);
    });
}

/** Initiate Google sign-in (non-blocking). */
export function initiateGoogleSignIn(auth: Auth): void {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then(async (result) => {
        const user = result.user;
        const { firestore } = getSdks(auth.app);
        const userRef = doc(firestore, 'users', user.uid);
        setDoc(userRef, {
            id: user.uid,
            name: user.displayName,
            email: user.email,
            role: 'user',
            createdAt: new Date().toISOString(),
            testsCompleted: 0,
            profileStrength: 0,
        }, { merge: true });
    })
    .catch((error) => {
    console.error("Error with Google sign-in:", error);
  });
}

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(auth: Auth): void {
    signInAnonymously(auth)
      .then(async (result) => {
        const user = result.user;
        await updateProfile(user, { displayName: "Guest User" });
        const { firestore } = getSdks(auth.app);
        const userRef = doc(firestore, 'users', user.uid);
        // Create a user document for the guest
        setDoc(userRef, {
            id: user.uid,
            name: "Guest User",
            email: null,
            role: 'guest',
            createdAt: new Date().toISOString(),
            testsCompleted: 0,
            profileStrength: 0,
        }, { merge: true });
      })
      .catch((error) => {
        console.error("Error with anonymous sign-in:", error);
      });
  }