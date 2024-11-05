import React, { useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, onSnapshot, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
  const [doctorDetails, setDoctorDetails] = useState({});
  const [schedule, setSchedule] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeSection, setActiveSection] = useState('details');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [available, setAvailable] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDetailId, setCurrentDetailId] = useState(null);
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (userId) {
      fetchDoctorDetails(userId);
      fetchSchedule(userId);
      fetchAppointments(userId);
    }
  }, [userId]);

  const fetchDoctorDetails = async (id) => {
    const doctorDocRef = doc(db, 'doctors', id);
    const doctorDocSnapshot = await getDoc(doctorDocRef);
    
    if (doctorDocSnapshot.exists()) {
      const data = doctorDocSnapshot.data();
      setDoctorDetails(data);
      setName(data.name || '');
      setSpecialization(data.specialization || '');
      setContactInfo(data.contactInfo || '');
    }
  };

  const fetchSchedule = (id) => {
    const scheduleRef = collection(db, 'doctors', id, 'schedule');
    const q = query(scheduleRef);
    
    onSnapshot(q, (snapshot) => {
      const slots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSchedule(slots);
    });
  };

  const fetchAppointments = (id) => {
    const appointmentsRef = collection(db, 'appointments');
    const q = query(appointmentsRef, where('doctorId', '==', id));
    
    onSnapshot(q, (snapshot) => {
      const appointmentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(appointmentsData);
    });
  };

  const handleSaveSlot = async () => {
    if (!startTime || !endTime) {
      alert("Please fill in all fields.");
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      alert("Start time must be before end time.");
      return;
    }

    const slotData = {
      startTime,
      endTime,
      available,
    };

    try {
      await setDoc(doc(db, 'doctors', userId, 'schedule', `${Date.now()}`), slotData);
      setStartTime('');
      setEndTime('');
      setAvailable(false);
    } catch (error) {
      console.error("Error saving slot:", error);
      alert("Failed to save slot. Please try again.");
    }
  };

  const handleSaveDetails = async () => {
    if (!name || !specialization || !contactInfo) {
      alert("Please fill in all fields.");
      return;
    }

    const doctorDocRef = doc(db, 'doctors', userId);
    await setDoc(doctorDocRef, { name, specialization, contactInfo }, { merge: true });
    
    setDoctorDetails({
      ...doctorDetails,
      name,
      specialization,
      contactInfo
    });
    
    alert("Doctor details saved successfully.");
    setIsEditing(false);
    setCurrentDetailId(null); // Reset current detail ID
  };

  const handleEditDetail = (detail) => {
    setName(detail.name);
    setSpecialization(detail.specialization);
    setContactInfo(detail.contactInfo);
    setIsEditing(true);
    setCurrentDetailId(detail.id); // Set current detail ID for editing
  };

  const handleDeleteDetail = async (id) => {
    try {
      await deleteDoc(doc(db, 'doctors', userId));
      alert("Details deleted successfully.");
      setDoctorDetails({});
      setName('');
      setSpecialization('');
      setContactInfo('');
    } catch (error) {
      console.error("Error deleting detail:", error);
      alert("Failed to delete detail. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentDetailId(null);
    setName('');
    setSpecialization('');
    setContactInfo('');
  };

  const handleDeleteSlot = async (slotId) => {
    try {
      await deleteDoc(doc(db, 'doctors', userId, 'schedule', slotId));
      alert("Slot deleted successfully.");
    } catch (error) {
      console.error("Error deleting slot:", error);
      alert("Failed to delete slot. Please try again.");
    }
  };

  const formatDate = (timestamp) => {
    if (timestamp) {
      const date = new Date(timestamp.seconds * 1000); // Firestore timestamp
      return date.toLocaleString(); // Format as needed
    }
    return 'Invalid Date';
  };

  return (
    <div className="flex flex-col items-center p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-extrabold text-blue-600 mb-6">Doctor Dashboard</h1>
      <nav className="mb-8">
        <ul className="flex space-x-8">
          <li 
            onClick={() => setActiveSection('details')} 
            className={`cursor-pointer hover:underline ${activeSection === 'details' ? 'font-semibold text-blue-600 border-b-2 border-blue-600' : 'text-gray-700'}`}
          >
            Details
          </li>
          <li 
            onClick={() => setActiveSection('schedule')} 
            className={`cursor-pointer hover:underline ${activeSection === 'schedule' ? 'font-semibold text-blue-600 border-b-2 border-blue-600' : 'text-gray-700'}`}
          >
            Schedule
          </li>
          <li 
            onClick={() => setActiveSection('appointments')} 
            className={`cursor-pointer hover:underline ${activeSection === 'appointments' ? 'font-semibold text-blue-600 border-b-2 border-blue-600' : 'text-gray-700'}`}
          >
            Appointments
          </li>
        </ul>
      </nav>

      {activeSection === 'details' && (
  <div className="w-full max-w-xl p-6 bg-white rounded-lg shadow-lg">
    <h2 className="text-2xl font-bold text-blue-600 mb-4">Your Details</h2>
    {isEditing ? (
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="py-3 px-6 border-b text-blue-600">Field</th>
            <th className="py-3 px-6 border-b text-blue-600">Value</th>
            <th className="py-3 px-6 border-b text-blue-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-3 px-6 border-b">Name</td>
            <td className="py-3 px-6 border-b">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </td>
            <td className="py-3 px-6 border-b">
              <button 
                onClick={handleSaveDetails} 
                className="text-blue-600 hover:underline"
              >
                Save
              </button>
              <button 
                onClick={handleCancelEdit} 
                className="text-red-600 hover:underline ml-2"
              >
                Cancel
              </button>
            </td>
          </tr>
          <tr>
            <td className="py-3 px-6 border-b">Specialization</td>
            <td className="py-3 px-6 border-b">
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </td>
            <td className="py-3 px-6 border-b" />
          </tr>
          <tr>
            <td className="py-3 px-6 border-b">Contact Info</td>
            <td className="py-3 px-6 border-b">
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </td>
            <td className="py-3 px-6 border-b" />
          </tr>
        </tbody>
      </table>
    ) : (
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="py-3 px-6 border-b text-blue-600">Field</th>
            <th className="py-3 px-6 border-b text-blue-600">Value</th>
            <th className="py-3 px-6 border-b text-blue-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-3 px-6 border-b">Name</td>
            <td className="py-3 px-6 border-b">{doctorDetails.name}</td>
            <td className="py-3 px-6 border-b">
              <button 
                onClick={() => handleEditDetail(doctorDetails)} 
                className="text-blue-600 hover:underline"
              >
                Edit
              </button>
            </td>
          </tr>
          <tr>
            <td className="py-3 px-6 border-b">Specialization</td>
            <td className="py-3 px-6 border-b">{doctorDetails.specialization}</td>
            <td className="py-3 px-6 border-b">
              <button 
                onClick={() => handleEditDetail(doctorDetails)} 
                className="text-blue-600 hover:underline"
              >
                Edit
              </button>
            </td>
          </tr>
          <tr>
            <td className="py-3 px-6 border-b">Contact Info</td>
            <td className="py-3 px-6 border-b">{doctorDetails.contactInfo}</td>
            <td className="py-3 px-6 border-b">
              <button 
                onClick={() => handleEditDetail(doctorDetails)} 
                className="text-blue-600 hover:underline"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDeleteDetail(doctorDetails.id)} 
                className="text-red-600 hover:underline ml-2"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    )}
  </div>
)}


      {activeSection === 'schedule' && (
        <div className="w-full max-w-3xl p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold text-blue-500 mb-4">Schedule Time Slots</h3>
          <label className="block mb-3">
            <span className="text-gray-700">Start Time:</span>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="block mb-3">
            <span className="text-gray-700">End Time:</span>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="block mb-3">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
              className="mr-2"
            />
            <span className="text-gray-700">Available</span>
          </label>
          <button 
            onClick={handleSaveSlot} 
            className="w-full py-2 mt-4 font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition duration-200 shadow-md"
          >
            Save Slot
          </button>

          <h4 className="text-lg font-semibold text-blue-600 mt-6 mb-3">Scheduled Slots:</h4>
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Start Time</th>
                <th className="py-2 px-4 border-b">End Time</th>
                <th className="py-2 px-4 border-b">Available</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((slot) => (
                <tr key={slot.id}>
                  <td className="py-2 px-4 border-b">{formatDate(slot.startTime)}</td>
                  <td className="py-2 px-4 border-b">{formatDate(slot.endTime)}</td>
                  <td className="py-2 px-4 border-b">{slot.available ? 'Yes' : 'No'}</td>
                  <td className="py-2 px-4 border-b">
                    <button 
                      onClick={() => handleDeleteSlot(slot.id)} 
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeSection === 'appointments' && (
        <div className="w-full max-w-3xl p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold text-blue-500 mb-4">Your Appointments</h3>
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Patient Name</th>
                <th className="py-2 px-4 border-b">Appointment Time</th>
                <th className="py-2 px-4 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td className="py-2 px-4 border-b">{appointment.patientName}</td>
                  <td className="py-2 px-4 border-b">{formatDate(appointment.appointmentTime)}</td>
                  <td className="py-2 px-4 border-b">{appointment.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;



