import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  db,
  googleProvider,
  isFirebaseConfigured,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  doc,
  setDoc,
  getDoc,
} from '../firebase';

const AuthContext = createContext();

const LOCAL_STORAGE_USER_KEY = 'study_buddy_mock_user';
const LOCAL_STORAGE_PROFILE_KEY = 'study_buddy_user_profile';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load profile from Firestore or local storage
  const fetchProfile = async (uid) => {
    if (isFirebaseConfigured && db) {
      try {
        const userRef = doc(db, 'users', uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const profileData = docSnap.data();
          setUserProfile(profileData);
          return profileData;
        }
      } catch (err) {
        console.warn('[Firestore] Error fetching profile:', err);
      }
    }
    // Fallback to localStorage
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PROFILE_KEY}_${uid}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserProfile(parsed);
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    setUserProfile(null);
    return null;
  };

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        if (user) {
          await fetchProfile(user.uid);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Demo / Guest mode initialization
      const savedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setCurrentUser(parsedUser);
          const savedProfile = localStorage.getItem(`${LOCAL_STORAGE_PROFILE_KEY}_${parsedUser.uid}`);
          if (savedProfile) {
            setUserProfile(JSON.parse(savedProfile));
          }
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    }
  }, []);

  // Save profile to Firestore and state
  const saveProfile = async (profileData) => {
    const updated = {
      ...profileData,
      completedProfile: true,
      updatedAt: new Date().toISOString(),
    };

    if (currentUser) {
      if (isFirebaseConfigured && db) {
        try {
          await setDoc(doc(db, 'users', currentUser.uid), updated, { merge: true });
        } catch (err) {
          console.warn('[Firestore] Could not save to Firestore, saving locally:', err);
        }
      }
      localStorage.setItem(`${LOCAL_STORAGE_PROFILE_KEY}_${currentUser.uid}`, JSON.stringify(updated));
    }
    setUserProfile(updated);
    return updated;
  };

  // Sign up with Email/Password
  const signUpWithEmail = async (email, password, displayName = 'Learner') => {
    if (isFirebaseConfigured && auth) {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
      setCurrentUser(cred.user);
      return cred.user;
    } else {
      // Demo mode fallback
      const mockUser = {
        uid: 'demo_' + Date.now(),
        email,
        displayName: displayName || email.split('@')[0],
        photoURL: null,
      };
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mockUser));
      setCurrentUser(mockUser);
      return mockUser;
    }
  };

  // Sign in with Email/Password
  const signInWithEmail = async (email, password) => {
    if (isFirebaseConfigured && auth) {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      setCurrentUser(cred.user);
      await fetchProfile(cred.user.uid);
      return cred.user;
    } else {
      const mockUser = {
        uid: 'demo_user_123',
        email,
        displayName: email.split('@')[0],
        photoURL: null,
      };
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mockUser));
      setCurrentUser(mockUser);
      await fetchProfile(mockUser.uid);
      return mockUser;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    if (isFirebaseConfigured && auth && googleProvider) {
      const cred = await signInWithPopup(auth, googleProvider);
      setCurrentUser(cred.user);
      await fetchProfile(cred.user.uid);
      return cred.user;
    } else {
      const mockGoogleUser = {
        uid: 'demo_google_learner',
        email: 'learner@gmail.com',
        displayName: 'Alex Learner',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      };
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mockGoogleUser));
      setCurrentUser(mockGoogleUser);
      await fetchProfile(mockGoogleUser.uid);
      return mockGoogleUser;
    }
  };

  // Quick Guest Login with preset educational profiles
  const signInAsGuest = async (presetType = 'college') => {
    let preset = {
      name: 'Taylor Learner',
      level: 'College',
      collegeCourse: 'Computer Science',
      collegeYear: '2nd Year',
    };

    if (presetType === 'school') {
      preset = {
        name: 'Sammy Student',
        level: 'School',
        schoolClass: '10',
        subject: 'Science & Mathematics',
      };
    } else if (presetType === 'pro') {
      preset = {
        name: 'Jordan Pro',
        level: 'Professional',
        profession: 'Software Engineer',
      };
    }

    const guestUser = {
      uid: `guest_${presetType}`,
      email: `${presetType}@studybuddy.app`,
      displayName: preset.name,
      photoURL: null,
      isGuest: true,
    };

    const initialProfile = {
      ...preset,
      completedProfile: true,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(guestUser));
    localStorage.setItem(`${LOCAL_STORAGE_PROFILE_KEY}_${guestUser.uid}`, JSON.stringify(initialProfile));

    setCurrentUser(guestUser);
    setUserProfile(initialProfile);
    return guestUser;
  };

  // Sign out
  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    setCurrentUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isFirebaseConfigured,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        signInAsGuest,
        saveProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
