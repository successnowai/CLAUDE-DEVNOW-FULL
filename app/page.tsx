'use client'
import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Zap, Target, Rocket, CheckCircle, Users, BarChart3, Settings, Download, Sparkles } from 'lucide-react';

// Type definitions
interface BusinessData {
  businessName?: string;
  industry?: string;
  targetMarket?: string;
  currentRevenue?: string;
  primaryChallenges?: string[];
  timeWasters?: string[];
  costCenters?: string[];
  competitors?: string[];
  differentiators?: string[];
  marketPosition?: string;
  [key: string]: any;
}

interface WizardStep {
  id: number;
  title: string;
  description: string;
  fields: string[];
  icon?: string;
}

// Business Wizard Steps
const businessWizardSteps: WizardStep[] = [
  {
    id: 1,
    title: "Business Foundation",
    description: "Define your core business model and target market",
    fields: ["businessName", "industry", "targetMarket", "currentRevenue"],
    icon: "🏢"
  },
  {
    id: 2,
    title: "Current Challenges",
    description: "Identify pain points and inefficiencies",
    fields: ["primaryChallenges", "timeWasters", "costCenters"],
    icon: "⚠️"
  },
  {
    id: 3,
    title: "Competitive Analysis",
    description: "Understand your competitive landscape",
    fields: ["competitors", "differentiators", "marketPosition"],
    icon: "🎯"
  },
  {
    id: 4,
    title: "AI Strategy Planning",
    description: "Define your AI implementation strategy",
    fields: ["aiGoals", "budget", "timeline", "teamReadiness"],
    icon: "🤖"
  },
  {
    id: 5,
    title: "Success Metrics",
    description: "Set measurable goals and KPIs",
    fields: ["kpis", "successCriteria", "reportingFrequency"],
    icon: "📊"
  }
];

