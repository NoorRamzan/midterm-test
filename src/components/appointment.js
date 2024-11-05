// src/pages/AppointmentPage.js
import React, { useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const AppointmentPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [patientId, setPatientId] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [notes, setNotes] = useState('');
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setUserId(user.uid);
        fetchAppointments(user.uid);
      } else {
        navigate('/login'); // Redirect to login if user is not authenticated
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchAppointments = async (userId) => {
    const appointmentsRef = collection(db, 'appointments');
    const q = query(appointmentsRef, where('patientId', '==', userId)); // Fetch appointments for the logged-in patient
    const querySnapshot = await getDocs(q);
    
    const fetchedAppointments = [];
    querySnapshot.forEach(doc => {
      fetchedAppointments.push({ id: doc.id, ...doc.data() });
    });
    
    setAppointments(fetchedAppointments);
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    try {
      const appointmentRef = collection(db, 'appointments');
      await addDoc(appointmentRef, {
        doctorId,
        patientId: userId,
        dateTime: new Date(dateTime),
        notes,
      });
      alert('Appointment created successfully!');
      fetchAppointments(userId); // Refresh the list of appointments
      clearForm();
    } catch (error) {
      console.error("Error creating appointment: ", error);
      alert("Error creating appointment: " + error.message);
    }
  };

  const clearForm = () => {
    setDoctorId('');
    setPatientId('');
    setDateTime('');
    setNotes('');
  };

  return (
    <div>
      <h1>Appointment Page</h1>
      <form onSubmit={handleCreateAppointment}>
        <div>
          <label>
            Doctor ID:
            <input
              type="text"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Patient ID:
            <input
              type="text"
              value={userId} // Auto-filled with the logged-in user's ID
              readOnly
            />
          </label>
        </div>
        <div>
          <label>
            Appointment Date & Time:
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Notes:
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </div>
        <button type="submit">Create Appointment</button>
      </form>
      
      <h2>Your Appointments</h2>
      <ul>
        {appointments.length > 0 ? appointments.map(appointment => (
          <li key={appointment.id}>
            <p>Doctor ID: {appointment.doctorId}</p>
            <p>Patient ID: {appointment.patientId}</p>
            <p>Date & Time: {appointment.dateTime.toDate().toString()}</p>
            <p>Notes: {appointment.notes}</p>
          </li>
        )) : (
          <p>No appointments found.</p>
        )}
      </ul>
    </div>
  );
};

export default AppointmentPage;
