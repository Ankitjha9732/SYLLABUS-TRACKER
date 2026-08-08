import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Flame, TrendingUp, CircleCheck } from 'lucide-react';
import { useProgress } from '../context/ProgressContext.jsx';
import { Spinner } from '../components/Loading.jsx';

const STATUS_COLORS = {
  completed: '#10b981',
  in_progress: '#f59e0b',
  not_started: '#cbd5e1',
};

export const ProgressPage = () => {
  const { tree, stats, activity } = useProgress();

  const statusData = useMemo(() => {
    const t = stats?.totals;
    return [
      { name: 'Completed', value: t?.completed ?? 0 },
      { name: 'In Progress', value: t?.inProgress ?? 0 },
      { name: 'Not Started', value: t?.notStarted ?? 0 },
    ].filter((d) => d.value > 0);
  }, [stats]);

  const moduleData = useMemo(
    () =>
      (stats?.moduleStats || []).map((m) => ({
        name: m.title.length > 14 ? `${m.title.slice(0, 14)}…` : m.title,
        percent: m.progress,
        completed: m.completed,
        total: m.total,
      })),
    [stats]
  );

  const difficultyData = useMemo(() => {
    if (!tree) return [];
    const map = { easy: { completed: 0, total: 0 }, medium: { completed: 0, total: 0 }, hard: { completed: 0, total: 0 } };
    for (const m of tree.modules) {
      for (const t of m.topics) {
        for (const s of t.subtopics) {
          const key = s.difficulty || 'medium';
          if (map[key]) {
            map[key].total += 1;
            if (s.status === 'completed') map[key].completed += 1;
          }
        }
      }
    }
    return Object.entries(map).map(([key, v]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      total: v.total,
      completed: v.completed,
      rate: v.total ? Math.round((v.completed / v.total) * 100) : 0,
    }));
  }, [tree]);

  if (!stats && !tree) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Spinner />
          <span className="text-sm">Loading progress...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800">Progress</h1>
        <p className="mt-1 text-sm text-slate-500">A detailed look at your learning journey.</p>
      </motion.div>

      {/* Top stat strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Overall" value={`${stats?.totals?.overallProgress ?? 0}%`} icon={TrendingUp} accent="text-brand-600" />
        <StatTile label="Completed" value={stats?.totals?.completed ?? 0} icon={CircleCheck} accent="text-emerald-600" />
        <StatTile label="In Progress" value={stats?.totals?.inProgress ?? 0} accent="text-amber-600" />
        <StatTile label="Streak" value={`🔥 ${activity?.streak?.current ?? 0} days`} icon={Flame} accent="text-orange-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status pie */}
        <Card title="Status Breakdown">
          {statusData.length ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name.toLowerCase().replace(' ', '_')]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={30} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-slate-400">No data yet.</p>
          )}
        </Card>

        {/* Module completion chart */}
        <Card className="lg:col-span-1">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">Completion by module</h3>
          {moduleData.length ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moduleData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={0} angle={-28} textAnchor="end" height={56} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    formatter={(v, name) => [v, name]}
                    labelFormatter={(label) => {
                      const mod = moduleData.find((m) => m.name === label);
                      return mod ? `${mod.name} — ${mod.completed}/${mod.total}` : label;
                    }}
                  />
                  <Bar dataKey="percent" name="Completion %" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={34} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-slate-400">No modules yet.</p>
          )}
        </Card>
      </div>

      {/* Difficulty breakdown */}
      <Card>
        <h3 className="mb-4 text-sm font-semibold text-slate-700">Difficulty breakdown</h3>
        {difficultyData.length ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {difficultyData.map((d) => (
              <div key={d.name} className="rounded-xl border border-slate-100 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">{d.name}</p>
                  <p className="text-xs text-slate-400">{d.completed}/{d.total}</p>
                </div>
                <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all duration-500"
                    style={{ width: `${d.rate}%` }}
                  />
                </div>
                <p className="mt-2 text-xs font-medium text-slate-500">{d.rate}% completed</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-slate-400">No difficulty data available.</p>
        )}
      </Card>
    </div>
  );
};

const Card = ({ children, className = '' }) => (
  <div className={`rounded-2xl border border-slate-100 bg-white p-6 shadow-card ${className}`}>
    {children}
  </div>
);

const StatTile = ({ label, value, icon: Icon, accent }) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
    <div className={`mb-2 flex items-center gap-1.5 text-sm font-medium ${accent}`}>
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {label}
    </div>
    <p className="text-2xl font-extrabold text-slate-800">{value}</p>
  </div>
);