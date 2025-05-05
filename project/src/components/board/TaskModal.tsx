import React, { useState, useEffect } from 'react';
import { CalendarIcon, User } from 'lucide-react';
import { Modal, ModalFooter } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { formatDate } from '../../lib/utils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
}

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];
const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
];

export const TaskModal = ({ isOpen, onClose, task, onSave }: TaskModalProps) => {
  const { user, users } = useAuthStore();
  const isEditMode = !!task;
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<string>('');
  const [labels, setLabels] = useState<string[]>([]);
  const [newLabel, setNewLabel] = useState('');
  
  // Reset form when modal opens/closes or task changes
  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setPriority(task.priority);
      setAssigneeId(task.assigneeId);
      setLabels(task.labels);
      
      if (task.dueDate) {
        const date = new Date(task.dueDate);
        setDueDate(date.toISOString().split('T')[0]);
      } else {
        setDueDate('');
      }
    } else if (isOpen) {
      // New task - set defaults
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setAssigneeId(null);
      setDueDate('');
      setLabels([]);
    }
  }, [isOpen, task]);
  
  const handleSave = () => {
    if (!title.trim()) return;
    
    const taskData = {
      id: task?.id,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assigneeId,
      createdBy: task?.createdBy || user?.id || '',
      labels,
      dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
    };
    
    onSave(taskData);
    onClose();
  };
  
  const handleAddLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      setLabels([...labels, newLabel.trim()]);
      setNewLabel('');
    }
  };
  
  const handleRemoveLabel = (label: string) => {
    setLabels(labels.filter(l => l !== label));
  };
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={isEditMode ? 'Edit Task' : 'Create New Task'}
      size="lg"
    >
      <div className="space-y-4">
        <Input
          label="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
          error={title.trim() === '' ? 'Title is required' : ''}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            rows={4}
            placeholder="Enter task description"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {STATUSES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {PRIORITIES.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assignee
            </label>
            <select
              value={assigneeId || ''}
              onChange={(e) => setAssigneeId(e.target.value || null)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <CalendarIcon size={16} className="mr-1" /> Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Labels
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {labels.map((label) => (
              <span 
                key={label} 
                className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full flex items-center"
              >
                {label}
                <button 
                  type="button" 
                  onClick={() => handleRemoveLabel(label)}
                  className="ml-1 text-indigo-500 hover:text-indigo-700"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
          <div className="flex">
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Add a label"
              className="flex-1"
            />
            <Button 
              type="button" 
              onClick={handleAddLabel}
              variant="outline"
              className="ml-2"
            >
              Add
            </Button>
          </div>
        </div>
        
        {task && (
          <div className="text-xs text-gray-500 mt-4">
            <p>Created: {formatDate(task.createdAt)}</p>
            <p>Last updated: {formatDate(task.updatedAt)}</p>
          </div>
        )}
      </div>
      
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          {isEditMode ? 'Save Changes' : 'Create Task'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};