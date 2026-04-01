import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaBriefcase, FaMapMarkerAlt, FaClock, FaArrowRight, FaBuilding, FaChevronRight } from 'react-icons/fa';
import { jobAPI } from '../services/api';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const JOB_TYPE_CONFIG = {
  'full-time': { label: 'Full Time', color: 'bg-emerald-500', textColor: 'text-emerald-700', bgLight: 'bg-emerald-50', ring: 'ring-emerald-600/20' },
  'part-time': { label: 'Part Time', color: 'bg-amber-500', textColor: 'text-amber-700', bgLight: 'bg-amber-50', ring: 'ring-amber-600/20' },
  'internship': { label: 'Internship', color: 'bg-violet-500', textColor: 'text-violet-700', bgLight: 'bg-violet-50', ring: 'ring-violet-600/20' },
  'contract': { label: 'Contract', color: 'bg-sky-500', textColor: 'text-sky-700', bgLight: 'bg-sky-50', ring: 'ring-sky-600/20' },
  'remote': { label: 'Remote', color: 'bg-rose-500', textColor: 'text-rose-700', bgLight: 'bg-rose-50', ring: 'ring-rose-600/20' },
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

/* ========== JOB CARD ========== */
const JobCard = ({ job }) => {
  const navigate = useNavigate();
  const typeConfig = JOB_TYPE_CONFIG[job.jobType] || JOB_TYPE_CONFIG['full-time'];

  return (
    <div
      onClick={() => navigate(`/jobs/${job._id}`)}
      className="group relative bg-white rounded-xl border border-slate-200 hover:border-indigo-400/60 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-8px_rgba(99,102,241,0.12)]"
    >
      <div className="p-4 flex-1 flex flex-col">
        {/* Row 1: Logo + Company + Time */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
              {job.companyLogo ? (
                <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-cover" />
              ) : (
                <FaBuilding className="text-sm text-slate-300" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">{job.companyName}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <FaClock className="text-[8px] text-slate-400" />
                <p className="text-slate-400 text-[10px]">{timeAgo(job.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Job Title */}
        <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors duration-200">
          {job.designation}
        </h3>

        {/* Row 3: Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold ring-1 ${typeConfig.bgLight} ${typeConfig.textColor} ${typeConfig.ring}`}>
            <span className={`w-1 h-1 rounded-full ${typeConfig.color}`} />
            {typeConfig.label}
          </span>
          {job.location && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-slate-50 text-slate-600 ring-1 ring-slate-200/80">
              <FaMapMarkerAlt className="text-[8px] text-slate-400" />
              {job.location}
            </span>
          )}
        </div>

        {/* Row 4: Description */}
        {job.description && (
          <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mt-2.5">
            {job.description}
          </p>
        )}

        <div className="flex-1 min-h-3" />

        {/* Row 5: Footer */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
          <span className="text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors">
            View Details
          </span>
          <div className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-500 transition-all duration-300">
            <FaArrowRight className="text-[9px] text-indigo-500 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300" />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ========== MAIN PAGE ========== */
const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const controller = new AbortController();
    const fetchJobs = async () => {
      try {
        const { data } = await jobAPI.getAll(controller.signal);
        setJobs(data);
      } catch (error) {
        if (error.name === 'CanceledError') return;
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
    return () => controller.abort();
  }, []);

  const filteredJobs = useMemo(() => {
    let result = jobs;

    if (filterType !== 'all') {
      result = result.filter((job) => job.jobType === filterType);
    }

    const query = debouncedSearch.toLowerCase();
    if (query) {
      result = result.filter((job) =>
        job.companyName.toLowerCase().includes(query) ||
        job.designation.toLowerCase().includes(query) ||
        (job.description && job.description.toLowerCase().includes(query)) ||
        (job.location && job.location.toLowerCase().includes(query))
      );
    }

    return result;
  }, [jobs, debouncedSearch, filterType]);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="animate-shimmer h-28 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="animate-shimmer h-[220px] rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-3 sm:px-4 md:px-5 py-3 sm:py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Jobs Board</h1>
              <p className="text-slate-500 text-xs mt-0.5">
                {jobs.length} {jobs.length === 1 ? 'opportunity' : 'opportunities'} available
              </p>
            </div>
            <div className="relative w-full md:w-80">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search jobs, companies, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all placeholder-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 bg-slate-50/50 border-t border-slate-100 flex flex-nowrap sm:flex-wrap gap-1.5 overflow-x-auto scrollbar-hidden">
          <FilterChip active={filterType === 'all'} onClick={() => setFilterType('all')}>
            All Jobs
          </FilterChip>
          {Object.entries(JOB_TYPE_CONFIG).map(([key, { label, color }]) => (
            <FilterChip key={key} active={filterType === key} onClick={() => setFilterType(key)} dotColor={filterType === key ? undefined : color}>
              {label}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Results Count */}
      {filteredJobs.length > 0 && (filterType !== 'all' || debouncedSearch) && (
        <p className="text-xs text-slate-500 px-1">
          Showing <span className="font-semibold text-slate-700">{filteredJobs.length}</span> {filteredJobs.length === 1 ? 'result' : 'results'}
          {debouncedSearch && <> for "<span className="font-semibold text-indigo-600">{debouncedSearch}</span>"</>}
        </p>
      )}

      {/* Jobs Grid */}
      {filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
          <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-3">
            <FaBriefcase className="text-lg text-slate-300" />
          </div>
          <p className="text-slate-900 text-sm font-bold">No jobs posted yet</p>
          <p className="text-slate-500 text-xs mt-1">Check back soon for new opportunities</p>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-3">
            <FaSearch className="text-sm text-slate-300" />
          </div>
          <p className="text-slate-900 text-sm font-bold">No matching jobs</p>
          <p className="text-slate-500 text-xs mt-1">
            No results for "<span className="font-semibold text-slate-700">{searchQuery || filterType}</span>"
          </p>
          <button
            onClick={() => { setSearchQuery(''); setFilterType('all'); }}
            className="mt-4 px-4 py-2 bg-indigo-500 text-white text-xs font-semibold rounded-lg hover:bg-indigo-600 transition-colors shadow-sm"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

/* ===== Filter Chip ===== */
const FilterChip = ({ active, onClick, dotColor, children }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-200 ${
      active
        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
        : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50'
    }`}
  >
    {dotColor && !active && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
    {children}
  </button>
);

export default Jobs;
