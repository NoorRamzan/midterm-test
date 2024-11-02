import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase'; // Make sure this path is correct
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore'; // Import Firestore functions
import { db } from '../config/firebase'; // Import your Firestore database reference

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'doctor' or 'patient'
  const [userName, setUserName] = useState(''); // Store the user's name
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch user role from Firestore
        const fetchUserRole = async () => {
          // Example: Assuming you have collections 'doctors' and 'patients'
          const doctorDoc = await getDoc(doc(db, 'doctors', currentUser.uid));
          const patientDoc = await getDoc(doc(db, 'patients', currentUser.uid));
          
          if (doctorDoc.exists()) {
            setUserRole('doctor');
            setUserName(doctorDoc.data().name); // Get doctor's name
          } else if (patientDoc.exists()) {
            setUserRole('patient');
            setUserName(patientDoc.data().name); // Get patient's name
          }
        };

        fetchUserRole();
      } else {
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  // Function to get the first letter of the user's name
  const getInitials = (name) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  return (
    <nav className="bg-blue-10 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold">MedicalData</h1>
        <ul className="flex items-center space-x-4">
          {!user ? (
            <li>
              <Link to="/" className="text-white">Login</Link>
            </li>
           
          
          ) : (
            <>
              <li className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-300 rounded-full text-white">
                  {getInitials(userName)}
                </div>
                <span className="text-white">{userName}</span>
              </li>
              <li>
                <Link to={userRole === 'doctor' ? '/doc' : '/pat'} className="text-white">
                  {userRole === 'doctor' ? 'Doctor Dashboard' : 'Patient Dashboard'}
                </Link>
              </li>
              <li>
                <button onClick={handleLogout} className="text-white">Logout</button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;