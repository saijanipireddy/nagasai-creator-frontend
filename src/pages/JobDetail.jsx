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
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="animate-shimmer h-10 w-40 rounded-xl" />
        <div className="animate-shimmer h-48 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="animate-shimmer h-24 rounded-2xl" />)}
        </div>
        <div className="animate-shimmer h-[400px] rounded-2xl" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/jobs')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 text-base font-medium mb-6 transition-colors">
          <FaArrowLeft className="text-sm" /> Back to Jobs Board
        </button>
        <div className="text-center py-24 bg-white rounded-2xl shadow-sm ring-1 ring-slate-100">
          <div className="w-20 h-20 rounded-2xl bg-slate-50 ring-1 ring-slate-200 flex items-center justify-center mx-auto mb-5">
            <FaBriefcase className="text-2xl text-slate-300" />
          </div>
          <p className="text-slate-900 text-2xl font-bold">Job not found</p>
          <p className="text-slate-500 text-base mt-2 max-w-md mx-auto">This job posting may have been removed or is no longer available. Try browsing other opportunities.</p>
          <button onClick={() => navigate('/jobs')} className="mt-6 px-6 py-3 bg-indigo-500 text-white text-base font-semibold rounded-xl hover:bg-indigo-600 transition-colors">
            Browse Jobs
          </button>
        </div>
      </div>
    );
  }

  const typeConfig = JOB_TYPE_CONFIG[job.jobType] || JOB_TYPE_CONFIG['full-time'];

  return (
    <div className="max-w-5xl mx-auto animate-content-fade-in">
      {/* Breadcrumb / Back */}
      <button onClick={() => navigate('/jobs')} className="flex items-center gap-2.5 text-slate-500 hover:text-indigo-600 text-base font-medium mb-5 transition-colors group">
        <FaArrowLeft className="text-sm group-hover:-translate-x-0.5 transition-transform" />
        Back to Jobs Board
      </button>

      {/* ===== HERO HEADER ===== */}
      <div className="bg-white rounded-2xl ring-1 ring-slate-200/80 shadow-sm overflow-hidden mb-6">
        {/* Gradient accent */}
        <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

        <div className="p-6 md:p-8">
          {/* Top row: Logo + Info + Apply */}
          <div className="flex flex-col md:flex-row md:items-start gap-5">
            {/* Company Logo */}
            <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 ring-1 ring-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {job.companyLogo ? (
                <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-cover" />
              ) : (
                <FaBuilding className="text-2xl text-slate-400" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-indigo-600 font-semibold text-base tracking-wide">{job.companyName}</p>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-1 leading-tight">
                {job.designation}
              </h1>

              {/* Tags row */}
              <div className="flex flex-wrap items-center gap-2.5 mt-3">
                <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-bold ring-1 ${typeConfig.bgLight} ${typeConfig.textColor} ${typeConfig.ring}`}>
                  <span className={`w-2 h-2 rounded-full ${typeConfig.color}`} />
                  {typeConfig.label}
                </span>
                {job.location && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium bg-slate-50 text-slate-600 ring-1 ring-slate-200">
                    <FaMapMarkerAlt className="text-xs text-slate-400" />
                    {job.location}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium bg-slate-50 text-slate-500 ring-1 ring-slate-200">
                  <FaClock className="text-xs text-slate-400" />
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
                className="flex items-center justify-center gap-2.5 px-9 py-3.5 bg-indigo-500 text-white font-bold text-base rounded-xl hover:bg-indigo-600 active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/20"
              >
                Apply Now
                <FaExternalLinkAlt className="text-xs" />
              </a>
              {job.companyLinkedin && (
                <a
                  href={job.companyLinkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-7 py-3 text-[#0077B5] font-semibold text-base rounded-xl ring-1 ring-slate-200 hover:bg-blue-50 hover:ring-[#0077B5]/30 transition-all"
                >
                  <FaLinkedin />
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== QUICK INFO CARDS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
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

      {/* ===== TWO COLUMN LAYOUT ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="bg-white rounded-2xl ring-1 ring-slate-200/80 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-100">
              <TabButton active={activeTab === 'details'} onClick={() => setActiveTab('details')}>
                Job Details
              </TabButton>
              <TabButton active={activeTab === 'company'} onClick={() => setActiveTab('company')}>
                About Company
              </TabButton>
            </div>

            <div className="p-6 md:p-8">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Description */}
                  {job.description ? (
                    <div>
                      <SectionHeading icon={<FaInfoCircle />} title="Description" />
                      <div className="mt-3 text-slate-600 text-base leading-[1.85] whitespace-pre-line">
                        {job.description}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FaInfoCircle className="text-3xl text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-400 text-base">No detailed description provided for this role.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'company' && (
                <div className="space-y-6">
                  {/* Company card */}
                  <div className="flex items-start gap-4 p-5 rounded-xl bg-gradient-to-br from-slate-50 to-white ring-1 ring-slate-100">
                    <div className="w-16 h-16 rounded-2xl bg-white ring-1 ring-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                      {job.companyLogo ? (
                        <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-cover" />
                      ) : (
                        <FaBuilding className="text-xl text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900">{job.companyName}</h3>
                      <div className="flex flex-wrap gap-3 mt-2">
                        {job.companyLinkedin && (
                          <a
                            href={job.companyLinkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-base text-[#0077B5] hover:text-[#005582] font-medium transition-colors"
                          >
                            <FaLinkedin /> LinkedIn Page
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {job.location && (
                    <div>
                      <SectionHeading icon={<FaMapMarkerAlt />} title="Office Location" />
                      <div className="mt-3 flex items-center gap-3 p-4 rounded-xl bg-slate-50 ring-1 ring-slate-100">
                        <div className="w-10 h-10 rounded-lg bg-white ring-1 ring-slate-200 flex items-center justify-center flex-shrink-0">
                          <FaMapMarkerAlt className="text-rose-400" />
                        </div>
                        <p className="text-slate-700 font-medium text-base">{job.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Right */}
        <div className="space-y-5">
          {/* Apply Card */}
          <div className="bg-white rounded-2xl ring-1 ring-slate-200/80 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 text-lg mb-4">Apply for this role</h3>
            <a
              href={job.applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 w-full px-6 py-4 bg-indigo-500 text-white font-bold text-base rounded-xl hover:bg-indigo-600 active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/20"
            >
              Apply Now
              <FaExternalLinkAlt className="text-xs" />
            </a>
            <p className="text-center text-slate-400 text-sm mt-3">You will be redirected to the application page</p>

            {job.companyLinkedin && (
              <>
                <div className="border-t border-slate-100 my-4" />
                <a
                  href={job.companyLinkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-5 py-3.5 text-[#0077B5] font-semibold text-base rounded-xl bg-blue-50/50 ring-1 ring-blue-100 hover:bg-blue-50 hover:ring-[#0077B5]/30 transition-all"
                >
                  <FaLinkedin className="text-base" />
                  View on LinkedIn
                </a>
              </>
            )}
          </div>

          {/* Job Overview Card */}
          <div className="bg-white rounded-2xl ring-1 ring-slate-200/80 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 text-lg mb-4">Job Overview</h3>
            <div className="space-y-4">
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
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur ring-1 ring-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {job.companyLogo ? (
                  <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-cover" />
                ) : (
                  <FaBuilding className="text-base text-white/60" />
                )}
              </div>
              <div>
                <p className="font-bold text-base">{job.companyName}</p>
                <p className="text-slate-400 text-sm">{typeConfig.label} Position</p>
              </div>
            </div>
            {job.companyLinkedin && (
              <a
                href={job.companyLinkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors mt-2"
              >
                <FaGlobe className="text-xs" />
                View company profile
                <FaExternalLinkAlt className="text-[10px] ml-auto" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ===== MOBILE STICKY APPLY BAR ===== */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 backdrop-blur-lg border-t border-slate-200 p-4 z-50">
        <div className="flex items-center gap-3">
          <a
            href={job.applyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-indigo-500 text-white font-bold text-base rounded-xl shadow-lg shadow-indigo-500/20"
          >
            Apply Now
            <FaExternalLinkAlt className="text-[10px]" />
          </a>
          <button
            onClick={() => navigate('/jobs')}
            className="px-5 py-3.5 text-slate-600 font-semibold text-base rounded-xl ring-1 ring-slate-200 hover:bg-slate-50 transition-colors"
          >
            Back
          </button>
        </div>
      </div>

      {/* Bottom spacer for mobile sticky bar */}
      <div className="h-20 md:hidden" />
    </div>
  );
};

/* ===== SUB-COMPONENTS ===== */

const QuickCard = ({ icon, iconBg, label, value, valueClass = 'text-slate-900' }) => (
  <div className="bg-white rounded-xl ring-1 ring-slate-200/80 shadow-sm p-5 hover:shadow-md hover:ring-slate-300/80 transition-all group">
    <div className="flex items-center gap-3.5">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider leading-none">{label}</p>
        <p className={`text-base font-bold mt-1.5 truncate ${valueClass}`}>{value}</p>
      </div>
    </div>
  </div>
);

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`relative px-7 py-4.5 text-base font-semibold transition-colors ${
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
  <div className="flex items-center gap-2.5">
    <span className="text-indigo-400 text-base">{icon}</span>
    <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
  </div>
);

const OverviewRow = ({ icon, label, value, valueClass = 'text-slate-700' }) => (
  <div className="flex items-start gap-3.5">
    <div className="w-10 h-10 rounded-lg bg-slate-50 ring-1 ring-slate-100 flex items-center justify-center flex-shrink-0 text-base mt-0.5">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
      <p className={`text-base font-medium mt-0.5 ${valueClass}`}>{value}</p>
    </div>
  </div>
);

export default JobDetail;
