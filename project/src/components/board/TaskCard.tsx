import { MoreVertical, Clock, AlertTriangle, Tag } from 'lucide-react';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Dropdown } from '../ui/Dropdown';
import { Task } from '../../types';
import { useTaskStore } from '../../store/taskStore';
import { useAuthStore } from '../../store/authStore';
import { formatDate, getPriorityColor, truncateText } from '../../lib/utils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export const TaskCard = ({ task, onEdit }: TaskCardProps) => {
  const { deleteTask } = useTaskStore();
  const { user, users } = useAuthStore();
  
  const assignee = task.assigneeId ? users.find(u => u.id === task.assigneeId) : null;
  const isPastDue = task.dueDate && task.dueDate < Date.now() && task.status !== 'done';
  const isHighPriority = task.priority === 'high' || task.priority === 'urgent';
  
  return (
    <Card className="mb-2 hover:shadow-md transition-all cursor-pointer group bg-white border border-gray-100 hover:border-primary-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3">
        <div className="flex justify-between items-start">
          <h3 
            className="font-semibold text-gray-800 mb-2 tracking-tight"
            onClick={() => onEdit(task)}
          >
            {truncateText(task.title, 50)}
          </h3>
          
          {/* Show dropdown menu if user is admin or creator of the task */}
          {(user?.role === 'admin' || task.createdBy === user?.id) && (
            <Dropdown
              trigger={
                <button className="text-gray-400 hover:text-gray-600 invisible group-hover:visible">
                  <MoreVertical size={16} />
                </button>
              }
              align="right"
              width={150}
              items={[
                {
                  id: 'edit',
                  label: 'Edit',
                  onClick: () => onEdit(task),
                },
                {
                  id: 'delete',
                  label: 'Delete',
                  danger: true,
                  onClick: () => deleteTask(task.id),
                },
              ]}
            />
          )}
        </div>
        
        {/* Task description */}
        <p 
          className="text-sm text-gray-600 mb-3" 
          onClick={() => onEdit(task)}
        >
          {truncateText(task.description, 100)}
        </p>
        
        <div className="flex flex-wrap gap-1.5 mb-3">
          {/* Priority tag */}
          <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
          
          {/* Due date if exists */}
          {task.dueDate && (
            <span className={`text-xs rounded-full px-2 py-0.5 font-medium flex items-center gap-1
              ${isPastDue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}
            >
              <Clock size={10} />
              {formatDate(task.dueDate)}
            </span>
          )}
          
          {/* Warning icon for high priority */}
          {isHighPriority && !isPastDue && (
            <span className="text-xs rounded-full px-2 py-0.5 font-medium bg-amber-100 text-amber-700 flex items-center gap-1">
              <AlertTriangle size={10} />
              {task.priority === 'urgent' ? 'Urgent' : 'High'}
            </span>
          )}

          {/* Task labels */}
          {task.labels && task.labels.length > 0 && (
            <span className="text-xs rounded-full px-2 py-0.5 font-medium bg-primary-100 text-primary-700 flex items-center gap-1">
              <Tag size={10} />
              {task.labels[0]}{task.labels.length > 1 ? ` +${task.labels.length - 1}` : ''}
            </span>
          )}
        </div>
        
        {/* Footer with assignee */}
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          
          {assignee ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">{assignee.name.split(' ')[0]}</span>
              <Avatar 
                src={assignee.avatar}
                alt={assignee.name}
                size="sm"
              />
            </div>
          ) : (
            <span className="text-xs text-gray-400 italic">Unassigned</span>
          )}
        </div>
      </div>
    </Card>
  );
};