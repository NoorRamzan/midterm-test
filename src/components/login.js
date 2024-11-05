import React, { useState } from 'react';
import { auth } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Clear previous errors

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if the logged-in user is a doctor
      const doctorDocRef = doc(db, "doctors", user.uid);
      const doctorDocSnapshot = await getDoc(doctorDocRef);

      if (doctorDocSnapshot.exists()) {
        alert("Login successful!");
        navigate('/doc'); // Redirect to the Doctor Dashboard after login
      } else {
        // If the user is not a doctor, check if they are a patient
        const patientDocRef = doc(db, "patients", user.uid);
        const patientDocSnapshot = await getDoc(patientDocRef);

        if (patientDocSnapshot.exists()) {
          alert("Login successful!");
          navigate('/pat'); // Redirect to the Patient Dashboard after login
        } else {
          alert("Login successful, but you are neither a doctor nor a patient.");
          navigate('/'); // Redirect to homepage if the user is neither
        }
      }
    } catch (error) {
      // Handle specific Firebase authentication errors
      switch (error.code) {
        case 'auth/invalid-email':
          setError('The email address is not valid.');
          break;
        case 'auth/user-not-found':
          setError('No user found with this email.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password.');
          break;
        default:
          setError('Error: ' + error.message);
      }
    } finally {
      setLoading(false); // End loading state
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-lg transition-shadow duration-300 hover:shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-indigo-600 mb-4">Welcome Back!</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <table className="table-fixed w-full">
            <tbody>
              <tr>
                <td className="text-sm font-medium text-gray-700">Email:</td>
                <td>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                  />
                </td>
              </tr>
              <tr>
                <td className="text-sm font-medium text-gray-700">Password:</td>
                <td>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                  />
                </td>
              </tr>
              {error && (
                <tr>
                  <td colSpan="2" className="text-red-500 text-center text-sm pt-2">
                    {error}
                  </td>
                </tr>
              )}
              <tr>
                <td colSpan="2">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition duration-200 ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
        <p className="text-center text-gray-600 mt-4">
          Don’t have an account?{' '}
          <button 
            onClick={() => navigate('/reg')} 
            className="text-indigo-600 hover:underline"
          >
            Register Now
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;






