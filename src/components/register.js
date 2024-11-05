import React, { useState } from 'react';
import { auth, db } from '../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth'; 
import { doc, setDoc } from 'firebase/firestore'; 
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('patient');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, userType === 'doctor' ? 'doctors' : 'patients', user.uid), {
        name,
        email,
        userType,
      });

      alert(`Registration successful as a ${userType}!`);
      navigate(userType === 'doctor' ? '/doc' : '/pat'); 
      
    } catch (error) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          alert('This email address is already in use. Please use a different email.');
          break;
        case 'auth/invalid-email':
          alert('The email address is not valid.');
          break;
        case 'auth/weak-password':
          alert('The password is too weak. It should be at least 6 characters long.');
          break;
        default:
          alert('Error: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100">
      {/* Form section */}
      <div className="w-full max-w-md p-10 bg-white rounded-lg shadow-lg space-y-8 transition-shadow duration-300 hover:shadow-2xl">
        <h2 className="text-3xl font-semibold text-center text-blue-700">Create an Account</h2>
        <form onSubmit={handleRegister} className="space-y-6">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
              className="px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 border-gray-300"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 border-gray-300"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 border-gray-300"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">User Type</label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              disabled={isLoading}
              className="px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 border-gray-300"
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 text-white font-bold rounded-md transition duration-300 ${isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {isLoading ? 'Registering...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account?
          <button 
            onClick={() => navigate('/')} 
            className="text-blue-500 hover:underline ml-1 transition duration-200"
          >
            Sign In
          </button>
        </p>
      </div>

      {/* Left side image section */}
      <div className="w-1/2 hidden md:block">
        <img
          src="https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg"
          alt="Working Woman on Laptop"
          className="object-cover h-full"
        />
      </div>
    </div>
  );
};

export default Register;




