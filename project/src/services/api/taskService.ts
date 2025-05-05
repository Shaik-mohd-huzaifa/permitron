import { Task } from '../../types';

const API_URL = 'http://localhost:5000/api';

/**
 * Fetches all tasks from the backend
 * @returns Promise with task array
 */
export const fetchTasks = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_URL}/tasks`);
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};

/**
 * Maps backend task format to frontend format
 * @param backendTask Task from backend API
 * @returns Formatted task for frontend
 */
export const mapBackendTaskToFrontend = (backendTask: any): Task => {
  return {
    id: backendTask.id,
    title: backendTask.title,
    description: backendTask.description || '',
    // Map status from backend to frontend format
    status: mapBackendStatus(backendTask.status),
    // Default priority if not available
    priority: backendTask.priority || 'medium',
    assigneeId: backendTask.assignedTo || null,
    createdBy: backendTask.createdBy || '',
    // Convert ISO string to timestamp
    createdAt: backendTask.createdAt ? new Date(backendTask.createdAt).getTime() : Date.now(),
    updatedAt: backendTask.updatedAt ? new Date(backendTask.updatedAt).getTime() : Date.now(),
    // Convert due date if present
    dueDate: backendTask.dueDate ? new Date(backendTask.dueDate).getTime() : undefined,
    // Default empty labels array
    labels: backendTask.labels || [],
  };
};

/**
 * Maps backend status to frontend status format
 * @param backendStatus Status from backend
 * @returns Frontend status
 */
const mapBackendStatus = (backendStatus: string): 'todo' | 'in-progress' | 'review' | 'done' => {
  switch (backendStatus) {
    case 'todo':
      return 'todo';
    case 'in-progress':
      return 'in-progress';
    case 'review':
      return 'review';
    case 'done':
      return 'done';
    default:
      return 'todo'; // Default fallback
  }
};

/**
 * Create a task on the backend
 * @param task Task to create
 * @returns Created task or null on error
 */
export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task | null> => {
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        status: task.status,
        assignedTo: task.assigneeId,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create task');
    }

    const data = await response.json();
    return mapBackendTaskToFrontend(data);
  } catch (error) {
    console.error('Error creating task:', error);
    return null;
  }
};

/**
 * Update a task on the backend
 * @param taskId ID of task to update
 * @param updates Task updates
 * @returns Updated task or null on error
 */
export const updateTaskOnBackend = async (
  taskId: string, 
  updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Task | null> => {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: updates.title,
        description: updates.description,
        status: updates.status,
        assignedTo: updates.assigneeId,
        dueDate: updates.dueDate ? new Date(updates.dueDate).toISOString() : null,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update task');
    }

    const data = await response.json();
    return mapBackendTaskToFrontend(data);
  } catch (error) {
    console.error('Error updating task:', error);
    return null;
  }
};

/**
 * Delete a task on the backend
 * @param taskId ID of task to delete
 * @returns Success status
 */
export const deleteTaskOnBackend = async (taskId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'DELETE',
    });

    return response.ok;
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
};

export default {
  fetchTasks,
  createTask,
  updateTaskOnBackend,
  deleteTaskOnBackend,
  mapBackendTaskToFrontend,
};
