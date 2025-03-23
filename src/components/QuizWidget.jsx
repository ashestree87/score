import { useState } from 'react';

export default function QuizWidget() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    interests: [],
    primary_goal: '',
    experience_level: '',
    challenges: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);

  const steps = [
    { id: 'intro', title: 'Quick Assessment' },
    { id: 'basics', title: 'About You' },
    { id: 'goals', title: 'Your Goals' },
    { id: 'experience', title: 'Your Experience' },
    { id: 'challenges', title: 'Your Challenges' },
    { id: 'results', title: 'Your Results' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    
    if (checked) {
      setFormData(prev => ({
        ...prev,
        [name]: [...(prev[name] || []), value]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: prev[name].filter(item => item !== value)
      }));
    }
  };

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step < steps.length - 2) {
      setStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(0, prev - 1));
  };

  const validateCurrentStep = () => {
    switch (step) {
      case 1: // Basics
        return formData.name && formData.email;
      case 2: // Goals
        return formData.primary_goal;
      case 3: // Experience
        return formData.experience_level;
      case 4: // Challenges
        return formData.challenges.length > 0;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    try {
      // Submit data to the API
      const response = await fetch('/api/quiz-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString()
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Move to results step
        setSubmitted(true);
        setStep(steps.length - 1);
        
        // Generate simple results
        setResults({
          name: formData.name,
          score: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
          recommendations: [
            'Personalized learning path based on your experience level',
            'Resources specifically chosen for your goals',
            'Strategies to overcome your specific challenges'
          ]
        });
      } else {
        console.error('Submission error:', data);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  // Render different form steps
  const renderStep = () => {
    switch (step) {
      case 0: // Intro
        return (
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Discover Your Perfect Solution</h2>
            <p className="mb-6">Take our quick assessment to get personalized recommendations.</p>
            <button 
              onClick={() => setStep(1)}
              className="w-full bg-primary text-white font-medium py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
            >
              Start Assessment
            </button>
          </div>
        );
      
      case 1: // Basics
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Tell us about yourself</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter your name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="you@example.com"
                />
                <p className="mt-1 text-xs text-gray-500">
                  We'll send your results to this email
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I'm interested in: (select all that apply)
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="interests"
                      value="personal"
                      checked={formData.interests?.includes("personal")}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-primary border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm">Personal Development</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="interests"
                      value="professional"
                      checked={formData.interests?.includes("professional")}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-primary border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm">Professional Growth</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="interests"
                      value="business"
                      checked={formData.interests?.includes("business")}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-primary border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm">Business Solutions</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 2: // Goals
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">What's your primary goal?</h2>
            <div className="space-y-3">
              <label className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="primary_goal"
                  value="increase_productivity"
                  checked={formData.primary_goal === "increase_productivity"}
                  onChange={handleRadioChange}
                  className="h-4 w-4 text-primary"
                />
                <span className="ml-2 font-medium">Increase productivity</span>
              </label>
              
              <label className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="primary_goal"
                  value="improve_skills"
                  checked={formData.primary_goal === "improve_skills"}
                  onChange={handleRadioChange}
                  className="h-4 w-4 text-primary"
                />
                <span className="ml-2 font-medium">Improve skills</span>
              </label>
              
              <label className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="primary_goal"
                  value="overcome_challenges"
                  checked={formData.primary_goal === "overcome_challenges"}
                  onChange={handleRadioChange}
                  className="h-4 w-4 text-primary"
                />
                <span className="ml-2 font-medium">Overcome challenges</span>
              </label>
              
              <label className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="primary_goal"
                  value="explore_options"
                  checked={formData.primary_goal === "explore_options"}
                  onChange={handleRadioChange}
                  className="h-4 w-4 text-primary"
                />
                <span className="ml-2 font-medium">Explore options</span>
              </label>
            </div>
          </div>
        );
      
      case 3: // Experience
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">What's your experience level?</h2>
            <div className="space-y-3">
              <label className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="experience_level"
                  value="beginner"
                  checked={formData.experience_level === "beginner"}
                  onChange={handleRadioChange}
                  className="h-4 w-4 text-primary"
                />
                <span className="ml-2 font-medium">Beginner</span>
              </label>
              
              <label className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="experience_level"
                  value="intermediate"
                  checked={formData.experience_level === "intermediate"}
                  onChange={handleRadioChange}
                  className="h-4 w-4 text-primary"
                />
                <span className="ml-2 font-medium">Intermediate</span>
              </label>
              
              <label className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="experience_level"
                  value="advanced"
                  checked={formData.experience_level === "advanced"}
                  onChange={handleRadioChange}
                  className="h-4 w-4 text-primary"
                />
                <span className="ml-2 font-medium">Advanced</span>
              </label>
              
              <label className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="experience_level"
                  value="mixed"
                  checked={formData.experience_level === "mixed"}
                  onChange={handleRadioChange}
                  className="h-4 w-4 text-primary"
                />
                <span className="ml-2 font-medium">Mixed/Varies</span>
              </label>
            </div>
          </div>
        );
      
      case 4: // Challenges
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">What challenges are you facing?</h2>
            <div>
              <textarea
                name="challenges"
                rows="4"
                value={formData.challenges}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Describe any challenges or obstacles you're currently facing..."
              />
            </div>
          </div>
        );
      
      case 5: // Results
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Your Assessment Results</h2>
            {results ? (
              <div className="space-y-4">
                <p className="font-medium">Hi {results.name}!</p>
                
                <div className="bg-primary/10 p-3 rounded-lg">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Match Score:</span>
                    <span className="text-sm font-medium">{results.score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${results.score}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">We recommend:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {results.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm">{rec}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm">
                    We've sent a detailed report to your email. For more information, visit our website.
                  </p>
                  <a 
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-2 text-primary hover:underline text-sm font-medium"
                  >
                    Visit our website for detailed solutions →
                  </a>
                </div>
              </div>
            ) : (
              <p>Loading your results...</p>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  // Progress bar
  const progress = step === 0 ? 0 : step === 5 ? 100 : (step / 4) * 100;

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-primary text-white p-4">
        <h1 className="text-lg font-bold">Quiz Assessment</h1>
        {step > 0 && step < 5 && (
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Step {step} of 4</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-1.5">
              <div 
                className="bg-white h-1.5 rounded-full" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-6">
        {renderStep()}
        
        {/* Navigation buttons */}
        {step > 0 && step < 5 && (
          <div className="mt-6 flex justify-between">
            <button
              onClick={handleBack}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!validateCurrentStep()}
              className={`px-4 py-2 text-sm font-medium rounded-md text-white ${
                validateCurrentStep()
                  ? 'bg-primary hover:bg-primary/90'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {step === 4 ? 'Submit' : 'Next'}
            </button>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="bg-gray-50 px-4 py-3 text-center text-xs text-gray-500">
        Powered by Quiz Funnel | <a href="/" target="_blank" className="text-primary hover:underline">www.quizfunnel.com</a>
      </div>
    </div>
  );
} 