import { Link } from 'react-router-dom';
import { Brain, TrendingUp, Users } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
          Empower Student Success with <span className="text-indigo-600">AI Predictions</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10">
          Our advanced machine learning model helps educators and parents identify potential challenges early, enabling proactive support for better academic outcomes.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <Brain className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Accurate Prediction</h3>
            <p className="text-gray-600 text-sm">Leveraging proven data science models for reliable insights.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <TrendingUp className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Proactive Support</h3>
            <p className="text-gray-600 text-sm">Identify students at risk and intervene early.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <Users className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Evidence-Based</h3>
            <p className="text-gray-600 text-sm">Decisions driven by data, not guesswork.</p>
          </div>
        </div>

        <Link
          to="/predict"
          className="inline-block bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg text-lg hover:bg-indigo-700 transition"
        >
          Get Started - Predict Now
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
