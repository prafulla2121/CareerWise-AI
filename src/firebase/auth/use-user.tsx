'use client';
    
import { useState, useEffect } from 'react';
import { Auth, onAuthStateChanged, User } from 'firebase/auth';

/**
 * Interface for the return value of the useUser hook.
 */
export interface UseUserResult {
  user: User | null;      // The authenticated user, or null if not signed in.
  isLoading: boolean;     // True while checking the auth state.
  error: Error | null;    // An error object if the auth state listener fails.
}

/**
 * React hook to get the current authenticated user from Firebase.
 *
 * This hook subscribes to Firebase's authentication state changes.
 * It provides the user object, a loading state, and any potential errors.
 *
 * It is intended to be used within a component that is a child of a
 * FirebaseProvider, from which it will receive the `auth` object.
 *
 * @param {Auth} auth - The Firebase Auth instance.
 * @returns {UseUserResult} An object containing the user, loading state, and error.
 */
export function useUser(auth: Auth): UseUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Reset state when the auth instance changes.
    setUser(null);
    setIsLoading(true);
    setError(null);

    // Subscribe to auth state changes. onAuthStateChanged returns an unsubscribe function.
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUser(firebaseUser); // This will be null if logged out, or the User object if logged in.
        setIsLoading(false);
      },
      (error) => {
        console.error("useUser: Error in onAuthStateChanged listener:", error);
        setError(error);
        setIsLoading(false);
      }
    );

    // Cleanup: Unsubscribe from the listener when the component unmounts
    // or when the auth instance changes.
    return () => unsubscribe();
  }, [auth]); // The effect re-runs only if the `auth` instance changes.

  return { user, isLoading, error };
}
