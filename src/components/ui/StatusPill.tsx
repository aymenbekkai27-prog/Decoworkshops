import type { JobStatus } from '../../types';
import { JOB_STATUS_LABELS } from '../../types';

const STATUS_STYLES: Record<JobStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  inspecting: 'bg-gold-100 text-gold-700',
  executing: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
};

const STATUS_DOTS: Record<JobStatus, string> = {
  new: 'bg-blue-500',
  inspecting: 'bg-gold-500',
  executing: 'bg-purple-500',
  completed: 'bg-green-500',
};

export function StatusPill({ status }: { status: JobStatus }) {
  return (
    <span className={`status-pill ${STATUS_STYLES[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOTS[status]} animate-pulse-soft`} />
      {JOB_STATUS_LABELS[status]}
    </span>
  );
}
