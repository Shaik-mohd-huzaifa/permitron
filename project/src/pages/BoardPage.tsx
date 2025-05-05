import React, { useState } from 'react';
import { Plus, Search, Calendar } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TaskColumn } from '../components/board/TaskColumn';
import { TaskModal } from '../components/board/TaskModal';
import { Task, TaskStatus } from '../types';

export const BoardPage = () => {
  const { user } = useAuthStore();
  const { columns, addTask, updateTask, moveTask } = useTaskStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | undefined>(undefined);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [sourceColumnId, setSourceColumnId] = useState<TaskStatus | null>(null);
  
  // Filter tasks based on search query
  const filteredColumns = columns.map(column => ({
    ...column,
    tasks: column.tasks.filter(task => 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  }));
  
  const handleTaskDragStart = (taskId: string, sourceStatus: TaskStatus) => {
    setDraggedTaskId(taskId);
    setSourceColumnId(sourceStatus);
  };
  
  const handleTaskDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleTaskDrop = (e: React.DragEvent, destinationStatus: TaskStatus) => {
    e.preventDefault();
    
    if (draggedTaskId && sourceColumnId && sourceColumnId !== destinationStatus) {
      moveTask(draggedTaskId, sourceColumnId, destinationStatus);
    }
    
    setDraggedTaskId(null);
    setSourceColumnId(null);
  };
  
  const handleOpenTaskModal = (task?: Task) => {
    setCurrentTask(task);
    setIsTaskModalOpen(true);
  };
  
  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    if (taskData.id) {
      // Update existing task
      updateTask(taskData.id, {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        assigneeId: taskData.assigneeId,
        labels: taskData.labels,
        dueDate: taskData.dueDate,
      });
    } else {
      // Create new task
      addTask({
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        assigneeId: taskData.assigneeId,
        createdBy: user?.id || '',
        labels: taskData.labels,
        dueDate: taskData.dueDate,
      });
    }
  };
  
  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-primary-50 to-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 p-6 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary-500 flex items-center justify-center">
            <Calendar size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Task Board</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Input 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={18} />}
              className="w-full sm:w-64 rounded-lg border-gray-200 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            />
          </div>
          
          <Button 
            leftIcon={<Plus size={18} />}
            onClick={() => handleOpenTaskModal()}
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors"
          >
            Add Task
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto pb-4 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full max-w-7xl mx-auto">
          {filteredColumns.map((column) => (
            <TaskColumn
              key={column.id}
              id={column.id}
              title={column.title}
              tasks={column.tasks}
              onTaskDragStart={handleTaskDragStart}
              onTaskDragOver={handleTaskDragOver}
              onTaskDrop={handleTaskDrop}
              onEdit={handleOpenTaskModal}
            />
          ))}
        </div>
      </div>
      
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setCurrentTask(undefined);
        }}
        task={currentTask}
        onSave={handleSaveTask}
      />
    </div>
  );
};