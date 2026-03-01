import { useState } from 'react';

interface FormData {
  studyTime: number;
  attendance: number;
  previousGPA: number;
  gender: string;
  gradeLevel: string;
  subject: string;
  tutoring: string;
  parentEducation: string;
}

interface PredictionResult {
  predicted_grade: number;
  timestamp: string;
  input: FormData;
}

const gradeLevels = ['9th', '10th', '11th', '12th'];
const subjects = ['Math', 'Science', 'English', 'History', 'Art'];
const genders = ['Male', 'Female', 'Other'];
const tutoringOptions = ['Yes', 'No'];
const parentEducation = ['High School', 'Bachelor\'s', 'Master\'s', 'PhD', 'Other'];

const initialFormData: FormData = {
  studyTime: 5,
  attendance: 80,
  previousGPA: 3.0,
  gender: 'Male',
  gradeLevel: '10th',
  subject: 'Math',
  tutoring: 'No',
  parentEducation: 'Bachelor\'s',
};

export function PredictionForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<PredictionResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'studyTime' || name === 'attendance' || name === 'previousGPA' 
        ? parseFloat(value) 
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to get prediction. Please try again.');
      }

      const data = await response.json();
      const result: PredictionResult = {
        ...data,
        timestamp: new Date().toISOString(),
        input: formData,
      };

      setPrediction(result);
      setHistory(prev => [result, ...prev.slice(0, 9)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-500';
    if (grade >= 80) return 'text-blue-500';
    if (grade >= 70) return 'text-yellow-500';
    if (grade >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  const getGradeLabel = (grade: number) => {
    if (grade >= 90) return 'A+';
    if (grade >= 85) return 'A';
    if (grade >= 80) return 'B+';
    if (grade >= 75) return 'B';
    if (grade >= 70) return 'C+';
    if (grade >= 65) return 'C';
    if (grade >= 60) return 'D+';
    if (grade >= 55) return 'D';
    return 'F';
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setPrediction(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Student Performance Predictor
                </h1>
                <p className="text-sm text-gray-500">AI-powered grade prediction system</p>
              </div>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-700 font-medium">History</span>
              {history.length > 0 && (
                <span className="bg-indigo-100 text-indigo-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {history.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Student Information
                </h2>
              </div>
               
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Study Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Study Time (hours/week)
                    </label>
                    <input
                      type="number"
                      name="studyTime"
                      value={formData.studyTime}
                      onChange={handleChange}
                      min="0"
                      max="168"
                      step="0.5"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      required
                    />
                    <div className="mt-2">
                      <input
                        type="range"
                        name="studyTime"
                        value={formData.studyTime}
                        onChange={handleChange}
                        min="0"
                        max="40"
                        step="0.5"
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Attendance */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Attendance (%)
                    </label>
                    <input
                      type="number"
                      name="attendance"
                      value={formData.attendance"
*** End Patch