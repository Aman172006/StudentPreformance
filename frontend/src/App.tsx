import { useState } from "react";

interface FormData {
  // categorical
  school: "GP" | "MS";
  sex: "M" | "F";
  internet: "yes" | "no";

  // numeric
  age: number;
  studytime: number; // 1..4
  failures: number;  // 0..3
  absences: number;  // 0..300

  // previous grades
  G1: number; // 0..20
  G2: number; // 0..20
}

interface PredictionResult {
  predicted_grade: number; // assume model returns final grade (0..20)
  timestamp: string;
  input: FormData;
}

const schools: FormData["school"][] = ["GP", "MS"];
const sexes: FormData["sex"][] = ["M", "F"];
const internetOptions: FormData["internet"][] = ["yes", "no"];

const initialFormData: FormData = {
  school: "GP",
  sex: "M",
  internet: "yes",
  age: 17,
  studytime: 2,
  failures: 0,
  absences: 4,
  G1: 12,
  G2: 14,
};

export function App() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<PredictionResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    const numericFields: (keyof FormData)[] = [
      "age",
      "studytime",
      "failures",
      "absences",
      "G1",
      "G2",
    ];

    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name as keyof FormData)
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // IMPORTANT: keys match StudentInput schema
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(
          text || "Failed to get prediction. Please try again."
        );
      }

      const data = await response.json();

      const result: PredictionResult = {
        ...data,
        timestamp: new Date().toISOString(),
        input: formData,
      };

      setPrediction(result);
      setHistory((prev) => [result, ...prev.slice(0, 9)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // grade is assumed 0..20 (student dataset style)
  const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

  const grade20ToPercent = (g20: number) => (clamp(g20, 0, 20) / 20) * 100;

  const getGradeColor = (grade20: number) => {
    // map to percent for color thresholds
    const pct = grade20ToPercent(grade20);
    if (pct >= 90) return "text-green-500";
    if (pct >= 80) return "text-blue-500";
    if (pct >= 70) return "text-yellow-500";
    if (pct >= 60) return "text-orange-500";
    return "text-red-500";
  };

  const getGradeLabel = (grade20: number) => {
    const pct = grade20ToPercent(grade20);
    if (pct >= 90) return "A+";
    if (pct >= 85) return "A";
    if (pct >= 80) return "B+";
    if (pct >= 75) return "B";
    if (pct >= 70) return "C+";
    if (pct >= 65) return "C";
    if (pct >= 60) return "D+";
    if (pct >= 55) return "D";
    return "F";
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
                <p className="text-sm text-gray-500">FastAPI schema-aligned predictor</p>
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
                  Student Input (Schema)
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* School */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      School
                    </label>
                    <select
                      name="school"
                      value={formData.school}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                      {schools.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">GP or MS</p>
                  </div>

                  {/* Sex */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sex
                    </label>
                    <select
                      name="sex"
                      value={formData.sex}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                      {sexes.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">M or F</p>
                  </div>

                  {/* Internet */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Internet
                    </label>
                    <select
                      name="internet"
                      value={formData.internet}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                      {internetOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">yes or no</p>
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  {/* Studytime (1..4) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Study Time (1–4)
                    </label>
                    <input
                      type="number"
                      name="studytime"
                      value={formData.studytime}
                      onChange={handleChange}
                      min={1}
                      max={4}
                      step={1}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      required
                    />
                    <div className="mt-2">
                      <input
                        type="range"
                        name="studytime"
                        value={formData.studytime}
                        onChange={handleChange}
                        min={1}
                        max={4}
                        step={1}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      1: &lt;2h, 2: 2–5h, 3: 5–10h, 4: &gt;10h (typical mapping)
                    </p>
                  </div>

                  {/* Failures */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Failures (0–3)
                    </label>
                    <input
                      type="number"
                      name="failures"
                      value={formData.failures}
                      onChange={handleChange}
                      min={0}
                      max={3}
                      step={1}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  {/* Absences */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Absences (0–300)
                    </label>
                    <input
                      type="number"
                      name="absences"
                      value={formData.absences}
                      onChange={handleChange}
                      min={0}
                      max={300}
                      step={1}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  {/* G1 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Test 1 (0–20)
                    </label>
                    <input
                      type="number"
                      name="G1"
                      value={formData.G1}
                      onChange={handleChange}
                      min={0}
                      max={20}
                      step={1}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      required
                    />
                    <div className="mt-2">
                      <input
                        type="range"
                        name="G1"
                        value={formData.G1}
                        onChange={handleChange}
                        min={0}
                        max={20}
                        step={1}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                  </div>

                  {/* G2 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Test 2(0–20)
                    </label>
                    <input
                      type="number"
                      name="G2"
                      value={formData.G2}
                      onChange={handleChange}
                      min={0}
                      max={20}
                      step={1}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      required
                    />
                    <div className="mt-2">
                      <input
                        type="range"
                        name="G2"
                        value={formData.G2}
                        onChange={handleChange}
                        min={0}
                        max={20}
                        step={1}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
                    <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Predicting...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Predict Grade
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-4 border border-gray-300 rounded-xl font-semibold text-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
                  >
                    Reset Form
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-8">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Prediction Result
                </h2>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600" />
                    <p className="mt-4 text-gray-600 font-medium">Analyzing data...</p>
                  </div>
                ) : prediction ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className={`text-6xl font-bold ${getGradeColor(prediction.predicted_grade)} mb-2`}>
                        {prediction.predicted_grade.toFixed(2)}
                      </div>
                      <div className="text-lg font-semibold text-gray-800">
                        out of 20 • Grade: {getGradeLabel(prediction.predicted_grade)}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        (~{grade20ToPercent(prediction.predicted_grade).toFixed(1)}%)
                      </div>
                    </div>

                    <div className="relative pt-6">
                      <div className="overflow-hidden h-4 bg-gray-200 rounded-full">
                        <div
                          className="h-full rounded-full transition-all duration-1000 bg-emerald-500"
                          style={{ width: `${grade20ToPercent(prediction.predicted_grade)}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-sm text-gray-600">
                        <span>0</span>
                        <span>10</span>
                        <span>20</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      <h3 className="font-semibold text-gray-700 mb-3">Input Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">School:</span>
                          <span className="font-medium text-gray-900">{prediction.input.school}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sex:</span>
                          <span className="font-medium text-gray-900">{prediction.input.sex}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Internet:</span>
                          <span className="font-medium text-gray-900">{prediction.input.internet}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Age:</span>
                          <span className="font-medium text-gray-900">{prediction.input.age}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Studytime:</span>
                          <span className="font-medium text-gray-900">{prediction.input.studytime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Failures:</span>
                          <span className="font-medium text-gray-900">{prediction.input.failures}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Absences:</span>
                          <span className="font-medium text-gray-900">{prediction.input.absences}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Test 1 /Test 2:</span>
                          <span className="font-medium text-gray-900">
                            {prediction.input.G1} / {prediction.input.G2}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center text-xs text-gray-500">
                      Predicted at {new Date(prediction.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">Enter student data to see predictions</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* History Section */}
        {showHistory && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Prediction History
              </h2>
            </div>
            <div className="p-6">
              {history.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No predictions yet. Make your first prediction!
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`text-2xl font-bold ${getGradeColor(item.predicted_grade)}`}>
                            {item.predicted_grade.toFixed(2)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {item.input.school} • {item.input.sex} • net:{item.input.internet}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(item.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            G1/G2: {item.input.G1}/{item.input.G2} • Abs: {item.input.absences}
                          </div>
                          <div className="text-xs text-gray-400">
                            Studytime: {item.input.studytime} • Failures: {item.input.failures}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500 text-sm">
            <p>Student Performance Predictor © 2024. Built with React & FastAPI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}