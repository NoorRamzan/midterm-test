

import React, { useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Doctor = () => {
  const [doctorDetails, setDoctorDetails] = useState({});
  const [schedule, setSchedule] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeSection, setActiveSection] = useState('details'); // Tracks active section
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [available, setAvailable] = useState(false);
  const [name, setName] = useState(''); // State for doctor's name
  const [specialization, setSpecialization] = useState(''); // State for specialization
  const [contactInfo, setContactInfo] = useState(''); // State for contact information
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setUserId(user.uid);
      } else {
        navigate('/login'); // Redirect to login if user is not authenticated
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (userId) {
      fetchDoctorDetails(userId);
      fetchSchedule(userId);
    }
  }, [userId]);

  const fetchDoctorDetails = async (id) => {
    const doctorDocRef = doc(db, 'doctors', id);
    const doctorDocSnapshot = await getDoc(doctorDocRef);
    
    if (doctorDocSnapshot.exists()) {
      const data = doctorDocSnapshot.data();
      setDoctorDetails(data);
      setName(data.name || ''); // Set initial name value
      setSpecialization(data.specialization || ''); // Set initial specialization value
      setContactInfo(data.contactInfo || ''); // Set initial contact info value
    } else {
      console.log("No such document!");
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

  const fetchAppointments = async (id) => {
    const appointmentsRef = collection(db, 'appointments'); // Assume appointments are stored in 'appointments' collection
    const q = query(appointmentsRef);
    
    onSnapshot(q, (snapshot) => {
      const appointmentsData = snapshot.docs
        .filter(doc => doc.data().doctorId === id) // Filter appointments for this doctor
        .map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(appointmentsData);
    });
  };

  const handleSaveDetails = async () => {
    if (!name || !specialization || !contactInfo) {
      alert("Please fill in all fields.");
      return;
    }

    // Save doctor details to Firestore
    const doctorDocRef = doc(db, 'doctors', userId);
    await setDoc(doctorDocRef, { name, specialization, contactInfo }, { merge: true });
    alert("Doctor details saved successfully.");
  };

  const handleSaveSlot = async () => {
    if (!startTime || !endTime) {
      alert("Please fill in all fields.");
      return;
    }
    
    const slotData = {
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      available,
    };
  
    // Use backticks for template literals
    await setDoc(doc(db, 'doctors', userId, 'schedule', `${Date.now()}`), slotData);
    
    setStartTime('');
    setEndTime('');
    setAvailable(false);
  };
  
  const handleShowAppointments = () => {
    fetchAppointments(userId); // Fetch appointments when section is active
  };

  return (
    <div>
      <h1>Doctor Dashboard</h1>
      <nav>
        <ul style={{ display: 'flex', listStyleType: 'none' }}>
          <li onClick={() => setActiveSection('details')} style={{ margin: '0 10px', cursor: 'pointer' }}>Details</li>
          <li onClick={() => { setActiveSection('schedule'); handleShowAppointments(); }} style={{ margin: '0 10px', cursor: 'pointer' }}>Schedule</li>
          <li onClick={() => { setActiveSection('appointments'); handleShowAppointments(); }} style={{ margin: '0 10px', cursor: 'pointer' }}>Appointments</li>
        </ul>
      </nav>

      {activeSection === 'details' && (
        <div>
          <h2>Your Details</h2>
          <label>
            Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            Specialization:
            <input
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
            />
          </label>
          <label>
            Contact Info:
            <input
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
            />
          </label>
          <button onClick={handleSaveDetails}>Save Details</button>
        </div>
      )}

      {activeSection === 'schedule' && (
        <div>
          <h2>Your Schedule</h2>
          <h3>Add Availability Slot</h3>
          <label>Start Time:</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <label>End Time:</label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
          <label>
            Available:
            <input
              type="checkbox"
              checked={available}
              onChange={() => setAvailable(!available)}
            />
          </label>
          <button onClick={handleSaveSlot}>Save Slot</button>

          <h3>Available Slots</h3>
          <ul>
            {schedule.map(slot => (
              <li key={slot.id}>
                {new Date(slot.startTime).toLocaleString()} - {new Date(slot.endTime).toLocaleString()} 
                {slot.available ? ' (Available)' : ' (Not Available)'}
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeSection === 'appointments' && (
        <div>
          <h3>Your Appointments</h3>
          <ul>
            {appointments.length > 0 ? (
              appointments.map(appointment => (
                <li key={appointment.id}>
                  Patient: {appointment.patientName} - {new Date(appointment.date).toLocaleString()} 
                  {appointment.notes && ` (Notes: ${appointment.notes})`}
                </li>
              ))
            ) : (
              <p>No appointments found.</p>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Doctor;