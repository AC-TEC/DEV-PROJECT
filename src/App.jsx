import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, provider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';



function App() {
  const [count, setCount] = useState(0);

  //for login
  const [user, setUser] = useState(null);


  /*
  !Prevous logic for counter and clicks (not user specific)

  const counterDocument = doc(db, "counts", "button_count");

  //counter for firebase
  useEffect(() => {
    const fetchCounter = async () =>{
      const capture = await getDoc(counterDocument);
      if (capture.exists()){
        const captured_data = capture.data();
        setCount(captured_data.value);
      }
    };
    fetchCounter();
  }, []);

  //handle button clicks
  const handle_buttonClick = async () => {
    const newCount = count + 1;
    setCount(newCount);
    await setDoc(counterDocument, { value: newCount});
  }


  //handle reset clicks
  const handle_resetClick = async () => {
    setCount(0);
    await setDoc(counterDocument, { value: 0 });
  };
  */


  //Updated: For user specific 
  useEffect(() => {
  if (!user) {
    return;
  }

  //for user specific counter
  const counterDocument = doc(db, "users", user.uid, "counter", "count");


  const fetchCounter = async () => {
    const capture = await getDoc(counterDocument);
    if (capture.exists()) {
      const data = capture.data();
      setCount(data.value);
    } else {
      await setDoc(counterDocument, { value: 0 });
      setCount(0);
    }
  };

    fetchCounter();
  }, [user]);


  //updated: handle button clicks (user-specific)
  const handle_buttonClick = async () => {
    if (!user) {
      return;
    }

    const counterDocument = doc(db, "users", user.uid, "counter", "count");
    const newCount = count + 1;
    setCount(newCount);
    await setDoc(counterDocument, { value: newCount });
};


  //updated: handle rest button click (user-specific)
  const handle_resetClick = async () => {
    if (!user) {
      return;
    }

    const counterDocument = doc(db, "users", user.uid, "counter", "count");
    setCount(0);
    await setDoc(counterDocument, { value: 0 });
  };



  //track user status
  useEffect(() => {
    const authUnsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      //clear count when user signs out
      if(!currentUser){
        setCount(0);
      }

    });
    return () => authUnsub();
  }, []);


  //handle user sign in (with Google)
  const handle_signIn = async () =>{
    try{
      const signIn_result = await signInWithPopup(auth, provider);
      const user = signIn_result.user;

      //save user info to database
      const userDocument = doc(db, 'users', user.uid);
      await setDoc(userDocument, {
        name: user.displayName, email: user.email, photo: user.photoURL, uid: user.uid }, {merge: true});
    } catch(error){
      console.error('Error upon sign in: ', error);
    }
  };


  //handle user sign out (with Google)
  const handle_signOut = async () =>{
    try{
      await signOut(auth);

    } catch(error){
      console.error('Error upon sign out: ', error);
    }
  };


  return (
    <>

    {user && ( <div className="user-info"> 
      <img src={user.photoURL} alt="Profile" /> 
      <span>{user.displayName}</span>
      </div>
    )}

    <div>
      <a href="https://vite.dev" target="_blank">
        <img src={viteLogo} className="logo" alt="Vite logo" />
      </a>
        

      <a href="https://react.dev" target="_blank">
        <img src={reactLogo} className="logo react" alt="React logo" />
      </a>

      <a href="https://firebase.google.com/" target='_blank'>
        <img src='https://firebase.google.com/downloads/brand-guidelines/PNG/logo-logomark.png' className='logo firebase' alt='firebase logo'/>
      </a>
    </div>


    <h1>Vite + React + Firebase</h1>


    <div className="card">
      {/*update: Changed so that count and reset buttons appear only when signed in  */}

      {user ? (
        <>
          <button onClick={handle_signOut}>Sign Out</button>
          <button onClick={handle_buttonClick}>Count: {count}</button>
          <button onClick={handle_resetClick}>Reset Count</button>
        </>
      ) : (
          <button onClick={handle_signIn}>Sign In</button>
      )}
    </div>
      
      
    <p className="read-the-docs">
      Click on the Vite, React, and Firebase logos to learn more
    </p>
    
    </>
  )
}

export default App
