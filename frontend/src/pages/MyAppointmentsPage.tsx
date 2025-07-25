import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";
import PageLayout from "../layout/PageLayout";

interface Doctor {
  _id: string;
  name: string;
  profilePicture?: string;
  professionalInfo?: {
    specialization?: string;
  };
}

interface Appointment {
  _id: string;
  doctorId: Doctor;
  appointmentDate: string;
  appointmentTime: string;
  status?: string;
}

const MyAppointmentsPage: React.FC = () => {
  const [list, setList] = useState<Appointment[]>([]);
  const token = localStorage.getItem("token");
  const userId = token ? (jwtDecode(token) as any).id : null;

  useEffect(() => {
    fetchAppointments();
  }, [userId, token]);

  const fetchAppointments = () => {
    if (!userId || !token) return;

    axios
      .get(`${import.meta.env.VITE_API_URL}/api/appointments/patient/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.success) {
          // Filter future appointments only
          const futureAppointments = res.data.appointments.filter((a: Appointment) =>
            new Date(a.appointmentDate) >= new Date()
          );
          setList(futureAppointments);
        } else {
          setList([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching appointments:", err);
        setList([]);
      });
  };

  const handleCancel = async (appointmentId: string) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      const res = await axios.delete(`${import.meta.env.VITE_API_URL}/api/appointments/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setList((prev) => prev.filter((a) => a._id !== appointmentId));
      } else {
        alert("Failed to cancel appointment.");
      }
    } catch (error) {
      console.error("Cancel error:", error);
      alert("An error occurred while canceling.");
    }
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto p-6 mt-6 bg-white shadow rounded">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-700">My Upcoming Appointments</h2>
          <Link to="/appointment-history" className="text-indigo-600 underline text-sm">
            View History →
          </Link>
        </div>
        {list.length === 0 ? (
          <p className="text-center text-gray-500">No upcoming appointments.</p>
        ) : (
          list.map((a) => (
            <div
              key={a._id}
              className="flex items-center gap-4 border p-4 mb-4 rounded justify-between"
            >
              <div className="flex items-center gap-4">
                <img
                  src={
                    a.doctorId?.profilePicture
                      ? `${import.meta.env.VITE_API_URL}/uploads/${a.doctorId.profilePicture}`
                      : "/default-doctor.jpg"
                  }
                  className="w-16 h-16 rounded-full object-cover"
                  alt="Doctor"
                  onError={(e) => {
                    e.currentTarget.src = "/default-doctor.jpg";
                  }}
                />
                <div>
                  <p className="font-semibold">
                    Dr. {a.doctorId?.name || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {a.doctorId?.professionalInfo?.specialization || "Specialization N/A"}
                  </p>
                  <p className="text-sm">
                    {new Date(a.appointmentDate).toLocaleDateString()} &nbsp;|&nbsp;{" "}
                    {a.appointmentTime}
                  </p>
                  <p className="text-sm font-medium">
                    {a.status || "Scheduled"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleCancel(a._id)}
                className="text-red-600 border border-red-600 px-4 py-2 rounded hover:bg-red-50 transition text-sm"
              >
                Cancel
              </button>
            </div>
          ))
        )}
      </div>
    </PageLayout>
  );
};

export default MyAppointmentsPage;
