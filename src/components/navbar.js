import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const fetchUserRole = async () => {
          const doctorDoc = await getDoc(doc(db, 'doctors', currentUser.uid));
          const patientDoc = await getDoc(doc(db, 'patients', currentUser.uid));

          if (doctorDoc.exists()) {
            setUserRole('doctor');
            setUserName(doctorDoc.data().name);
          } else if (patientDoc.exists()) {
            setUserRole('patient');
            setUserName(patientDoc.data().name);
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

  const getInitials = (name) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  return (
    <nav className="bg-indigo-700 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-white text-3xl font-bold">CheckUp</h1>
        <ul className="flex items-center space-x-6">
          {!user ? (
            <li>
              <Link to="/" className="text-white hover:underline transition duration-200">Login</Link>
            </li>
          ) : (
            <>
              <li className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full text-indigo-600 font-bold">
                  {getInitials(userName)}
                </div>
                <span className="text-white font-semibold">{userName}</span>
              </li>
              <li>
                <Link
                  to={userRole === 'doctor' ? '/doc' : '/pat'}
                  className="text-white bg-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-800 transition duration-200"
                >
                  {userRole === 'doctor' ? 'Doctor Dashboard' : 'Patient Dashboard'}
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="text-white bg-red-500 px-4 py-2 rounded-md hover:bg-red-600 transition duration-200"
                >
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;


