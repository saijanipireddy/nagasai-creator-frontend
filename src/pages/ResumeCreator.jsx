import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../services/api';
import {
  FaArrowLeft, FaArrowRight, FaDownload, FaEdit, FaPlus, FaTimes,
  FaMagic, FaFileAlt, FaUser, FaPen, FaLightbulb, FaBriefcase,
  FaGraduationCap, FaProjectDiagram, FaCheckCircle, FaEye, FaEyeSlash
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

// --- Overleaf/LaTeX-style shared constants ---
const F = {
  font: "'Computer Modern Serif', 'Latin Modern Roman', 'Times New Roman', 'Times', Georgia, serif",
  black: '#000000',
  body: '#000000',
  muted: '#333333',
  link: '#0563C1',
  nameSize: '22pt',
  taglineSize: '10pt',
  contactSize: '10pt',
  sectionSize: '12pt',
  bodySize: '10pt',
  smallSize: '9pt',
  lineHeight: '1.35',
};

// Load CM-alike web font (Latin Modern via GUST)
if (!document.querySelector('link[data-latex-font]')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400;1,8..60,600&display=swap';
  link.setAttribute('data-latex-font', 'true');
  document.head.appendChild(link);
  F.font = "'Source Serif 4', 'Times New Roman', 'Times', Georgia, serif";
}

const SectionLine = ({ title }) => (
  <div style={{ marginTop: '10px', marginBottom: '6px' }}>
    <span style={{
      fontSize: F.sectionSize,
      fontWeight: '700',
      color: F.black,
      letterSpacing: '0.3px',
      display: 'block',
    }}>
      {title}
    </span>
    <div style={{ height: '4px' }} />
    <div style={{ borderTop: `1.2px solid ${F.black}` }} />
  </div>
);

// --- Live Preview Component (Overleaf LaTeX style) ---
const LiveResumePreview = ({ formData, resumeData, resumeRef }) => {
  const data = resumeData || formData;
  const isAI = !!resumeData;
  const hasAnyContent = data.fullName || data.email || data.phone || data.summary ||
    data.skills?.length > 0 || data.experience?.length > 0 ||
    data.education?.length > 0 || data.projects?.length > 0 || data.certifications?.length > 0;

  if (!hasAnyContent) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <FaFileAlt className="text-slate-300 text-2xl" />
        </div>
        <p className="text-slate-400 text-sm font-medium">Start filling in your details</p>
        <p className="text-slate-300 text-xs mt-1">Your resume preview will appear here live</p>
      </div>
    );
  }

  const linkedIn = data.linkedinUrl || formData.linkedinUrl;
  const github = data.githubUrl || formData.githubUrl;

  const contactParts = [];
  if (data.phone) contactParts.push({ text: data.phone });
  if (data.email) contactParts.push({ text: data.email, href: `mailto:${data.email}` });
  if (linkedIn) contactParts.push({ text: 'LinkedIn', href: linkedIn });
  if (github) contactParts.push({ text: 'GitHub', href: github });

  const sep = <span style={{ margin: '0 8px', fontWeight: '700', color: F.black }}>|</span>;

  return (
    <div ref={resumeRef} style={{
      padding: '32px 36px',
      fontFamily: F.font,
      color: F.body,
      lineHeight: F.lineHeight,
      backgroundColor: '#fff',
    }}>

      {/* ====== HEADER ====== */}
      {(data.fullName || data.email || data.phone) && (
        <div style={{ textAlign: 'center', marginBottom: '6px' }}>
          {/* Name */}
          <h1 style={{
            fontSize: F.nameSize,
            fontWeight: '700',
            color: F.black,
            margin: '0 0 2px 0',
            lineHeight: '1.15',
          }}>
            {data.fullName || 'Your Name'}
          </h1>

          {/* Tagline / Target Role */}
          {data.targetRole && (
            <div style={{ fontSize: F.taglineSize, color: F.muted, lineHeight: '1.4', marginBottom: '3px' }}>
              {data.targetRole}
            </div>
          )}

          {/* Contact row */}
          {contactParts.length > 0 && (
            <div style={{ fontSize: F.contactSize, color: F.body, lineHeight: '1.5' }}>
              {contactParts.map((p, i) => (
                <span key={i}>
                  {i > 0 && sep}
                  {p.href ? (
                    <a href={p.href} target="_blank" rel="noopener noreferrer" style={{ color: F.link, textDecoration: 'none' }}>{p.text}</a>
                  ) : (
                    <span>{p.text}</span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ====== SUMMARY ====== */}
      {data.summary && (
        <div>
          <SectionLine title="Summary" />
          <p style={{ fontSize: F.bodySize, margin: '0', color: F.body, lineHeight: '1.45', textAlign: 'justify' }}>
            {data.summary}
          </p>
        </div>
      )}

      {/* ====== SKILLS ====== */}
      {isAI && data.skillCategories?.length > 0 ? (
        <div>
          <SectionLine title="Skills" />
          <div style={{ fontSize: F.bodySize, color: F.body, lineHeight: '1.55' }}>
            {data.skillCategories.map((cat, i) => (
              <div key={i} style={{ marginBottom: '1px' }}>
                <span style={{ fontWeight: '700' }}>{cat.category} : </span>
                {cat.skills.join(', ')}
              </div>
            ))}
          </div>
        </div>
      ) : data.skills?.length > 0 && (
        <div>
          <SectionLine title="Skills" />
          <div style={{ fontSize: F.bodySize, color: F.body, lineHeight: '1.55' }}>
            <div>
              <span style={{ fontWeight: '700' }}>Languages & Tools : </span>
              {data.skills.join(', ')}
            </div>
          </div>
        </div>
      )}

      {/* ====== EXPERIENCE ====== */}
      {data.experience?.length > 0 && (
        <div>
          <SectionLine title="Experience" />
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '8px' }}>
              {/* Row 1: Role — Company  ...  Dates */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: F.bodySize }}>
                  {exp.role && <span style={{ fontWeight: '700' }}>{exp.role}</span>}
                  {exp.role && exp.company && <span> - </span>}
                  {exp.company && <span style={{ fontStyle: 'italic' }}>{exp.company}</span>}
                </div>
                {exp.duration && (
                  <span style={{ fontSize: F.smallSize, color: F.muted, whiteSpace: 'nowrap', marginLeft: '12px' }}>{exp.duration}</span>
                )}
              </div>
              {/* Bullets */}
              {isAI && exp.bullets?.length > 0 ? (
                <ul style={{ margin: '2px 0 0 0', paddingLeft: '18px', fontSize: F.bodySize, lineHeight: '1.45', listStyleType: 'disc' }}>
                  {exp.bullets.map((b, j) => <li key={j} style={{ marginBottom: '1px' }}>{b}</li>)}
                </ul>
              ) : exp.description && (
                <ul style={{ margin: '2px 0 0 0', paddingLeft: '18px', fontSize: F.bodySize, lineHeight: '1.45', listStyleType: 'disc' }}>
                  <li>{exp.description}</li>
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ====== PROJECTS ====== */}
      {data.projects?.length > 0 && (
        <div>
          <SectionLine title="Projects" />
          {data.projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: '8px' }}>
              {/* Row 1: Name — Description headline  ...  Live Link */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: F.bodySize }}>
                  {proj.name && <span style={{ fontWeight: '700' }}>{proj.name}</span>}
                </div>
                {proj.link && (
                  <a href={proj.link} target="_blank" rel="noopener noreferrer" style={{
                    fontSize: F.smallSize, color: F.link, textDecoration: 'none', whiteSpace: 'nowrap', marginLeft: '12px',
                  }}>Live Link</a>
                )}
              </div>
              {/* Bullets */}
              {isAI && proj.bullets?.length > 0 ? (
                <ul style={{ margin: '2px 0 0 0', paddingLeft: '18px', fontSize: F.bodySize, lineHeight: '1.45', listStyleType: 'disc' }}>
                  {proj.bullets.map((b, j) => <li key={j} style={{ marginBottom: '1px' }}>{b}</li>)}
                </ul>
              ) : proj.description && (
                <ul style={{ margin: '2px 0 0 0', paddingLeft: '18px', fontSize: F.bodySize, lineHeight: '1.45', listStyleType: 'disc' }}>
                  <li>{proj.description}</li>
                </ul>
              )}
              {/* Technologies line */}
              {proj.techStack && (
                <div style={{ fontSize: F.smallSize, color: F.body, marginTop: '2px', paddingLeft: '18px' }}>
                  <span style={{ fontWeight: '700' }}>Technologies:</span> {proj.techStack}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ====== EDUCATION ====== */}
      {data.education?.length > 0 && (
        <div>
          <SectionLine title="Education" />
          {data.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: F.bodySize }}>
                  {edu.degree && <span style={{ fontWeight: '700' }}>{edu.degree}</span>}
                </div>
                {edu.year && (
                  <span style={{ fontSize: F.smallSize, color: F.muted, whiteSpace: 'nowrap', marginLeft: '12px' }}>{edu.year}</span>
                )}
              </div>
              {edu.institution && (
                <div style={{ fontSize: F.bodySize, fontStyle: 'italic' }}>
                  {edu.institution}{edu.gpa && <span style={{ fontStyle: 'normal' }}>, GPA: {edu.gpa}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ====== CERTIFICATIONS ====== */}
      {data.certifications?.length > 0 && (
        <div>
          <SectionLine title="Certifications" />
          <ul style={{ margin: '2px 0 0 0', paddingLeft: '18px', fontSize: F.bodySize, lineHeight: '1.45', listStyleType: 'disc' }}>
            {data.certifications.map((c, i) => <li key={i} style={{ marginBottom: '1px' }}>{c}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};

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
  const [showPreview, setShowPreview] = useState(false);

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

  // --- Validation per step ---
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
    if (!showValidationErrors(validateStep())) return;
    if (formData.education.length === 0) {
      addToast('Add at least one education entry before generating', 'error');
      return;
    }
    const expErrors = validateStep(3);
    if (expErrors) { expErrors.forEach(e => addToast(e, 'error')); return; }
    const projErrors = validateStep(5);
    if (projErrors) { projErrors.forEach(e => addToast(e, 'error')); return; }

    setLoading(true);
    try {
      const { data } = await api.post('/resume/generate', formData, { timeout: 60000 });
      setResumeData(data.data);
      addToast('Resume generated successfully! AI has enhanced your content.', 'success');
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
    const name = resumeData?.fullName || formData.fullName || 'Resume';
    const html2pdf = (await import('html2pdf.js')).default;
    html2pdf().set({
      margin: [0.4, 0.4, 0.4, 0.4],
      filename: `${name.replace(/\s+/g, '_')}_Resume.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    }).from(element).save();
  };

  const StepIcon = STEPS[currentStep].icon;

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Top bar */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-md shadow-slate-200/60 ring-1 ring-slate-100 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <FaMagic className="text-white text-sm" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">AI Resume Creator</h1>
              <p className="text-xs sm:text-sm text-slate-500">
                {resumeData ? 'AI-enhanced resume ready' : 'Fill in details — see your resume build live'}
              </p>
            </div>
          </div>
          <div className="flex gap-2.5 w-full sm:w-auto">
            {/* Mobile preview toggle */}
            <button
              onClick={() => setShowPreview(p => !p)}
              className="lg:hidden flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 text-sm font-semibold rounded-xl transition-all hover:shadow-sm"
            >
              {showPreview ? <FaEyeSlash className="text-xs text-slate-400" /> : <FaEye className="text-xs text-indigo-500" />}
              {showPreview ? 'Show Form' : 'Preview'}
            </button>
            {resumeData && (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* Split layout */}
      <div className="flex gap-4 items-start">

        {/* LEFT: Form Panel */}
        <div className={`w-full lg:w-[480px] xl:w-[520px] flex-shrink-0 space-y-4 ${showPreview ? 'hidden lg:block' : ''}`}>
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
                      className={`flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
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
                      <div className={`w-3 sm:w-4 h-[2px] mx-0.5 rounded-full ${isDone ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-md shadow-slate-200/60 ring-1 ring-slate-100">
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
                    placeholder="Type a skill and press Enter..."
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
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FaMagic className="text-xs" /> Generate Resume
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Live Preview Panel */}
        <div className={`flex-1 min-w-0 ${showPreview ? '' : 'hidden lg:block'}`}>
          <div className="sticky top-4">
            {/* Preview header */}
            <div className="bg-white rounded-t-xl sm:rounded-t-2xl px-4 py-3 shadow-md shadow-slate-200/60 ring-1 ring-slate-100 ring-b-0 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${resumeData ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
                <span className="text-xs font-semibold text-slate-500">
                  {resumeData ? 'AI-Enhanced Preview' : 'Live Preview'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {resumeData && (
                  <button
                    onClick={downloadPDF}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-[11px] font-semibold rounded-lg transition-colors"
                  >
                    <FaDownload className="text-[9px]" /> PDF
                  </button>
                )}
              </div>
            </div>

            {/* Preview content - LaTeX paper style */}
            <div className="bg-white rounded-b-xl sm:rounded-b-2xl shadow-md shadow-slate-200/60 ring-1 ring-slate-100 overflow-hidden">
              <div className="p-3 sm:p-5" style={{ backgroundColor: '#e8e8e8' }}>
                <div className="mx-auto" style={{
                  maxWidth: '680px',
                  minHeight: '500px',
                  backgroundColor: '#fff',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)',
                  transformOrigin: 'top center',
                }}>
                  <LiveResumePreview formData={formData} resumeData={resumeData} resumeRef={resumeRef} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
