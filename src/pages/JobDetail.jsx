import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaBriefcase, FaMapMarkerAlt, FaLinkedin, FaExternalLinkAlt,
  FaClock, FaArrowLeft, FaBuilding, FaCheckCircle,
  FaMoneyBillWave, FaUsers, FaFileContract, FaCalendarAlt,
  FaGraduationCap, FaStickyNote, FaCode, FaInfoCircle, FaGlobe
} from 'react-icons/fa';
import { jobAPI } from '../services/api';

const JOB_TYPE_CONFIG = {
  'full-time': { label: 'Full Time', color: 'bg-emerald-500', textColor: 'text-emerald-700', bgLight: 'bg-emerald-50', ring: 'ring-emerald-200' },
  'part-time': { label: 'Part Time', color: 'bg-amber-500', textColor: 'text-amber-700', bgLight: 'bg-amber-50', ring: 'ring-amber-200' },
  'internship': { label: 'Internship', color: 'bg-violet-500', textColor: 'text-violet-700', bgLight: 'bg-violet-50', ring: 'ring-violet-200' },
  'contract': { label: 'Contract', color: 'bg-sky-500', textColor: 'text-sky-700', bgLight: 'bg-sky-50', ring: 'ring-sky-200' },
  'remote': { label: 'Remote', color: 'bg-rose-500', textColor: 'text-rose-700', bgLight: 'bg-rose-50', ring: 'ring-rose-200' },
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const timeAgo = (dateStr) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
};

const JobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setJob(null);

    const fetchJob = async () => {
      try {
        const { data } = await jobAPI.getById(jobId, controller.signal);
        if (!cancelled) {
          setJob(data);
          setLoading(false);
        }
      } catch (err) {
        if (cancelled || err.name === 'CanceledError' || err.name === 'AbortError') return;
        setError('Job not found or something went wrong.');
        setLoading(false);
      }
    };
    fetchJob();
    return () => { cancelled = true; controller.abort(); };
  }, [jobId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="animate-shimmer h-8 w-32 rounded-lg" />
        <div className="animate-shimmer h-36 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="animate-shimmer h-16 rounded-xl" />)}
        </div>
        <div className="animate-shimmer h-[300px] rounded-xl" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/jobs')} className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 text-xs font-medium mb-4 transition-colors">
          <FaArrowLeft className="text-[10px]" /> Back to Jobs Board
        </button>
        <div className="text-center py-16 bg-white rounded-xl shadow-sm ring-1 ring-slate-100">
          <div className="w-14 h-14 rounded-xl bg-slate-50 ring-1 ring-slate-200 flex items-center justify-center mx-auto mb-3">
            <FaBriefcase className="text-lg text-slate-300" />
          </div>
          <p className="text-slate-900 text-base font-bold">Job not found</p>
          <p className="text-slate-500 text-xs mt-1.5 max-w-md mx-auto">This job posting may have been removed or is no longer available.</p>
          <button onClick={() => navigate('/jobs')} className="mt-4 px-4 py-2 bg-indigo-500 text-white text-xs font-semibold rounded-lg hover:bg-indigo-600 transition-colors">
            Browse Jobs
          </button>
        </div>
      </div>
    );
  }

  const typeConfig = JOB_TYPE_CONFIG[job.jobType] || JOB_TYPE_CONFIG['full-time'];

  return (
    <div className="max-w-5xl mx-auto animate-content-fade-in">
      {/* Back */}
      <button onClick={() => navigate('/jobs')} className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 text-xs font-medium mb-4 transition-colors group">
        <FaArrowLeft className="text-[10px] group-hover:-translate-x-0.5 transition-transform" />
        Back to Jobs Board
      </button>

      {/* Hero Header */}
      <div className="bg-white rounded-xl ring-1 ring-slate-200/80 shadow-sm overflow-hidden mb-4">
        <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

        <div className="p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            {/* Company Logo */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 ring-1 ring-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {job.companyLogo ? (
                <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-cover" />
              ) : (
                <FaBuilding className="text-base text-slate-400" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-indigo-600 font-semibold text-xs tracking-wide">{job.companyName}</p>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight mt-0.5 leading-tight">
                {job.designation}
              </h1>

              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ring-1 ${typeConfig.bgLight} ${typeConfig.textColor} ${typeConfig.ring}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${typeConfig.color}`} />
                  {typeConfig.label}
                </span>
                {job.location && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-50 text-slate-600 ring-1 ring-slate-200">
                    <FaMapMarkerAlt className="text-[8px] text-slate-400" />
                    {job.location}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-50 text-slate-500 ring-1 ring-slate-200">
                  <FaClock className="text-[8px] text-slate-400" />
                  {timeAgo(job.createdAt)}
                </span>
              </div>
            </div>

            {/* Desktop Apply */}
            <div className="hidden md:flex flex-col gap-2 flex-shrink-0">
              <a
                href={job.applyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-500 text-white font-bold text-xs rounded-lg hover:bg-indigo-600 active:scale-[0.98] transition-all shadow-md shadow-indigo-500/20"
              >
                Apply Now
                <FaExternalLinkAlt className="text-[9px]" />
              </a>
              {job.companyLinkedin && (
                <a
                  href={job.companyLinkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-5 py-2 text-[#0077B5] font-semibold text-xs rounded-lg ring-1 ring-slate-200 hover:bg-blue-50 hover:ring-[#0077B5]/30 transition-all"
                >
                  <FaLinkedin className="text-xs" />
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <QuickCard icon={<FaBriefcase />} iconBg="bg-indigo-50 text-indigo-500" label="Job Type" value={typeConfig.label} />
        <QuickCard icon={<FaMapMarkerAlt />} iconBg="bg-rose-50 text-rose-500" label="Location" value={job.location || 'Not specified'} />
        <QuickCard icon={<FaCalendarAlt />} iconBg="bg-amber-50 text-amber-500" label="Posted On" value={formatDate(job.createdAt)} />
        <QuickCard
          icon={<FaCheckCircle />}
          iconBg={job.isActive ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'}
          label="Status"
          value={job.isActive ? 'Actively Hiring' : 'Closed'}
          valueClass={job.isActive ? 'text-emerald-600' : 'text-slate-400'}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl ring-1 ring-slate-200/80 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-100">
              <TabButton active={activeTab === 'details'} onClick={() => setActiveTab('details')}>
                Job Details
              </TabButton>
              <TabButton active={activeTab === 'company'} onClick={() => setActiveTab('company')}>
                About Company
              </TabButton>
            </div>

            <div className="p-4 md:p-5">
              {activeTab === 'details' && (
                <div className="space-y-4">
                  {job.description ? (
                    <div>
                      <SectionHeading icon={<FaInfoCircle />} title="Description" />
                      <div className="mt-2 text-slate-600 text-xs leading-[1.85] whitespace-pre-line">
                        {job.description}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FaInfoCircle className="text-xl text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-400 text-xs">No detailed description provided for this role.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'company' && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3.5 rounded-lg bg-gradient-to-br from-slate-50 to-white ring-1 ring-slate-100">
                    <div className="w-11 h-11 rounded-xl bg-white ring-1 ring-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                      {job.companyLogo ? (
                        <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-cover" />
                      ) : (
                        <FaBuilding className="text-sm text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-slate-900">{job.companyName}</h3>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {job.companyLinkedin && (
                          <a
                            href={job.companyLinkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-[#0077B5] hover:text-[#005582] font-medium transition-colors"
                          >
                            <FaLinkedin className="text-[10px]" /> LinkedIn Page
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {job.location && (
                    <div>
                      <SectionHeading icon={<FaMapMarkerAlt />} title="Office Location" />
                      <div className="mt-2 flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 ring-1 ring-slate-100">
                        <div className="w-8 h-8 rounded-md bg-white ring-1 ring-slate-200 flex items-center justify-center flex-shrink-0">
                          <FaMapMarkerAlt className="text-xs text-rose-400" />
                        </div>
                        <p className="text-slate-700 font-medium text-xs">{job.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          {/* Apply Card */}
          <div className="bg-white rounded-xl ring-1 ring-slate-200/80 shadow-sm p-4">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Apply for this role</h3>
            <a
              href={job.applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-indigo-500 text-white font-bold text-xs rounded-lg hover:bg-indigo-600 active:scale-[0.98] transition-all shadow-md shadow-indigo-500/20"
            >
              Apply Now
              <FaExternalLinkAlt className="text-[9px]" />
            </a>
            <p className="text-center text-slate-400 text-[10px] mt-2">You will be redirected to the application page</p>

            {job.companyLinkedin && (
              <>
                <div className="border-t border-slate-100 my-3" />
                <a
                  href={job.companyLinkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full px-4 py-2 text-[#0077B5] font-semibold text-xs rounded-lg bg-blue-50/50 ring-1 ring-blue-100 hover:bg-blue-50 hover:ring-[#0077B5]/30 transition-all"
                >
                  <FaLinkedin className="text-xs" />
                  View on LinkedIn
                </a>
              </>
            )}
          </div>

          {/* Job Overview Card */}
          <div className="bg-white rounded-xl ring-1 ring-slate-200/80 shadow-sm p-4">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Job Overview</h3>
            <div className="space-y-3">
              <OverviewRow icon={<FaBriefcase className="text-indigo-400" />} label="Role" value={job.designation} />
              <OverviewRow icon={<FaBuilding className="text-violet-400" />} label="Company" value={job.companyName} />
              <OverviewRow icon={<FaMapMarkerAlt className="text-rose-400" />} label="Location" value={job.location || 'Not specified'} />
              <OverviewRow
                icon={<FaCheckCircle className={job.isActive ? 'text-emerald-400' : 'text-slate-300'} />}
                label="Status"
                value={job.isActive ? 'Actively Hiring' : 'Closed'}
                valueClass={job.isActive ? 'text-emerald-600 font-semibold' : 'text-slate-400'}
              />
              <OverviewRow icon={<FaClock className="text-amber-400" />} label="Posted" value={timeAgo(job.createdAt)} />
            </div>
          </div>

          {/* Company Mini Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur ring-1 ring-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {job.companyLogo ? (
                  <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-cover" />
                ) : (
                  <FaBuilding className="text-xs text-white/60" />
                )}
              </div>
              <div>
                <p className="font-bold text-xs">{job.companyName}</p>
                <p className="text-slate-400 text-[10px]">{typeConfig.label} Position</p>
              </div>
            </div>
            {job.companyLinkedin && (
              <a
                href={job.companyLinkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[10px] text-slate-300 hover:text-white transition-colors mt-1"
              >
                <FaGlobe className="text-[9px]" />
                View company profile
                <FaExternalLinkAlt className="text-[8px] ml-auto" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Apply Bar */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 backdrop-blur-lg border-t border-slate-200 p-3 z-50">
        <div className="flex items-center gap-2">
          <a
            href={job.applyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-indigo-500 text-white font-bold text-xs rounded-lg shadow-md shadow-indigo-500/20"
          >
            Apply Now
            <FaExternalLinkAlt className="text-[8px]" />
          </a>
          <button
            onClick={() => navigate('/jobs')}
            className="px-4 py-2.5 text-slate-600 font-semibold text-xs rounded-lg ring-1 ring-slate-200 hover:bg-slate-50 transition-colors"
          >
            Back
          </button>
        </div>
      </div>

      <div className="h-16 md:hidden" />
    </div>
  );
};

/* ===== SUB-COMPONENTS ===== */

const QuickCard = ({ icon, iconBg, label, value, valueClass = 'text-slate-900' }) => (
  <div className="bg-white rounded-lg ring-1 ring-slate-200/80 shadow-sm p-3 hover:shadow-md hover:ring-slate-300/80 transition-all group">
    <div className="flex items-center gap-2.5">
      <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider leading-none">{label}</p>
        <p className={`text-xs font-bold mt-1 truncate ${valueClass}`}>{value}</p>
      </div>
    </div>
  </div>
);

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`relative px-5 py-3 text-xs font-semibold transition-colors ${
      active
        ? 'text-indigo-600'
        : 'text-slate-500 hover:text-slate-700'
    }`}
  >
    {children}
    {active && (
      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500 rounded-full" />
    )}
  </button>
);

const SectionHeading = ({ icon, title }) => (
  <div className="flex items-center gap-2">
    <span className="text-indigo-400 text-xs">{icon}</span>
    <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
  </div>
);

const OverviewRow = ({ icon, label, value, valueClass = 'text-slate-700' }) => (
  <div className="flex items-start gap-2.5">
    <div className="w-7 h-7 rounded-md bg-slate-50 ring-1 ring-slate-100 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">{label}</p>
      <p className={`text-xs font-medium mt-0.5 ${valueClass}`}>{value}</p>
    </div>
  </div>
);

export default JobDetail;
