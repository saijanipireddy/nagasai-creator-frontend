const StatCard = ({ icon: Icon, label, value, color, trend }) => {
  return (
    <div className="bg-dark-card p-6 rounded-xl border border-dark-secondary hover:border-dark-accent/50 transition-all duration-300 shadow-sm group hover:shadow-lg hover:shadow-dark-accent/5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-dark-muted text-sm mb-1">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
          {trend !== undefined && (
            <p className={`text-sm mt-2 flex items-center gap-1 ${trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-dark-muted'}`}>
              {trend > 0 ? '+' : ''}{trend}% from last week
            </p>
          )}
        </div>
        <div
          className="p-3 rounded-xl group-hover:scale-110 transition-transform duration-300"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="text-2xl" style={{ color }} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
