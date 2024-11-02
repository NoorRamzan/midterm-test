import React, { useState } from 'react';
import { auth, db } from '../config/firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const Register = () => {
  const [name, setName] = useState(''); // New state for name
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('patient'); // Default to patient

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Create a new user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Save additional user details in Firestore
      await setDoc(doc(db, userType === 'doctor' ? 'doctors' : 'patients', user.uid), {
        name, // Add name to Firestore
        email,
        userType,
      });
  
      alert(`Registration successful as a ${userType}!`);
  
      // Optional: Reset form fields
      setName('');
      setEmail('');
      setPassword('');
      
    } catch (error) {
      alert(error.message);
    }
  };
  

  return (
    <div style={{ padding: '20px' }}>
      <h2>Register as a {userType === 'doctor' ? 'Doctor' : 'Patient'}</h2>

      <form onSubmit={handleRegister}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Select User Type:</label>
          <select value={userType} onChange={(e) => setUserType(e.target.value)}>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>
        </div>

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;