import React from 'react';
import { Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';
import { getStatusColor } from '../../lib/utils';
import { Plus } from 'lucide-react';

interface TaskColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  onTaskDragStart: (taskId: string, sourceStatus: TaskStatus) => void;
  onTaskDragOver: (e: React.DragEvent) => void;
  onTaskDrop: (e: React.DragEvent, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
}

export const TaskColumn = ({
  id,
  title,
  tasks,
  onTaskDragStart,
  onTaskDragOver,
  onTaskDrop,
  onEdit,
}: TaskColumnProps) => {
  return (
    <div 
      className="flex flex-col h-full rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden"
      onDragOver={(e) => onTaskDragOver(e)}
      onDrop={(e) => onTaskDrop(e, id)}
    >
      <div className="p-4 flex items-center justify-between sticky top-0 bg-white border-b border-gray-100 z-10">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${getStatusColor(id).replace('bg-', 'bg-').replace('text-', '')}`}></span>
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50/50">
        {tasks.map((task) => (
          <div
            key={task.id}
            draggable
            onDragStart={() => onTaskDragStart(task.id, id)}
            className="transition-transform active:scale-95"
          >
            <TaskCard task={task} onEdit={onEdit} />
          </div>
        ))}
        
        {tasks.length === 0 && (
          <div className="h-32 flex items-center justify-center p-4 text-center rounded-lg border-2 border-dashed border-gray-200 bg-white">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 mb-2 rounded-full bg-gray-100 flex items-center justify-center">
                <Plus size={16} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-400 font-medium">
                Drag tasks here or add a new task
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};