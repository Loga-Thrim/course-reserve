"use client";

import { useEffect, useState } from "react";
import ProfessorLayout from "../../../components/professor/ProfessorLayout";
import { professorCourseRegistrationAPI } from "../../../lib/professorApi";
import { FiEdit, FiTrash2, FiPlus, FiX, FiSearch } from "react-icons/fi";

export default function CourseRegistrationPage() {
  const [courses, setCourses] = useState([]);
  const [curriculums, setCurriculums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name_th: "",
    name_en: "",
    code_th: "",
    code_en: "",
    curriculum_th: "",
    curriculum_en: "",
    description_th: "",
    description_en: "",
    website: "",
    instructors: [""]
  });

  useEffect(() => {
    fetchCourses();
    fetchCurriculums();
  }, []);

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

  const fetchCurriculums = async () => {
    try {
      const response = await professorCourseRegistrationAPI.getCurriculums();
      setCurriculums(response.data);
    } catch (error) {
      console.error("Error fetching curriculums:", error);
    }
  };

  const handleCreate = () => {
    setModalMode("create");
    setSelectedCourse(null);
    setFormData({
      name_th: "",
      name_en: "",
      code_th: "",
      code_en: "",
      curriculum_th: "",
      curriculum_en: "",
      description_th: "",
      description_en: "",
      website: "",
      instructors: [""]
    });
    setShowModal(true);
  };

  const handleEdit = (course) => {
    setModalMode("edit");
    setSelectedCourse(course);
    const instructorNames = course.instructors && course.instructors.length > 0
      ? course.instructors.map(i => i.instructor_name)
      : [""];
    setFormData({
      name_th: course.name_th,
      name_en: course.name_en,
      code_th: course.code_th,
      code_en: course.code_en,
      curriculum_th: course.curriculum_th,
      curriculum_en: course.curriculum_en,
      description_th: course.description_th,
      description_en: course.description_en,
      website: course.website || "",
      instructors: instructorNames
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("ต้องการลบรายวิชานี้หรือไม่?")) return;

    try {
      await professorCourseRegistrationAPI.delete(id);
      fetchCourses();
    } catch (error) {
      alert("ไม่สามารถลบรายวิชาได้");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Filter out empty instructor names
      const submitData = {
        ...formData,
        instructors: formData.instructors.filter(i => i.trim() !== "")
      };

      if (modalMode === "create") {
        await professorCourseRegistrationAPI.create(submitData);
      } else {
        await professorCourseRegistrationAPI.update(selectedCourse.id, submitData);
      }
      setShowModal(false);
      fetchCourses();
      fetchCurriculums(); // Refresh curriculum suggestions
    } catch (error) {
      alert(error.response?.data?.error || "เกิดข้อผิดพลาด");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-fill corresponding curriculum field when one is selected
    if (name === "curriculum_th") {
      const matchingCurr = curriculums.find(c => c.curriculum_th === value);
      if (matchingCurr) {
        setFormData({
          ...formData,
          curriculum_th: value,
          curriculum_en: matchingCurr.curriculum_en
        });
        return;
      }
    } else if (name === "curriculum_en") {
      const matchingCurr = curriculums.find(c => c.curriculum_en === value);
      if (matchingCurr) {
        setFormData({
          ...formData,
          curriculum_en: value,
          curriculum_th: matchingCurr.curriculum_th
        });
        return;
      }
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Instructor handlers
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

  // Filter courses based on search query
  const filteredCourses = courses.filter(course => {
    const query = searchQuery.toLowerCase();
    return (
      course.name_th.toLowerCase().includes(query) ||
      course.name_en.toLowerCase().includes(query) ||
      course.code_th.toLowerCase().includes(query) ||
      course.code_en.toLowerCase().includes(query) ||
      course.curriculum_th.toLowerCase().includes(query) ||
      course.curriculum_en.toLowerCase().includes(query)
    );
  });

  return (
    <ProfessorLayout>
      <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">ลงทะเบียนรายวิชา</h1>
          <button onClick={handleCreate} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2.5 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap">
            <FiPlus /> เพิ่มรายวิชา
          </button>
        </div>

        {/* Search Filter */}
        <div className="mb-6">
          <div className="relative">
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

        {/* Courses Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-xl shadow-md p-12 text-center border border-emerald-100/50">
            <p className="text-gray-600 text-lg font-medium">ยังไม่มีรายวิชา</p>
            <p className="text-gray-400 mt-2">คลิก "เพิ่มรายวิชา" เพื่อเริ่มต้น</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-xl shadow-md p-12 text-center border border-emerald-100/50">
            <p className="text-gray-600 text-lg font-medium">ไม่พบรายวิชาที่ค้นหา</p>
            <p className="text-gray-400 mt-2">ลองค้นหาด้วยคำอื่น</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-gradient-to-br from-white to-emerald-50/30 rounded-xl shadow border border-emerald-100/50">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-0.5">
                        {course.code_th} - {course.name_th}
                      </h3>
                      <p className="text-gray-500 text-xs">
                        {course.code_en} - {course.name_en}
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

                  <div className="mb-2">
                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-full text-xs font-medium">{course.curriculum_th}</span>
                  </div>

                  {/* Display instructors */}
                  {course.instructors && course.instructors.length > 0 && (
                    <div className="mb-2">
                      <p className="text-gray-600 text-xs">
                        <span className="font-medium">อาจารย์ผู้สอน:</span>{" "}
                        {course.instructors.map(i => i.instructor_name).join(", ")}
                      </p>
                    </div>
                  )}

                  <div className="mb-2">
                    <p className="text-gray-600 text-xs line-clamp-2">{course.description_th}</p>
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
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
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
                  {/* Thai Name */}
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
                      placeholder="เช่น การเขียนโปรแกรมคอมพิวเตอร์"
                    />
                  </div>

                  {/* English Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อวิชา (อังกฤษ) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name_en"
                      required
                      value={formData.name_en}
                      onChange={handleInputChange}
                      className="input-field w-full"
                      placeholder="e.g. Computer Programming"
                    />
                  </div>

                  {/* Thai Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      รหัสวิชา (ไทย) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="code_th"
                      required
                      value={formData.code_th}
                      onChange={handleInputChange}
                      className="input-field w-full"
                      placeholder="เช่น วท102"
                    />
                  </div>

                  {/* English Code */}
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
                      placeholder="e.g. CS102"
                    />
                  </div>

                  {/* Thai Curriculum */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      หลักสูตร (ไทย) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="curriculum_th"
                      required
                      value={formData.curriculum_th}
                      onChange={handleInputChange}
                      list="curriculum-th-list"
                      className="input-field w-full"
                      placeholder="เช่น วิทยาศาสตร์คอมพิวเตอร์"
                    />
                    <datalist id="curriculum-th-list">
                      {curriculums.map((curr, index) => (
                        <option key={index} value={curr.curriculum_th} />
                      ))}
                    </datalist>
                  </div>

                  {/* English Curriculum */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      หลักสูตร (อังกฤษ) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="curriculum_en"
                      required
                      value={formData.curriculum_en}
                      onChange={handleInputChange}
                      list="curriculum-en-list"
                      className="input-field w-full"
                      placeholder="e.g. Computer Science"
                    />
                    <datalist id="curriculum-en-list">
                      {curriculums.map((curr, index) => (
                        <option key={index} value={curr.curriculum_en} />
                      ))}
                    </datalist>
                  </div>

                  {/* Instructors - Dynamic fields */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      อาจารย์ผู้สอน
                    </label>
                    <div className="space-y-2">
                      {formData.instructors.map((instructor, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={instructor}
                            onChange={(e) => handleInstructorChange(index, e.target.value)}
                            className="input-field flex-1"
                            placeholder="เช่น ผศ.ดร.สมชาย ใจดี"
                          />
                          {formData.instructors.length > 1 && (
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

                  {/* Thai Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      คำอธิบายรายวิชา (ไทย) <span className="text-red-500">*</span>
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
                      คำอธิบายรายวิชา (อังกฤษ) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description_en"
                      required
                      value={formData.description_en}
                      onChange={handleInputChange}
                      rows="4"
                      className="input-field w-full"
                      placeholder="Describe the course details..."
                    />
                  </div>

                  {/* Website */}
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
                  <button type="submit" className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200">
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
