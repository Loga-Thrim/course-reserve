"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { professorAuthAPI } from "../../../lib/professorApi";
import { FiLock, FiUser, FiBook } from "react-icons/fi";

export default function ProfessorLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem("professorToken");
    const user = localStorage.getItem("professorUser");
    
    if (token && user) {
      const parsedUser = JSON.parse(user);
      // Allow both professor and admin roles
      if (parsedUser.role === "professor" || parsedUser.role === "admin") {
        router.push("/professor/dashboard");
      }
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let response;
      let isAdminLogin = false;

      // Try PSRU login first (for professors)
      try {
        response = await professorAuthAPI.psruLogin({ username, password });
      } catch (psruError) {
        // If PSRU fails, try self-auth (for admin using email/password)
        // Check if username looks like an email
        if (username.includes("@")) {
          response = await professorAuthAPI.selfLogin({ email: username, password });
          isAdminLogin = true;
        } else {
          throw psruError; // Re-throw if not an email
        }
      }

      const { token, user } = response.data;

      // Check if user is professor or admin
      if (user.role !== "professor" && user.role !== "admin") {
        setError("คุณไม่มีสิทธิ์เข้าถึงระบบอาจารย์");
        setLoading(false);
        return;
      }

      localStorage.setItem("professorToken", token);
      localStorage.setItem("professorUser", JSON.stringify(user));
      router.push("/professor/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mb-4 shadow-lg">
            <FiBook className="text-3xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            ทรัพยากรสำรองรายวิชา
          </h1>
          <p className="text-emerald-50">Book Recommendation System</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-emerald-100">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6 text-center">
            เข้าสู่ระบบอาจารย์
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รหัสอาจารย์ / อีเมล
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field pl-10 w-full"
                  placeholder="รหัสอาจารย์ หรือ อีเมล"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รหัสผ่าน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 w-full"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 text-lg font-medium rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              อาจารย์: ใช้รหัสอาจารย์จากระบบห้องสมุด<br />
              ผู้ดูแล: ใช้อีเมลและรหัสผ่าน
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
