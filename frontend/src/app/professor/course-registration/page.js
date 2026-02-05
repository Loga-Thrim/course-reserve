"use client";

import { useEffect, useState } from "react";
import ProfessorLayout from "../../../components/professor/ProfessorLayout";
import { professorCourseRegistrationAPI } from "../../../lib/professorApi";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiX,
  FiSearch,
  FiUpload,
  FiFile,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { BASE_PATH } from "../../../lib/basePath";

export default function CourseRegistrationPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("professorUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);
  const [courses, setCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [curriculums, setCurriculums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [courseFiles, setCourseFiles] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [formData, setFormData] = useState({
    faculty_id: "",
    curriculum_id: "",
    code_th: "",
    code_en: "",
    name_th: "",
    name_en: "",
    instructors: [""],
    description_th: "",
    description_en: "",
    keywords: [""],
    website: "",
  });

  useEffect(() => {
    fetchCourses();
    fetchFaculties();
  }, []);

  useEffect(() => {
    if (formData.faculty_id) {
      fetchCurriculums(formData.faculty_id);
    } else {
      setCurriculums([]);
    }
  }, [formData.faculty_id]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await professorCourseRegistrationAPI.getAll();
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculties = async () => {
    try {
      const response = await professorCourseRegistrationAPI.getFaculties();
      setFaculties(response.data);
    } catch (error) {
      console.error("Error fetching faculties:", error);
    }
  };

  const fetchCurriculums = async (facultyId) => {
    try {
      const response =
        await professorCourseRegistrationAPI.getCurriculums(facultyId);
      setCurriculums(response.data);
    } catch (error) {
      console.error("Error fetching curriculums:", error);
    }
  };

  const handleCreate = () => {
    setModalMode("create");
    setSelectedCourse(null);
    setCourseFiles([]);
    setPendingFiles([]);
    setFormData({
      faculty_id: "",
      curriculum_id: "",
      code_th: "",
      code_en: "",
      name_th: "",
      name_en: "",
      instructors: user?.name
        ? [user.name]
        : [
            JSON.parse(localStorage.getItem("professorUser") || "{}")?.name ||
              "",
          ],
      description_th: "",
      description_en: "",
      keywords: [""],
      website: "",
    });
    setShowModal(true);
  };

  const handleEdit = (course) => {
    setModalMode("edit");
    setSelectedCourse(course);
    const instructorNames =
      course.instructors && course.instructors.length > 0
        ? course.instructors.map((i) => i.instructor_name)
        : [""];
    setFormData({
      faculty_id: course.faculty_id || "",
      curriculum_id: course.curriculum_id || "",
      code_th: course.code_th || "",
      code_en: course.code_en || "",
      name_th: course.name_th || "",
      name_en: course.name_en || "",
      instructors: instructorNames,
      description_th: course.description_th || "",
      description_en: course.description_en || "",
      keywords: course.keywords?.length > 0 ? course.keywords : [""],
      website: course.website || "",
    });
    if (course.faculty_id) {
      fetchCurriculums(course.faculty_id);
    }
    fetchCourseFiles(course.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("ต้องการลบรายวิชานี้หรือไม่?")) return;

    try {
      await professorCourseRegistrationAPI.delete(id);
      fetchCourses();
    } catch (error) {
      toast.error("ไม่สามารถลบรายวิชาได้");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: ต้องใส่ชื่อวิชาภาษาไทย
    if (!formData.name_th?.trim()) {
      toast.error("กรุณาระบุชื่อวิชา (ภาษาไทย)");
      return;
    }

    // Validation: ต้องมีอาจารย์ผู้สอนอย่างน้อย 1 คน
    const validInstructors = formData.instructors.filter(
      (i) => i.trim() !== "",
    );
    if (validInstructors.length === 0) {
      toast.error("กรุณาระบุอาจารย์ผู้สอนอย่างน้อย 1 คน");
      return;
    }

    try {
      const submitData = {
        ...formData,
        instructors: validInstructors,
        keywords: formData.keywords.filter((k) => k.trim() !== ""),
      };

      if (modalMode === "create") {
        const response =
          await professorCourseRegistrationAPI.create(submitData);
        const newCourseId = response.data.id;

        if (pendingFiles.length > 0 && newCourseId) {
          for (const file of pendingFiles) {
            try {
              await professorCourseRegistrationAPI.uploadFile(
                newCourseId,
                file,
              );
            } catch (err) {
              console.error("Error uploading file:", err);
            }
          }
          setPendingFiles([]);
        }

        toast.success("สร้างรายวิชาสำเร็จ");
      } else {
        await professorCourseRegistrationAPI.update(
          selectedCourse.id,
          submitData,
        );
        toast.success("บันทึกการแก้ไขสำเร็จ");
      }
      setShowModal(false);
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.error || "เกิดข้อผิดพลาด");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleInstructorChange = (index, value) => {
    const newInstructors = [...formData.instructors];
    newInstructors[index] = value;
    setFormData({ ...formData, instructors: newInstructors });
  };

  const addInstructor = () => {
    setFormData({ ...formData, instructors: [...formData.instructors, ""] });
  };

  const removeInstructor = (index) => {
    if (formData.instructors.length > 1) {
      const newInstructors = formData.instructors.filter((_, i) => i !== index);
      setFormData({ ...formData, instructors: newInstructors });
    }
  };

  const handleKeywordChange = (index, value) => {
    const newKeywords = [...formData.keywords];
    newKeywords[index] = value;
    setFormData({ ...formData, keywords: newKeywords });
  };

  const addKeyword = () => {
    setFormData({ ...formData, keywords: [...formData.keywords, ""] });
  };

  const removeKeyword = (index) => {
    if (formData.keywords.length > 1) {
      const newKeywords = formData.keywords.filter((_, i) => i !== index);
      setFormData({ ...formData, keywords: newKeywords });
    }
  };

  const fetchCourseFiles = async (courseId) => {
    try {
      const response = await professorCourseRegistrationAPI.getFiles(courseId);
      setCourseFiles(response.data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("ไฟล์ที่อนุญาต: PDF, Word, PowerPoint, Excel เท่านั้น");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("ขนาดไฟล์ต้องไม่เกิน 10MB");
      e.target.value = "";
      return;
    }

    if (modalMode === "create") {
      setPendingFiles((prev) => [...prev, file]);
      toast.success("เพิ่มไฟล์แล้ว (จะอัปโหลดเมื่อบันทึกรายวิชา)");
      e.target.value = "";
      return;
    }

    try {
      setUploadingFile(true);
      await professorCourseRegistrationAPI.uploadFile(selectedCourse.id, file);
      toast.success("อัปโหลดไฟล์สำเร็จ");
      fetchCourseFiles(selectedCourse.id);
    } catch (error) {
      toast.error(error.response?.data?.error || "อัปโหลดไฟล์ไม่สำเร็จ");
    } finally {
      setUploadingFile(false);
      e.target.value = "";
    }
  };

  const removePendingFile = (index) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteFile = async (fileId) => {
    if (!confirm("ต้องการลบไฟล์นี้หรือไม่?")) return;

    try {
      await professorCourseRegistrationAPI.deleteFile(
        selectedCourse.id,
        fileId,
      );
      toast.success("ลบไฟล์สำเร็จ");
      fetchCourseFiles(selectedCourse.id);
    } catch (error) {
      toast.error("ลบไฟล์ไม่สำเร็จ");
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    if (fileType.includes("powerpoint") || fileType.includes("presentation"))
      return "📊";
    if (fileType.includes("excel") || fileType.includes("spreadsheet"))
      return "📈";
    return "📁";
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const filteredCourses = courses.filter((course) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (course.name_th || "").toLowerCase().includes(query) ||
      (course.name_en || "").toLowerCase().includes(query) ||
      (course.code_th || "").toLowerCase().includes(query) ||
      (course.code_en || "").toLowerCase().includes(query);

    return matchesSearch;
  });

  return (
    <ProfessorLayout>
      <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            ลงทะเบียนรายวิชา
          </h1>
          <button
            onClick={handleCreate}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2.5 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <FiPlus /> เพิ่มรายวิชา
          </button>
        </div>

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400" />
              <input
                type="text"
                placeholder="ค้นหารายวิชา (ชื่อวิชา, รหัสวิชา, หลักสูตร)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-emerald-100 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-xl shadow-md p-12 text-center border border-emerald-100/50">
            <p className="text-gray-600 text-lg font-medium">ยังไม่มีรายวิชา</p>
            <p className="text-gray-400 mt-2">
              คลิก "เพิ่มรายวิชา" เพื่อเริ่มต้น
            </p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-xl shadow-md p-12 text-center border border-emerald-100/50">
            <p className="text-gray-600 text-lg font-medium">
              ไม่พบรายวิชาที่ค้นหา
            </p>
            <p className="text-gray-400 mt-2">ลองค้นหาด้วยคำอื่น</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-gradient-to-br from-white to-emerald-50/30 rounded-xl shadow border border-emerald-100/50"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-0.5">
                        <a
                          href={`${BASE_PATH}/professor/course-books?courseId=${course.id}`}
                          className="text-emerald-600 hover:text-emerald-700 hover:underline"
                        >
                          {course.code_en || course.code_th}
                        </a>
                        {" - "}
                        {course.name_th}
                      </h3>
                      <p className="text-gray-500 text-xs">
                        {course.code_th && course.code_en ? course.code_th : ""}{" "}
                        {course.name_en ? `- ${course.name_en}` : ""}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => handleEdit(course)}
                        className="p-1.5 text-emerald-600 hover:text-emerald-700 rounded-lg transition-colors"
                      >
                        <FiEdit className="text-base" />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="p-1.5 text-red-600 hover:text-red-700 rounded-lg transition-colors"
                      >
                        <FiTrash2 className="text-base" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-2 flex flex-wrap gap-1">
                    {course.faculty_name && (
                      <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {course.faculty_name}
                      </span>
                    )}
                    {course.curriculum_name && (
                      <span className="inline-block px-2 py-0.5 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-full text-xs font-medium">
                        {course.curriculum_name}
                        {course.curriculum_level &&
                        !course.curriculum_name?.includes("ศึกษาทั่วไป")
                          ? ` (${course.curriculum_level})`
                          : ""}
                      </span>
                    )}
                  </div>

                  {/* Display instructors */}
                  {course.instructors && course.instructors.length > 0 && (
                    <div className="mb-2">
                      <p className="text-gray-600 text-xs">
                        <span className="font-medium">อาจารย์ผู้สอน:</span>{" "}
                        {course.instructors
                          .map((i) => i.instructor_name)
                          .join(", ")}
                      </p>
                    </div>
                  )}

                  <div className="mb-2">
                    <p className="text-gray-600 text-xs line-clamp-2">
                      {course.description_th}
                    </p>
                  </div>

                  {course.website && (
                    <div className="mt-2 pt-2 border-t border-emerald-100">
                      <a
                        href={course.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-teal-600 hover:underline text-xs flex items-center gap-1 transition-colors"
                      >
                        🔗 {course.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center border-b border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {modalMode === "create" ? "เพิ่มรายวิชาใหม่" : "แก้ไขรายวิชา"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all"
                >
                  <FiX className="text-xl sm:text-2xl" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* 1. Faculty */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      คณะ <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="faculty_id"
                      required
                      value={formData.faculty_id}
                      onChange={handleInputChange}
                      className="input-field w-full"
                    >
                      <option value="">เลือกคณะ</option>
                      {faculties
                        .filter((f) => !f.name?.includes("กองบริการศึกษา"))
                        .map((faculty) => (
                          <option key={faculty.id} value={faculty.id}>
                            {faculty.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* 2. Curriculum */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      หลักสูตร <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="curriculum_id"
                      required
                      value={formData.curriculum_id}
                      onChange={handleInputChange}
                      className="input-field w-full"
                      disabled={!formData.faculty_id}
                    >
                      <option value="">เลือกหลักสูตร</option>
                      {curriculums.map((curriculum) => (
                        <option key={curriculum.id} value={curriculum.id}>
                          {curriculum.name}
                          {curriculum.level &&
                          !curriculum.name?.includes("ศึกษาทั่วไป")
                            ? ` (${curriculum.level})`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 3. English Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      รหัสวิชา (อังกฤษ) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="code_en"
                      required
                      value={formData.code_en}
                      onChange={handleInputChange}
                      className="input-field w-full"
                      placeholder="example CS102"
                    />
                  </div>

                  {/* Thai Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      รหัสวิชา (ไทย)
                    </label>
                    <input
                      type="text"
                      name="code_th"
                      value={formData.code_th}
                      onChange={handleInputChange}
                      className="input-field w-full"
                      placeholder="ตัวอย่าง วท102"
                    />
                  </div>

                  {/* 4. Thai Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อวิชา (ไทย) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name_th"
                      required
                      value={formData.name_th}
                      onChange={handleInputChange}
                      className="input-field w-full"
                      placeholder="ตัวอย่าง การเขียนโปรแกรมคอมพิวเตอร์"
                    />
                  </div>

                  {/* English Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อวิชา (อังกฤษ)
                    </label>
                    <input
                      type="text"
                      name="name_en"
                      value={formData.name_en}
                      onChange={handleInputChange}
                      className="input-field w-full"
                      placeholder="example Computer Programming"
                    />
                  </div>

                  {/* 5. Instructors - Dynamic fields */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      อาจารย์ผู้สอน <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {formData.instructors.map((instructor, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={instructor}
                            onChange={(e) =>
                              handleInstructorChange(index, e.target.value)
                            }
                            className={`input-field flex-1 ${index === 0 ? "bg-gray-100" : ""}`}
                            placeholder="ตัวอย่าง ผศ.ดร.สมชาย ใจดี"
                            required={index === 0}
                            disabled={index === 0}
                          />
                          {formData.instructors.length > 1 && index !== 0 && (
                            <button
                              type="button"
                              onClick={() => removeInstructor(index)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <FiX className="text-lg" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addInstructor}
                        className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium mt-2"
                      >
                        <FiPlus className="text-base" />
                        เพิ่มอาจารย์ผู้สอน
                      </button>
                    </div>
                  </div>

                  {/* 6. Thai Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      คำอธิบายรายวิชา (ไทย){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description_th"
                      required
                      value={formData.description_th}
                      onChange={handleInputChange}
                      rows="4"
                      className="input-field w-full"
                      placeholder="อธิบายรายละเอียดของรายวิชา..."
                    />
                  </div>

                  {/* English Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      คำอธิบายรายวิชา (อังกฤษ)
                    </label>
                    <textarea
                      name="description_en"
                      value={formData.description_en}
                      onChange={handleInputChange}
                      rows="4"
                      className="input-field w-full"
                      placeholder="Describe the course details..."
                    />
                  </div>

                  {/* 7. Keywords - Dynamic fields */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      คีย์เวิร์ด
                    </label>
                    <div className="space-y-2">
                      {formData.keywords.map((keyword, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={keyword}
                            onChange={(e) =>
                              handleKeywordChange(index, e.target.value)
                            }
                            className="input-field flex-1"
                            placeholder="ตัวอย่าง การเขียนโปรแกรม, Python, Algorithm"
                          />
                          {formData.keywords.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeKeyword(index)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <FiX className="text-lg" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addKeyword}
                        className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium mt-2"
                      >
                        <FiPlus className="text-base" />
                        เพิ่มคีย์เวิร์ด
                      </button>
                    </div>
                  </div>

                  {/* 8. File Upload */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ไฟล์ประกอบการสอน
                    </label>

                    <div className="space-y-3">
                      {/* Upload area */}
                      <label className="block border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-emerald-400 transition-colors cursor-pointer">
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                          className="hidden"
                          disabled={uploadingFile}
                        />
                        {uploadingFile ? (
                          <div className="flex items-center justify-center gap-2 text-emerald-600">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-500 border-t-transparent"></div>
                            <span>กำลังอัปโหลด...</span>
                          </div>
                        ) : (
                          <>
                            <FiUpload className="mx-auto text-2xl text-gray-400 mb-1" />
                            <p className="text-sm text-gray-500">
                              คลิกเพื่ออัปโหลดไฟล์
                            </p>
                            <p className="text-xs text-gray-400">
                              PDF, Word, PowerPoint, Excel (สูงสุด 10MB)
                            </p>
                          </>
                        )}
                      </label>

                      {/* Pending files (for new course) */}
                      {modalMode === "create" && pendingFiles.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs text-amber-600 font-medium">
                            ไฟล์ที่รอการอัปโหลด:
                          </p>
                          {pendingFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-amber-50 rounded-lg px-3 py-2"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-lg">
                                  {getFileIcon(file.type)}
                                </span>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-gray-700 truncate">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {formatFileSize(file.size)}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removePendingFile(index)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <FiTrash2 className="text-sm" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Existing files (for edit mode) */}
                      {modalMode === "edit" && courseFiles.length > 0 && (
                        <div className="space-y-2">
                          {courseFiles.map((file) => (
                            <div
                              key={file.id}
                              className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-lg">
                                  {getFileIcon(file.file_type)}
                                </span>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-gray-700 truncate">
                                    {file.original_name}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {formatFileSize(file.file_size)}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteFile(file.id)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <FiTrash2 className="text-sm" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 9. Website */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เว็บไซต์สำหรับศึกษาเพิ่มเติม
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="input-field w-full"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
                  >
                    {modalMode === "create" ? "สร้างรายวิชา" : "บันทึกการแก้ไข"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProfessorLayout>
  );
}
