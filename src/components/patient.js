// src/pages/PatientDashboard.js
import React, { useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
  const [patientDetails, setPatientDetails] = useState({});
  const [name, setName] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [userId, setUserId] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [notes, setNotes] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [showAppointment, setShowAppointment] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        await fetchPatientDetails(user.uid);
        await fetchDoctors();
        await fetchAppointments(user.uid);
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchPatientDetails = async (id) => {
    const patientDocRef = doc(db, 'patients', id);
    const patientDocSnapshot = await getDoc(patientDocRef);

    if (patientDocSnapshot.exists()) {
      const data = patientDocSnapshot.data();
      setPatientDetails(data);
      setName(data.name || '');
      setContactDetails(data.contactDetails || '');
      setMedicalHistory(data.medicalHistory || '');
    } else {
      console.log("No such document!");
    }
  };

  const fetchDoctors = async () => {
    const doctorsRef = collection(db, 'doctors');
    const doctorSnapshot = await getDocs(doctorsRef);
    const doctorList = doctorSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setDoctors(doctorList);
  };

  const fetchAppointments = async (patientId) => {
    const appointmentsRef = collection(db, 'appointments');
    const appointmentSnapshot = await getDocs(appointmentsRef);
    const patientAppointments = appointmentSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(appointment => appointment.patientId === patientId);
    setAppointments(patientAppointments);
  };

  const handleSaveDetails = async () => {
    const patientDocRef = doc(db, 'patients', userId);
    await setDoc(patientDocRef, { name, contactDetails, medicalHistory }, { merge: true });
    alert("Patient details saved successfully.");
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId || !dateTime) {
      alert("Please select a doctor and choose a date/time.");
      return;
    }

    try {
      const appointmentDateTime = new Date(dateTime);
      if (isNaN(appointmentDateTime.getTime())) {
        throw new Error("Invalid date/time format. Please ensure it is correctly selected.");
      }

      const appointmentRef = collection(db, 'appointments');
      await addDoc(appointmentRef, {
        doctorId: selectedDoctorId,
        patientId: userId,
        dateTime: appointmentDateTime,
        notes,
      });
      alert('Appointment booked successfully!');
      clearAppointmentForm();
      await fetchAppointments(userId); // Refresh appointments
    } catch (error) {
      console.error("Error booking appointment: ", error);
      alert("Error booking appointment: " + error.message);
    }
  };

  const clearAppointmentForm = () => {
    setSelectedDoctorId('');
    setDateTime('');
    setNotes('');
  };

  const handleDeleteAppointment = async (appointmentId) => {
    const confirmed = window.confirm("Are you sure you want to delete this appointment?");
    if (confirmed) {
      await deleteDoc(doc(db, 'appointments', appointmentId));
      alert("Appointment deleted successfully!");
      await fetchAppointments(userId); // Refresh appointments
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <div className="flex flex-col items-center p-10 bg-gradient-to-r from-purple-100 to-indigo-200 min-h-screen">
      <h1 className="text-5xl font-extrabold mb-10 text-indigo-800">Patient Dashboard</h1>

      {/* Display patient details */}
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-600">Your Details</h2>
        <label className="block mb-2">
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
          />
        </label>
        <label className="block mb-2">
          Contact Details:
          <input
            type="text"
            value={contactDetails}
            onChange={(e) => setContactDetails(e.target.value)}
            className="w-full px-4 py-2 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
          />
        </label>
        <label className="block mb-2">
          Medical History:
          <textarea
            value={medicalHistory}
            onChange={(e) => setMedicalHistory(e.target.value)}
            className="w-full px-4 py-2 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
          />
        </label>
        <button
          onClick={handleSaveDetails}
          className="w-full py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition duration-200 mb-2"
        >
          Save Details
        </button>
      </div>

      {/* Button to toggle appointment form */}
      <button
        onClick={() => setShowAppointment(!showAppointment)}
        className="mb-4 py-2 px-4 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition duration-200"
      >
        {showAppointment ? "Hide Appointment Form" : "Book an Appointment"}
      </button>

      {/* Display appointment form */}
      {showAppointment && (
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-600">Book an Appointment</h2>
          <form onSubmit={handleBookAppointment}>
            <label className="block mb-2">
              Select Doctor:
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                required
                className="w-full px-4 py-2 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
              >
                <option value="">Select a doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} ({doctor.specialization})
                  </option>
                ))}
              </select>
            </label>
            <label className="block mb-2">
              Appointment Date & Time:
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                required
                className="w-full px-4 py-2 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
              />
            </label>
            <label className="block mb-2">
              Notes:
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
              />
            </label>
            <button
              type="submit"
              className="w-full py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition duration-200"
            >
              Book Appointment
            </button>
          </form>
        </div>
      )}

      {/* Appointments Table */}
      <div className="w-full max-w-3xl p-6 bg-white rounded-lg shadow-lg mt-6">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-600">Your Appointments</h2>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="border px-4 py-2">Doctor</th>
              <th className="border px-4 py-2">Date & Time</th>
              <th className="border px-4 py-2">Notes</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(appointment => (
              <tr key={appointment.id}>
                <td className="border px-4 py-2">{appointment.doctorId}</td>
                <td className="border px-4 py-2">{new Date(appointment.dateTime).toLocaleString()}</td>
                <td className="border px-4 py-2">{appointment.notes}</td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => handleDeleteAppointment(appointment.id)}
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

      <button
        onClick={handleLogout}
        className="mt-4 py-2 px-4 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition duration-200"
      >
        Logout
      </button>
    </div>
  );
};

export default PatientDashboard;
