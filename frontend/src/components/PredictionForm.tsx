import React, { useState } from 'react';

type FormData = {
  sex: string;        // 'M' or 'F'
  age: number;
  studytime: number;  // 1..4
  failures: number;
  internet: string;   // 'yes' | 'no'
  absences: number;
  G1: number;
  G2: number;
};

type PredictionResult = { predicted_grade: number };

const initialFormData: FormData = {
  sex: 'M',
  age: 16,
  studytime: 2,
  failures: 0,
  internet: 'yes',
  absences: 0,
  G1: 10,
  G2: 11,
};

export default function PredictionForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<PredictionResult & { timestamp: string }>>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['age','studytime','failures','absences','G1','G2'].includes(name) ? Number(value) : value,
    } as unknown as FormData));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const resp = await fetch('http://192.168.1.23:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!resp.ok) throw new Error(`Server returned ${resp.status}`);
      const data: PredictionResult = await resp.json();
      const timestamp = new Date().toISOString();
      setPrediction(data);
      setHistory(prev => [{ ...data, timestamp }, ...prev].slice(0, 10));
    } catch (err: any) {
      setError(err?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Student Performance Predictor</h1>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              Sex
              <select name="sex" value={formData.sex} onChange={handleChange} className="w-full border p-2 mt-1">
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </label>

            <label className="block">
              Age
              <input type="number" name="age" value={formData.age} onChange={handleChange} min={10} max={22} className="w-full border p-2 mt-1" />
            </label>

            <label className="block">
              Study Time (1-4)
              <select name="studytime" value={formData.studytime} onChange={handleChange} className="w-full border p-2 mt-1">
                <option value={1}>1 (&lt;2 hrs)</option>
                <option value={2}>2 (2-5 hrs)</option>
                <option value={3}>3 (5-10 hrs)</option>
                <option value={4}>4 (&gt;10 hrs)</option>
              </select>
            </label>

            <label className="block">
              Failures
              <input type="number" name="failures" value={formData.failures} onChange={handleChange} min={0} max={10} className="w-full border p-2 mt-1" />
            </label>

            <label className="block">
              Internet Access
              <select name="internet" value={formData.internet} onChange={handleChange} className="w-full border p-2 mt-1">
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>

            <label className="block">
              Absences
              <input type="number" name="absences" value={formData.absences} onChange={handleChange} min={0} max={100} className="w-full border p-2 mt-1" />
            </label>

            <label className="block">
              G1 (first period grade)
              <input type="number" name="G1" value={formData.G1} onChange={handleChange} min={0} max={20} className="w-full border p-2 mt-1" />
            </label>

            <label className="block">
              G2 (second period grade)
              <input type="number" name="G2" value={formData.G2} onChange={handleChange} min={0} max={20} className="w-full border p-2 mt-1" />
            </label>
          </div>

          {error && <div className="text-red-600">{error}</div>}

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded">
              {loading ? 'Predicting...' : 'Get Prediction'}
            </button>
            <button type="button" onClick={() => { setFormData(initialFormData); setPrediction(null); setError(null); }} className="px-4 py-2 border rounded">Reset</button>
          </div>
        </form>

        {prediction && (
          <div className="mt-6 p-4 bg-white rounded shadow">
            <div className="text-3xl font-bold">Predicted Grade: {prediction.predicted_grade.toFixed(1)}</div>
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-6">
            <h2 className="font-semibold mb-2">History</h2>
            <ul className="space-y-2">
              {history.map((h, i) => (
                <li key={i} className="bg-white p-2 rounded shadow">{h.predicted_grade.toFixed(1)} — {new Date(h.timestamp).toLocaleString()}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