// Claude API integration function
async function callClaudeAPI(prompt: string): Promise<string> {
  try {
    const response = await fetch('/api/claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    
    if (data.success) {
      return data.content;
    } else if (data.fallback) {
      // Return fallback content if API fails
      throw new Error('API_FALLBACK');
    } else {
      throw new Error(data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('Claude API call failed:', error);
    throw error;
  }
}

// UI Components
const StepIndicator = ({ steps, currentStep }: { steps: WizardStep[], currentStep: number }) => (
  <div className="flex items-center justify-center mb-8 overflow-x-auto">
    {steps.map((step, index) => (
      <div key={step.id} className="flex items-center">
        <div className={`
          flex items-center justify-center w-12 h-12 rounded-full border-2 text-sm font-semibold
          ${currentStep > step.id ? 'bg-green-500 border-green-500 text-white' : 
            currentStep === step.id ? 'bg-blue-500 border-blue-500 text-white' : 
            'bg-gray-200 border-gray-300 text-gray-500'}
        `}>
          {currentStep > step.id ? <CheckCircle className="w-6 h-6" /> : step.id}
        </div>
        {index < steps.length - 1 && (
          <div className={`w-8 h-1 mx-2 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'}`} />
        )}
      </div>
    ))}
  </div>
);

const FormField = ({ 
  label, 
  type = "text", 
  value, 
  onChange, 
  options = [], 
  placeholder = "",
  required = false 
}: {
  label: string;
  type?: string;
  value: any;
  onChange: (value: any) => void;
  options?: string[];
  placeholder?: string;
  required?: boolean;
}) => (
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === "select" ? (
      <select 
        value={value || ""} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        required={required}
      >
        <option value="">Select...</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    ) : type === "textarea" ? (
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        required={required}
      />
    ) : type === "tags" ? (
      <div>
        <input
          type="text"
          placeholder={placeholder}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const newValue = e.currentTarget.value.trim();
              if (newValue && !value?.includes(newValue)) {
                onChange([...(value || []), newValue]);
                e.currentTarget.value = '';
              }
            }
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {(value || []).map((tag: string, index: number) => (
            <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
              {tag}
              <button 
                onClick={() => onChange(value.filter((_: any, i: number) => i !== index))}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    ) : (
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        required={required}
      />
    )}
  </div>
);

// Step Content Components
const BusinessStep1 = ({ data, onChange }: { data: BusinessData, onChange: (data: Partial<BusinessData>) => void }) => (
  <div className="space-y-6">
    <FormField
      label="Business Name"
      value={data.businessName}
      onChange={(value) => onChange({ businessName: value })}
      placeholder="Enter your business name"
      required
    />
    <FormField
      label="Industry"
      type="select"
      value={data.industry}
      onChange={(value) => onChange({ industry: value })}
      options={["Technology", "Healthcare", "Finance", "Retail", "Manufacturing", "Professional Services", "Education", "Real Estate", "Other"]}
      required
    />
    <FormField
      label="Target Market"
      value={data.targetMarket}
      onChange={(value) => onChange({ targetMarket: value })}
      placeholder="e.g., Small businesses, Enterprise clients, Consumers"
      required
    />
    <FormField
      label="Current Annual Revenue"
      type="select"
      value={data.currentRevenue}
      onChange={(value) => onChange({ currentRevenue: value })}
      options={["Under $100K", "$100K-500K", "$500K-1M", "$1M-5M", "$5M-10M", "$10M+"]}
      required
    />
  </div>
);

const BusinessStep2 = ({ data, onChange }: { data: BusinessData, onChange: (data: Partial<BusinessData>) => void }) => (
  <div className="space-y-6">
    <FormField
      label="Primary Business Challenges"
      type="tags"
      value={data.primaryChallenges}
      onChange={(value) => onChange({ primaryChallenges: value })}
      placeholder="Type a challenge and press Enter (e.g., Manual processes, Customer retention)"
    />
    <FormField
      label="Time Wasters"
      type="tags"
      value={data.timeWasters}
      onChange={(value) => onChange({ timeWasters: value })}
      placeholder="Type a time waster and press Enter (e.g., Excessive meetings, Email management)"
    />
    <FormField
      label="Major Cost Centers"
      type="tags"
      value={data.costCenters}
      onChange={(value) => onChange({ costCenters: value })}
      placeholder="Type a cost center and press Enter (e.g., Overtime, Customer support)"
    />
  </div>
);

const BusinessStep3 = ({ data, onChange }: { data: BusinessData, onChange: (data: Partial<BusinessData>) => void }) => (
  <div className="space-y-6">
    <FormField
      label="Main Competitors"
      type="tags"
      value={data.competitors}
      onChange={(value) => onChange({ competitors: value })}
      placeholder="Type competitor names and press Enter"
    />
    <FormField
      label="Your Key Differentiators"
      type="tags"
      value={data.differentiators}
      onChange={(value) => onChange({ differentiators: value })}
      placeholder="What makes you unique? (e.g., Personal service, Advanced technology)"
    />
    <FormField
      label="Current Market Position"
      type="select"
      value={data.marketPosition}
      onChange={(value) => onChange({ marketPosition: value })}
      options={["Market Leader", "Strong Competitor", "Growing Player", "Niche Specialist", "New Entrant"]}
    />
  </div>
);

const BusinessStep4 = ({ data, onChange }: { data: BusinessData, onChange: (data: Partial<BusinessData>) => void }) => (
  <div className="space-y-6">
    <FormField
      label="AI Implementation Goals"
      type="tags"
      value={data.aiGoals}
      onChange={(value) => onChange({ aiGoals: value })}
      placeholder="What do you want AI to help with? (e.g., Automate customer service, Improve efficiency)"
    />
    <FormField
      label="Budget Range for AI Implementation"
      type="select"
      value={data.budget}
      onChange={(value) => onChange({ budget: value })}
      options={["Under $5K", "$5K-15K", "$15K-50K", "$50K-100K", "$100K+"]}
    />
    <FormField
      label="Implementation Timeline"
      type="select"
      value={data.timeline}
      onChange={(value) => onChange({ timeline: value })}
      options={["1-3 months", "3-6 months", "6-12 months", "12+ months"]}
    />
    <FormField
      label="Team AI Readiness"
      type="select"
      value={data.teamReadiness}
      onChange={(value) => onChange({ teamReadiness: value })}
      options={["Very Ready", "Somewhat Ready", "Need Training", "Starting from Scratch"]}
    />
  </div>
);

const BusinessStep5 = ({ data, onChange }: { data: BusinessData, onChange: (data: Partial<BusinessData>) => void }) => (
  <div className="space-y-6">
    <FormField
      label="Key Performance Indicators (KPIs)"
      type="tags"
      value={data.kpis}
      onChange={(value) => onChange({ kpis: value })}
      placeholder="What metrics matter most? (e.g., Revenue growth, Customer satisfaction, Efficiency)"
    />
    <FormField
      label="Success Criteria"
      type="textarea"
      value={data.successCriteria}
      onChange={(value) => onChange({ successCriteria: value })}
      placeholder="Define what success looks like for your AI implementation..."
    />
    <FormField
      label="Reporting Frequency"
      type="select"
      value={data.reportingFrequency}
      onChange={(value) => onChange({ reportingFrequency: value })}
      options={["Weekly", "Bi-weekly", "Monthly", "Quarterly"]}
    />
  </div>
);

// AI Assistant Component
const AIAssistant = ({ context, onSuggestion }: { context: any, onSuggestion: (suggestion: string) => void }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const prompt = `Based on this business context: ${JSON.stringify(context)}, provide 3 specific, actionable suggestions for AI implementation. Return as a JSON array of strings.`;
      
      const response = await callClaudeAPI(prompt);
      const parsed = JSON.parse(response);
      setSuggestions(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
      setSuggestions([
        "Consider implementing AI chatbots for customer service automation",
        "Use AI for predictive analytics to optimize your operations",
        "Implement AI-powered content generation for marketing"
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed right-4 top-4 w-80 bg-white rounded-lg shadow-xl border p-4 max-h-96 overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <h3 className="font-semibold text-gray-800">AI Assistant</h3>
      </div>
      
      <button 
        onClick={generateSuggestions}
        disabled={loading}
        className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg mb-4 disabled:opacity-50"
      >
        {loading ? "Generating..." : "Get AI Suggestions"}
      </button>
      
      {suggestions.length > 0 && (
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="p-3 bg-purple-50 rounded-lg text-sm">
              <p className="text-gray-700">{suggestion}</p>
              <button 
                onClick={() => onSuggestion(suggestion)}
                className="text-purple-600 hover:text-purple-800 text-xs mt-1"
              >
                Apply Suggestion
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Plan Display Component
const PlanDisplay = ({ plan }: { plan: any }) => {
  if (!plan) return null;

  return (
    <div className="mt-8 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
        Your AI Domination Strategy
      </h2>
      
      {plan.executiveSummary && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Executive Summary</h3>
          <p className="text-gray-700 text-lg leading-relaxed">{plan.executiveSummary}</p>
        </div>
      )}
      
      {plan.quickWins && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Wins (30-90 Days)</h3>
          <div className="grid gap-4">
            {plan.quickWins.map((win: any, index: number) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm border">
                <h4 className="font-semibold text-gray-800">{win.action}</h4>
                <p className="text-gray-600 mt-1">{win.impact}</p>
                <div className="flex gap-2 mt-2">
                  {win.tools?.map((tool: string, i: number) => (
                    <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{tool}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {plan.strategicInitiatives && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Strategic Initiatives</h3>
          <div className="grid gap-4">
            {plan.strategicInitiatives.map((initiative: any, index: number) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm border">
                <h4 className="font-semibold text-gray-800">{initiative.initiative}</h4>
                <p className="text-gray-600 mt-1">{initiative.description}</p>
                <div className="flex justify-between mt-3 text-sm">
                  <span className="text-green-600 font-medium">Timeline: {initiative.timeframe}</span>
                  <span className="text-blue-600 font-medium">ROI: {initiative.roi}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex gap-4 mt-6">
        <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center">
          <Download className="w-5 h-5 mr-2" />
          Download Plan
        </button>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg">
          Schedule Implementation Call
        </button>
      </div>
    </div>
  );
};

// Main Wizard Component
const BusinessWizard = ({ onComplete }: { onComplete: (data: BusinessData) => void }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BusinessData>({});
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const updateFormData = (newData: Partial<BusinessData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const generatePlan = async (data: BusinessData) => {
    setLoading(true);
    try {
      const prompt = `
        Create a comprehensive AI business domination strategy for:
        
        Business: ${data.businessName}
        Industry: ${data.industry}
        Current Revenue: ${data.currentRevenue}
        Target Market: ${data.targetMarket}
        
        Key Challenges: ${data.primaryChallenges?.join(', ') || 'None specified'}
        AI Goals: ${data.aiGoals?.join(', ') || 'General improvement'}
        Budget: ${data.budget || 'Not specified'}
        Timeline: ${data.timeline || '6 months'}
        
        Generate a detailed JSON response with:
        {
          "executiveSummary": "2-3 sentence strategic overview",
          "quickWins": [
            {
              "action": "specific actionable step",
              "impact": "expected business outcome",
              "tools": ["AI tool recommendations"],
              "timeframe": "30-90 days"
            }
          ],
          "strategicInitiatives": [
            {
              "initiative": "major project name",
              "description": "detailed description and benefits",
              "timeframe": "3-12 months",
              "budget": "estimated investment",
              "roi": "expected return percentage"
            }
          ],
          "implementationRoadmap": {
            "phase1": "immediate actions (month 1-2)",
            "phase2": "scaling phase (month 3-6)",
            "phase3": "optimization phase (month 7-12)"
          },
          "techStack": [
            {
              "tool": "specific AI tool/platform",
              "purpose": "what it accomplishes",
              "integration": "how to implement"
            }
          ],
          "successMetrics": [
            {
              "metric": "measurable KPI",
              "target": "specific numerical goal",
              "measurement": "how to track progress"
            }
          ]
        }
        
        Make this specific to their ${data.industry} business with actionable, industry-relevant recommendations.
      `;
      
      try {
        const response = await callClaudeAPI(prompt);
        const plan = JSON.parse(response);
        setGeneratedPlan(plan);
        onComplete(data);
      } catch (error) {
        // Fallback plan if Claude API fails
        const fallbackPlan = {
          executiveSummary: `Transform ${data.businessName} into an AI-powered industry leader through strategic automation and intelligent decision-making systems.`,
          quickWins: [
            {
              action: "Implement AI chatbot for customer service",
              impact: "24/7 customer support with 60% cost reduction",
              tools: ["ChatGPT API", "Intercom", "Zendesk"],
              timeframe: "30 days"
            },
            {
              action: "Automate data entry and reporting",
              impact: "Save 15+ hours per week on manual tasks",
              tools: ["Zapier", "Microsoft Power Automate", "Google Apps Script"],
              timeframe: "45 days"
            }
          ],
          strategicInitiatives: [
            {
              initiative: "Predictive Analytics Platform",
              description: "Implement AI-driven analytics to predict customer behavior and optimize business decisions",
              timeframe: "3-6 months",
              budget: "$15,000-30,000",
              roi: "200-400% within 12 months"
            }
          ]
        };
        setGeneratedPlan(fallbackPlan);
        onComplete(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < businessWizardSteps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      generatePlan(formData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <BusinessStep1 data={formData} onChange={updateFormData} />;
      case 2:
        return <BusinessStep2 data={formData} onChange={updateFormData} />;
      case 3:
        return <BusinessStep3 data={formData} onChange={updateFormData} />;
      case 4:
        return <BusinessStep4 data={formData} onChange={updateFormData} />;
      case 5:
        return <BusinessStep5 data={formData} onChange={updateFormData} />;
      default:
        return <BusinessStep1 data={formData} onChange={updateFormData} />;
    }
  };

  if (generatedPlan) {
    return <PlanDisplay plan={generatedPlan} />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <StepIndicator steps={businessWizardSteps} currentStep={currentStep} />
      
      <div className="bg-white rounded-xl shadow-xl p-8">
        <div className="flex items-center mb-6">
          <div className="text-4xl mr-4">{businessWizardSteps[currentStep - 1]?.icon}</div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              {businessWizardSteps[currentStep - 1]?.title}
            </h2>
            <p className="text-gray-600 mt-1">
              {businessWizardSteps[currentStep - 1]?.description}
            </p>
          </div>
        </div>
        
        {renderCurrentStep()}
        
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center px-6 py-3 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Previous
          </button>
          
          <button
            onClick={handleNext}
            disabled={loading}
            className="flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? "Generating Plan..." : currentStep === businessWizardSteps.length ? "Generate Strategy" : "Next"}
            {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
          </button>
        </div>
      </div>
      
      <AIAssistant 
        context={formData} 
        onSuggestion={(suggestion) => {
          console.log("AI Suggestion:", suggestion);
        }} 
      />
    </div>
  );
};

// Main App Component
const AIBusinessPlatform = () => {
  const [currentView, setCurrentView] = useState<'home' | 'business-wizard' | 'ai-tool-wizard' | 'dashboard'>('home');
  const [completedData, setCompletedData] = useState<any>(null);

  const handleBusinessComplete = (data: BusinessData) => {
    setCompletedData(data);
    setCurrentView('dashboard');
  };

  if (currentView === 'business-wizard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-8">
        <div className="container mx-auto">
          <button 
            onClick={() => setCurrentView('home')}
            className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
          <BusinessWizard onComplete={handleBusinessComplete} />
        </div>
      </div>
    );
  }

  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
        <div className="container mx-auto">
          <button 
            onClick={() => setCurrentView('home')}
            className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-8">Your AI Strategy Dashboard</h1>
          <div className="bg-white rounded-xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Completed: Business AI Domination Strategy</h2>
            <p className="text-gray-600 mb-6">Your personalized AI implementation plan is ready!</p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <BarChart3 className="w-8 h-8 text-blue-500 mb-3" />
                <h3 className="font-semibold text-gray-800">Business Analysis</h3>
                <p className="text-gray-600 text-sm mt-1">Complete assessment of your current state and opportunities</p>
              </div>
              <div className="bg-green-50 rounded-lg p-6">
                <Target className="w-8 h-8 text-green-500 mb-3" />
                <h3 className="font-semibold text-gray-800">AI Strategy</h3>
                <p className="text-gray-600 text-sm mt-1">Tailored AI implementation plan with specific tools and timelines</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-6">
                <Rocket className="w-8 h-8 text-purple-500 mb-3" />
                <h3 className="font-semibold text-gray-800">Implementation</h3>
                <p className="text-gray-600 text-sm mt-1">Step-by-step roadmap to transform your business with AI</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Home Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      <div className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold text-white mb-6">
              Dominate Your Industry with
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                {" "}AI Intelligence
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              Two powerful wizards to transform your business: Create a complete AI domination strategy 
              and build custom AI tools that give you unfair competitive advantages.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mt-16">
              <div 
                onClick={() => setCurrentView('business-wizard')}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 border border-white/20 group cursor-pointer transform hover:scale-105"
              >
                <div className="text-4xl mb-4">🧙‍♂️</div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Business AI Domination Wizard
                </h3>
                <p className="text-gray-300 mb-6">
                  5-step guided transformation to identify AI opportunities, automate processes, 
                  and create a comprehensive strategy for industry domination.
                </p>
                <div className="flex items-center text-yellow-400 group-hover:text-yellow-300">
                  Start Transformation <ArrowRight className="ml-2 w-5 h-5" />
                </div>
              </div>
              
              <div 
                onClick={() => setCurrentView('ai-tool-wizard')}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 border border-white/20 group cursor-pointer transform hover:scale-105"
              >
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  AI Tool Creation Wizard
                </h3>
                <p className="text-gray-300 mb-6">
                  Design and plan custom AI tools for your specific needs. Get detailed 
                  prompts, architecture plans, and implementation strategies.
                </p>
                <div className="flex items-center text-yellow-400 group-hover:text-yellow-300">
                  Build AI Tools <ArrowRight className="ml-2 w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white/5 backdrop-blur-lg py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Why This Platform Dominates
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-white mb-4">AI-Powered Strategy</h3>
              <p className="text-gray-300">
                Claude AI analyzes your business and generates custom strategies 
                tailored to your industry and goals.
              </p>
            </div>
            
            <div className="text-center">
              <Target className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-white mb-4">Precision Implementation</h3>
              <p className="text-gray-300">
                Step-by-step guidance with specific tools, timelines, and 
                success metrics for guaranteed results.
              </p>
            </div>
            
            <div className="text-center">
              <Rocket className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-white mb-4">Rapid Deployment</h3>
              <p className="text-gray-300">
                Get your AI strategy and tools deployed on Vercel with 
                one-click deployment and instant scalability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIBusinessPlatform;
