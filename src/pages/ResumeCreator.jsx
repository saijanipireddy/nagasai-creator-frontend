import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../services/api';
import {
  FaArrowLeft, FaArrowRight, FaDownload, FaEdit, FaPlus, FaTimes,
  FaMagic, FaFileAlt, FaUser, FaPen, FaLightbulb, FaBriefcase,
  FaGraduationCap, FaProjectDiagram, FaCheckCircle
} from 'react-icons/fa';

const STEPS = [
  { label: 'Personal Info', icon: FaUser },
  { label: 'Summary', icon: FaPen },
  { label: 'Skills', icon: FaLightbulb },
  { label: 'Experience', icon: FaBriefcase },
  { label: 'Education', icon: FaGraduationCap },
  { label: 'Projects & Certs', icon: FaProjectDiagram },
];

const initialFormData = {
  fullName: '',
  email: '',
  phone: '',
  linkedinUrl: '',
  githubUrl: '',
  targetRole: '',
  summary: '',
  skills: [],
  experience: [],
  education: [],
  projects: [],
  certifications: [],
};

// --- Reusable input (defined OUTSIDE component to prevent re-mount on each render) ---
const InputField = ({ label, value, onChange, placeholder, type = 'text', required = false, error = false }) => (
  <div>
    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all shadow-sm ${
        error
          ? 'border-red-300 focus:ring-red-500/30 focus:border-red-400'
          : 'border-slate-200 focus:ring-indigo-500/30 focus:border-indigo-400'
      }`}
    />
    {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
  </div>
);

const TextArea = ({ label, value, onChange, placeholder, rows = 4, required = false, maxLen, error = false }) => (
  <div>
    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all resize-none shadow-sm ${
        error
          ? 'border-red-300 focus:ring-red-500/30 focus:border-red-400'
          : 'border-slate-200 focus:ring-indigo-500/30 focus:border-indigo-400'
      }`}
    />
    {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    {maxLen && !error && <p className="text-[11px] text-slate-400 mt-1 text-right">{value.length} / {maxLen}</p>}
  </div>
);

