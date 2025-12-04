"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { facultiesAPI } from "../../lib/api";
import { FiBook, FiMail, FiLock, FiUser } from "react-icons/fi";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [faculty, setFaculty] = useState("");
  const [faculties, setFaculties] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [facultiesLoading, setFacultiesLoading] = useState(true);

  const { register, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const response = await facultiesAPI.getAll();
        setFaculties(response.data);
      } catch (err) {
        console.error("Error fetching faculties:", err);
      } finally {
        setFacultiesLoading(false);
      }
    };

    fetchFaculties();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!faculty) {
      setError("กรุณาเลือกคณะ");
      return;
    }

    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setLoading(true);

    const result = await register(name, email, password, faculty);

    if (result.success) {
      router.push("/");
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>
      <div className="max-w-md w-full space-y-8 bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl animate-slide-up relative z-10 border border-emerald-100">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-5">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-4 rounded-xl shadow-xl float-animation">
              <FiBook className="text-white text-4xl" />
            </div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            สร้างบัญชีใหม่
          </h2>
          <p className="text-gray-600 text-sm">
            เริ่มต้นการเดินทางค้นพบหนังสือของคุณ
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                ชื่อ-นามสกุล
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field pl-10"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="faculty"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                คณะ
              </label>
              <select
                id="faculty"
                name="faculty"
                required
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="input-field"
                disabled={facultiesLoading}
              >
                <option value="">
                  {facultiesLoading ? "กำลังโหลด..." : "เลือกคณะ"}
                </option>
                {faculties.map((fac) => (
                  <option key={fac.id} value={fac.name}>
                    {fac.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                อีเมล
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                รหัสผ่าน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                ยืนยันรหัสผ่าน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base font-semibold"
            >
              {loading ? "กำลังสร้างบัญชี..." : "สมัครสมาชิก"}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              มีบัญชีอยู่แล้ว?{" "}
              <Link
                href="/login"
                className="font-medium text-emerald-600 hover:text-teal-600"
              >
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
