import { useState, useEffect } from 'react';
import { FaBullhorn, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { announcementAPI } from '../services/api';

const PRIORITY_COLORS = {
  urgent: 'border-l-red-500 bg-red-50/5',
  high: 'border-l-orange-500 bg-orange-50/5',
  normal: 'border-l-blue-500',
  low: 'border-l-gray-500',
};

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    announcementAPI.getStudentAnnouncements()
      .then(res => setAnnouncements(res.data.announcements || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    try {
      await announcementAPI.markRead(id);
      setAnnouncements(prev => prev.map(a => a._id === id ? { ...a, isRead: true } : a));
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <FaSpinner className="animate-spin text-2xl text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <FaBullhorn className="text-2xl text-indigo-500" />
        <h1 className="text-2xl font-bold text-gray-800">Announcements</h1>
      </div>

      {announcements.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <FaBullhorn className="text-4xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No announcements yet</p>
        </div>
      ) : (
        announcements.map(ann => (
          <div
            key={ann._id}
            className={`bg-white rounded-xl shadow-sm border-l-4 p-4 ${PRIORITY_COLORS[ann.priority] || ''} ${!ann.isRead ? 'ring-1 ring-indigo-200 cursor-pointer' : ''}`}
            onClick={() => !ann.isRead && markRead(ann._id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-semibold ${!ann.isRead ? 'text-gray-900' : 'text-gray-600'}`}>{ann.title}</h3>
                  {!ann.isRead && (
                    <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                  )}
                  {ann.priority === 'urgent' && (
                    <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-600 rounded">Urgent</span>
                  )}
                  {ann.priority === 'high' && (
                    <span className="px-1.5 py-0.5 text-xs bg-orange-100 text-orange-600 rounded">Important</span>
                  )}
                </div>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">{ann.content}</p>
                <p className="text-gray-400 text-xs mt-2">{new Date(ann.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
              {ann.isRead && (
                <FaCheckCircle className="text-green-400 text-sm mt-1 ml-2 flex-shrink-0" />
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Announcements;