export default function ResumeCreator() {
  const { student } = useAuth();
  const { addToast } = useToast();
  const resumeRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    ...initialFormData,
    fullName: student?.name || '',
    email: student?.email || '',
  });
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [certInput, setCertInput] = useState('');

  // --- Form helpers ---
  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !formData.skills.includes(skill)) {
      updateField('skills', [...formData.skills, skill]);
    }
    setSkillInput('');
  };

  const removeSkill = (idx) => updateField('skills', formData.skills.filter((_, i) => i !== idx));

  const addCert = () => {
    const cert = certInput.trim();
    if (cert) updateField('certifications', [...formData.certifications, cert]);
    setCertInput('');
  };

  const removeCert = (idx) => updateField('certifications', formData.certifications.filter((_, i) => i !== idx));

  const addExperience = () => updateField('experience', [...formData.experience, { company: '', role: '', duration: '', description: '' }]);
  const updateExperience = (idx, field, value) => {
    const updated = [...formData.experience];
    updated[idx] = { ...updated[idx], [field]: value };
    updateField('experience', updated);
  };
  const removeExperience = (idx) => updateField('experience', formData.experience.filter((_, i) => i !== idx));

  const addEducation = () => updateField('education', [...formData.education, { institution: '', degree: '', year: '', gpa: '' }]);
  const updateEducation = (idx, field, value) => {
    const updated = [...formData.education];
    updated[idx] = { ...updated[idx], [field]: value };
    updateField('education', updated);
  };
  const removeEducation = (idx) => updateField('education', formData.education.filter((_, i) => i !== idx));

  const addProject = () => updateField('projects', [...formData.projects, { name: '', description: '', techStack: '', link: '' }]);
  const updateProject = (idx, field, value) => {
    const updated = [...formData.projects];
    updated[idx] = { ...updated[idx], [field]: value };
    updateField('projects', updated);
  };
  const removeProject = (idx) => updateField('projects', formData.projects.filter((_, i) => i !== idx));

  // --- Validation per step (field-specific messages) ---
  const validateStep = (step = currentStep) => {
    switch (step) {
      case 0: {
        const errors = [];
        if (!formData.fullName.trim()) errors.push('Full Name is required');
        if (!formData.email.trim()) errors.push('Email is required');
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.push('Please enter a valid email address');
        if (!formData.phone.trim()) errors.push('Phone number is required');
        if (!formData.targetRole.trim()) errors.push('Target Role is required — this helps AI tailor your resume');
        return errors.length > 0 ? errors : null;
      }
      case 1:
        if (!formData.summary.trim()) return ['Professional Summary is required'];
        if (formData.summary.trim().length < 10) return ['Professional Summary is too short — write at least 2-3 sentences about your experience'];
        return null;
      case 2:
        if (formData.skills.length === 0) return ['Add at least one skill — type a skill name and press Enter or click +'];
        return null;
      case 3: {
        const errors = [];
        formData.experience.forEach((exp, i) => {
          if (!exp.company.trim()) errors.push(`Experience #${i + 1}: Company name is required`);
          if (!exp.role.trim()) errors.push(`Experience #${i + 1}: Role/Position is required`);
          if (!exp.duration.trim()) errors.push(`Experience #${i + 1}: Duration is required (e.g., "Jan 2023 - Present")`);
        });
        return errors.length > 0 ? errors : null;
      }
      case 4: {
        if (formData.education.length === 0) return ['Add at least one education entry — click "Add Education" below'];
        const errors = [];
        formData.education.forEach((edu, i) => {
          if (!edu.institution.trim()) errors.push(`Education #${i + 1}: Institution name is required`);
          if (!edu.degree.trim()) errors.push(`Education #${i + 1}: Degree is required (e.g., "B.Tech in CS")`);
          if (!edu.year.trim()) errors.push(`Education #${i + 1}: Year is required (e.g., "2020 - 2024")`);
        });
        return errors.length > 0 ? errors : null;
      }
      case 5: {
        const errors = [];
        formData.projects.forEach((proj, i) => {
          if (!proj.name.trim()) errors.push(`Project #${i + 1}: Project name is required`);
          if (!proj.description.trim()) errors.push(`Project #${i + 1}: Description is required`);
          if (!proj.techStack.trim()) errors.push(`Project #${i + 1}: Tech stack is required`);
        });
        return errors.length > 0 ? errors : null;
      }
      default:
        return null;
    }
  };

  const showValidationErrors = (errors) => {
    if (!errors) return true;
    errors.forEach(err => addToast(err, 'error'));
    return false;
  };

  const nextStep = () => {
    if (showValidationErrors(validateStep())) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  // --- API call ---
  const handleGenerate = async () => {
    // Validate current step and education requirement
    if (!showValidationErrors(validateStep())) return;
    if (formData.education.length === 0) {
      addToast('Add at least one education entry before generating', 'error');
      return;
    }
    // Also validate experience entries if any exist
    const expErrors = validateStep(3);
    if (expErrors) { expErrors.forEach(e => addToast(e, 'error')); return; }
    // Also validate project entries if any exist
    const projErrors = validateStep(5);
    if (projErrors) { projErrors.forEach(e => addToast(e, 'error')); return; }

    setLoading(true);
    try {
      const { data } = await api.post('/resume/generate', formData, { timeout: 60000 });
      setResumeData(data.data);
      addToast('Resume generated successfully!', 'success');
    } catch (err) {
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message;

      if (status === 429) {
        addToast('AI service is currently busy. Please wait 1-2 minutes and try again.', 'error');
      } else if (status === 503) {
        addToast(serverMsg || 'AI service is temporarily unavailable. Please try again later.', 'error');
      } else if (status === 502) {
        addToast('AI returned an unexpected response. Please try generating again.', 'error');
      } else if (status === 400) {
        addToast(serverMsg || 'Please check your form fields and try again.', 'error');
      } else if (err.code === 'ECONNABORTED') {
        addToast('Request timed out. The AI service took too long to respond. Please try again.', 'error');
      } else {
        addToast(serverMsg || 'Something went wrong. Please check your connection and try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- PDF download ---
  const downloadPDF = async () => {
    const element = resumeRef.current;
    if (!element) return;
    const html2pdf = (await import('html2pdf.js')).default;
    html2pdf().set({
      margin: [0.4, 0.4, 0.4, 0.4],
      filename: `${resumeData.fullName.replace(/\s+/g, '_')}_Resume.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    }).from(element).save();
  };

  // ============================
  // RESUME PREVIEW
  // ============================
  if (resumeData) {
    return (
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Action bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-md shadow-slate-200/60 ring-1 ring-slate-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <FaFileAlt className="text-white text-sm" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-slate-900">Your Resume is Ready</h1>
                <p className="text-xs text-slate-500">ATS-optimized and ready to download</p>
              </div>
            </div>
            <div className="flex gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => setResumeData(null)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-semibold rounded-xl transition-all hover:shadow-sm"
              >
                <FaEdit className="text-xs text-slate-400" /> Edit
              </button>
              <button
                onClick={downloadPDF}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30"
              >
                <FaDownload className="text-xs" /> Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* Resume preview card */}
        <div className="bg-white rounded-2xl shadow-md shadow-slate-200/60 ring-1 ring-slate-100 overflow-hidden">
          <div ref={resumeRef} style={{ padding: '48px 56px', fontFamily: "'Calibri', 'Segoe UI', Arial, sans-serif", color: '#2d2d2d', lineHeight: '1.5', maxWidth: '820px', margin: '0 auto', backgroundColor: '#fff' }}>

            {/* === HEADER === */}
            <h1 style={{ fontSize: '32px', fontWeight: '700', textAlign: 'center', margin: '0 0 8px 0', color: '#1a1a1a', letterSpacing: '-0.3px' }}>
              {resumeData.fullName}
            </h1>
            <div style={{ textAlign: 'center', fontSize: '12px', color: '#555', margin: '0 0 16px 0', lineHeight: '1.8' }}>
              {resumeData.email && <span>{resumeData.email}</span>}
              {resumeData.phone && <span> &nbsp;|&nbsp; {resumeData.phone}</span>}
              {resumeData.linkedinUrl && (
                <span> &nbsp;|&nbsp; <a href={resumeData.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>LinkedIn</a></span>
              )}
              {resumeData.githubUrl && (
                <span> &nbsp;|&nbsp; <a href={resumeData.githubUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>GitHub</a></span>
              )}
            </div>
            <div style={{ borderTop: '3px solid #1a1a1a', margin: '0 0 20px 0' }} />

            {/* === SUMMARY === */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '18px' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '0 0 6px 0', borderBottom: '1.5px solid #e5e7eb' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1e293b' }}>Professional Summary</span>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 0 0 0' }}>
                    <p style={{ fontSize: '12.5px', margin: '0', color: '#374151', lineHeight: '1.7' }}>{resumeData.summary}</p>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* === SKILLS === */}
            {resumeData.skillCategories?.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '18px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '0 0 6px 0', borderBottom: '1.5px solid #e5e7eb' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1e293b' }}>Technical Skills</span>
                    </td>
                  </tr>
                  {resumeData.skillCategories.map((cat, i) => (
                    <tr key={i}>
                      <td style={{ padding: i === 0 ? '10px 0 4px 0' : '4px 0' }}>
                        <span style={{ fontSize: '12.5px', color: '#374151' }}>
                          <strong style={{ color: '#1e293b', fontWeight: '600' }}>{cat.category}: </strong>
                          {cat.skills.join(', ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* === EXPERIENCE === */}
            {resumeData.experience?.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '18px' }}>
                <tbody>
                  <tr>
                    <td colSpan="2" style={{ padding: '0 0 6px 0', borderBottom: '1.5px solid #e5e7eb' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1e293b' }}>Work Experience</span>
                    </td>
                  </tr>
                  {resumeData.experience.map((exp, i) => (
                    <tr key={i}>
                      <td colSpan="2" style={{ padding: i === 0 ? '12px 0 10px 0' : '10px 0', verticalAlign: 'top' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <tbody>
                            <tr>
                              <td style={{ padding: '0' }}>
                                <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#111827' }}>{exp.role}</span>
                                <span style={{ fontSize: '12.5px', color: '#6b7280' }}> &mdash; </span>
                                <span style={{ fontSize: '12.5px', fontWeight: '600', color: '#374151' }}>{exp.company}</span>
                              </td>
                              <td style={{ padding: '0', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                <span style={{ fontSize: '11.5px', color: '#6b7280', fontStyle: 'italic' }}>{exp.duration}</span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px', fontSize: '12px', color: '#374151', lineHeight: '1.7' }}>
                          {exp.bullets?.map((b, j) => <li key={j} style={{ marginBottom: '3px' }}>{b}</li>)}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* === PROJECTS === */}
            {resumeData.projects?.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '18px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '0 0 6px 0', borderBottom: '1.5px solid #e5e7eb' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1e293b' }}>Projects</span>
                    </td>
                  </tr>
                  {resumeData.projects.map((proj, i) => (
                    <tr key={i}>
                      <td style={{ padding: i === 0 ? '12px 0 10px 0' : '10px 0', verticalAlign: 'top' }}>
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>{proj.name}</span>
                          <span style={{ fontSize: '11.5px', color: '#6b7280' }}> &nbsp;| &nbsp;</span>
                          <span style={{ fontSize: '11.5px', color: '#555', fontStyle: 'italic' }}>{proj.techStack}</span>
                          {proj.link && (
                            <>
                              <span style={{ fontSize: '11.5px', color: '#6b7280' }}> &nbsp;| &nbsp;</span>
                              <a href={proj.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: '#2563eb', textDecoration: 'none' }}>View Project</a>
                            </>
                          )}
                        </div>
                        <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px', fontSize: '12px', color: '#374151', lineHeight: '1.7' }}>
                          {proj.bullets?.map((b, j) => <li key={j} style={{ marginBottom: '3px' }}>{b}</li>)}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* === EDUCATION === */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '18px' }}>
              <tbody>
                <tr>
                  <td colSpan="2" style={{ padding: '0 0 6px 0', borderBottom: '1.5px solid #e5e7eb' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1e293b' }}>Education</span>
                  </td>
                </tr>
                {resumeData.education?.map((edu, i) => (
                  <tr key={i}>
                    <td style={{ padding: i === 0 ? '10px 0 6px 0' : '6px 0', verticalAlign: 'top' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>{edu.degree}</span>
                      <span style={{ fontSize: '12.5px', color: '#6b7280' }}> &mdash; </span>
                      <span style={{ fontSize: '12.5px', color: '#374151' }}>{edu.institution}</span>
                      {edu.gpa && <span style={{ fontSize: '12px', color: '#6b7280' }}> &nbsp;| GPA: {edu.gpa}</span>}
                    </td>
                    <td style={{ padding: i === 0 ? '10px 0 6px 0' : '6px 0', textAlign: 'right', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                      <span style={{ fontSize: '11.5px', color: '#6b7280', fontStyle: 'italic' }}>{edu.year}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* === CERTIFICATIONS === */}
            {resumeData.certifications?.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '0 0 6px 0', borderBottom: '1.5px solid #e5e7eb' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1e293b' }}>Certifications</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 0 0 0' }}>
                      <ul style={{ margin: '0', paddingLeft: '18px', fontSize: '12.5px', color: '#374151', lineHeight: '1.7' }}>
                        {resumeData.certifications.map((c, i) => <li key={i} style={{ marginBottom: '3px' }}>{c}</li>)}
                      </ul>
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============================
  // LOADING STATE
  // ============================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-[3px] border-slate-100" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-indigo-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <FaMagic className="text-indigo-500 text-lg" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-slate-800 text-sm font-semibold">AI is crafting your resume...</p>
          <p className="text-slate-400 text-xs mt-1">This may take 10-15 seconds</p>
        </div>
      </div>
    );
  }

  // ============================
  // MULTI-STEP FORM
  // ============================
  const StepIcon = STEPS[currentStep].icon;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header card */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md shadow-slate-200/60 ring-1 ring-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <FaMagic className="text-white text-sm" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">AI Resume Creator</h1>
            <p className="text-xs sm:text-sm text-slate-500">Fill in your details and let AI create an ATS-friendly resume</p>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-md shadow-slate-200/60 ring-1 ring-slate-100">
        <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-hidden">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === currentStep;
            const isDone = i < currentStep;
            return (
              <div key={i} className="flex items-center">
                <button
                  onClick={() => { if (i < currentStep) setCurrentStep(i); }}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200'
                      : isDone
                        ? 'text-emerald-600 hover:bg-emerald-50 cursor-pointer'
                        : 'text-slate-400'
                  }`}
                >
                  {isDone ? (
                    <FaCheckCircle className="text-[11px] text-emerald-500" />
                  ) : (
                    <Icon className={`text-[11px] ${isActive ? 'text-indigo-500' : 'text-slate-400'}`} />
                  )}
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{i + 1}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`w-3 sm:w-5 h-[2px] mx-0.5 rounded-full ${isDone ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-7 shadow-md shadow-slate-200/60 ring-1 ring-slate-100">
        {/* Step header */}
        <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentStep === STEPS.length - 1 ? 'bg-purple-50' : 'bg-indigo-50'}`}>
            <StepIcon className={`text-xs ${currentStep === STEPS.length - 1 ? 'text-purple-500' : 'text-indigo-500'}`} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">{STEPS[currentStep].label}</h2>
            <p className="text-[11px] text-slate-400">Step {currentStep + 1} of {STEPS.length}</p>
          </div>
        </div>

        {/* Step 0: Personal Info */}
        {currentStep === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Full Name" value={formData.fullName} onChange={v => updateField('fullName', v)} placeholder="John Doe" required />
            <InputField label="Email" value={formData.email} onChange={v => updateField('email', v)} placeholder="john@example.com" type="email" required />
            <InputField label="Phone" value={formData.phone} onChange={v => updateField('phone', v)} placeholder="+91 9876543210" required />
            <InputField label="Target Role" value={formData.targetRole} onChange={v => updateField('targetRole', v)} placeholder="Full Stack Developer" required />
            <InputField label="LinkedIn URL" value={formData.linkedinUrl} onChange={v => updateField('linkedinUrl', v)} placeholder="https://linkedin.com/in/johndoe" />
            <InputField label="GitHub URL" value={formData.githubUrl} onChange={v => updateField('githubUrl', v)} placeholder="https://github.com/johndoe" />
          </div>
        )}

        {/* Step 1: Summary */}
        {currentStep === 1 && (
          <TextArea
            label="Tell us about yourself"
            value={formData.summary}
            onChange={v => updateField('summary', v)}
            placeholder="Brief overview of your experience, skills, and career goals. AI will rewrite this to be more compelling and ATS-friendly..."
            rows={6}
            required
            maxLen={3000}
          />
        )}

        {/* Step 2: Skills */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                placeholder="Type a skill and press Enter (e.g., React, Python, AWS)..."
                className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all shadow-sm"
              />
              <button onClick={addSkill} className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                <FaPlus className="text-xs" />
              </button>
            </div>
            {formData.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg ring-1 ring-indigo-100">
                    {skill}
                    <button onClick={() => removeSkill(i)} className="text-indigo-400 hover:text-red-500 transition-colors"><FaTimes className="text-[9px]" /></button>
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl">
                <FaLightbulb className="text-slate-300 text-lg mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No skills added yet. Add at least one skill.</p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Experience */}
        {currentStep === 3 && (
          <div className="space-y-4">
            {formData.experience.length === 0 && (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
                <FaBriefcase className="text-slate-300 text-xl mx-auto mb-2" />
                <p className="text-slate-500 text-sm font-medium">No experience added yet</p>
                <p className="text-slate-400 text-xs mt-1">This step is optional. Click below to add or skip to the next step.</p>
              </div>
            )}
            {formData.experience.map((exp, i) => (
              <div key={i} className="p-4 bg-slate-50/80 border border-slate-100 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Experience #{i + 1}</span>
                  <button onClick={() => removeExperience(i)} className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-all">
                    <FaTimes className="text-[10px]" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InputField label="Company" value={exp.company} onChange={v => updateExperience(i, 'company', v)} placeholder="Google" required />
                  <InputField label="Role" value={exp.role} onChange={v => updateExperience(i, 'role', v)} placeholder="Software Engineer" required />
                  <InputField label="Duration" value={exp.duration} onChange={v => updateExperience(i, 'duration', v)} placeholder="Jan 2023 - Present" required />
                </div>
                <TextArea label="Description" value={exp.description} onChange={v => updateExperience(i, 'description', v)} placeholder="Brief description of your responsibilities and achievements..." rows={3} />
              </div>
            ))}
            <button
              onClick={addExperience}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-slate-300 hover:border-indigo-400 text-slate-500 hover:text-indigo-600 text-sm font-semibold rounded-xl transition-all hover:bg-indigo-50/50"
            >
              <FaPlus className="text-[10px]" /> Add Experience
            </button>
          </div>
        )}

        {/* Step 4: Education */}
        {currentStep === 4 && (
          <div className="space-y-4">
            {formData.education.length === 0 && (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
                <FaGraduationCap className="text-slate-300 text-xl mx-auto mb-2" />
                <p className="text-slate-500 text-sm font-medium">Add at least one education entry</p>
              </div>
            )}
            {formData.education.map((edu, i) => (
              <div key={i} className="p-4 bg-slate-50/80 border border-slate-100 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Education #{i + 1}</span>
                  <button onClick={() => removeEducation(i)} className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-all">
                    <FaTimes className="text-[10px]" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InputField label="Institution" value={edu.institution} onChange={v => updateEducation(i, 'institution', v)} placeholder="Indian Institute of Technology" required />
                  <InputField label="Degree" value={edu.degree} onChange={v => updateEducation(i, 'degree', v)} placeholder="B.Tech in Computer Science" required />
                  <InputField label="Year" value={edu.year} onChange={v => updateEducation(i, 'year', v)} placeholder="2020 - 2024" required />
                  <InputField label="GPA (Optional)" value={edu.gpa} onChange={v => updateEducation(i, 'gpa', v)} placeholder="8.5 / 10" />
                </div>
              </div>
            ))}
            <button
              onClick={addEducation}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-slate-300 hover:border-indigo-400 text-slate-500 hover:text-indigo-600 text-sm font-semibold rounded-xl transition-all hover:bg-indigo-50/50"
            >
              <FaPlus className="text-[10px]" /> Add Education
            </button>
          </div>
        )}

        {/* Step 5: Projects & Certifications */}
        {currentStep === 5 && (
          <div className="space-y-6">
            {/* Projects */}
            <div className="space-y-4">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Projects <span className="font-normal normal-case text-slate-400">(Optional)</span></p>
              {formData.projects.length === 0 && (
                <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl">
                  <FaProjectDiagram className="text-slate-300 text-lg mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">No projects added yet.</p>
                </div>
              )}
              {formData.projects.map((proj, i) => (
                <div key={i} className="p-4 bg-slate-50/80 border border-slate-100 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Project #{i + 1}</span>
                    <button onClick={() => removeProject(i)} className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-all">
                      <FaTimes className="text-[10px]" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InputField label="Project Name" value={proj.name} onChange={v => updateProject(i, 'name', v)} placeholder="E-Commerce Platform" required />
                    <InputField label="Tech Stack" value={proj.techStack} onChange={v => updateProject(i, 'techStack', v)} placeholder="React, Node.js, MongoDB" required />
                    <InputField label="Link (Optional)" value={proj.link} onChange={v => updateProject(i, 'link', v)} placeholder="https://github.com/..." />
                  </div>
                  <TextArea label="Description" value={proj.description} onChange={v => updateProject(i, 'description', v)} placeholder="What does this project do? What problems does it solve?" rows={3} required />
                </div>
              ))}
              <button
                onClick={addProject}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-slate-300 hover:border-indigo-400 text-slate-500 hover:text-indigo-600 text-sm font-semibold rounded-xl transition-all hover:bg-indigo-50/50"
              >
                <FaPlus className="text-[10px]" /> Add Project
              </button>
            </div>

            {/* Certifications */}
            <div className="space-y-4 pt-5 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Certifications <span className="font-normal normal-case text-slate-400">(Optional)</span></p>
              <div className="flex gap-2">
                <input
                  value={certInput}
                  onChange={e => setCertInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCert(); } }}
                  placeholder="AWS Certified Developer, Google Cloud Associate..."
                  className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all shadow-sm"
                />
                <button onClick={addCert} className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                  <FaPlus className="text-xs" />
                </button>
              </div>
              {formData.certifications.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.certifications.map((cert, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg ring-1 ring-emerald-100">
                      {cert}
                      <button onClick={() => removeCert(i)} className="text-emerald-400 hover:text-red-500 transition-colors"><FaTimes className="text-[9px]" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-slate-100">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
              currentStep === 0
                ? 'text-slate-300 cursor-not-allowed'
                : 'bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 shadow-sm'
            }`}
          >
            <FaArrowLeft className="text-xs" /> Back
          </button>

          {currentStep < STEPS.length - 1 ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-indigo-500/20"
            >
              Next <FaArrowRight className="text-xs" />
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5"
            >
              <FaMagic className="text-xs" /> Generate Resume
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
