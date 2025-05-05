import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Task, TaskStatus, Column } from '../types';
import { fetchTasks, mapBackendTaskToFrontend, createTask as createTaskApi, 
  updateTaskOnBackend, deleteTaskOnBackend } from '../services/api/taskService';

interface TaskState {
  tasks: Task[];
  columns: Column[];
  isLoading: boolean;
  lastSynced: number | null;
  fetchTasksFromBackend: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Task>;
  updateTask: (taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  moveTask: (taskId: string, sourceStatus: TaskStatus, destinationStatus: TaskStatus) => Promise<void>;
}

const DEFAULT_COLUMNS: Column[] = [
  { id: 'todo', title: 'To Do', tasks: [] },
  { id: 'in-progress', title: 'In Progress', tasks: [] },
  { id: 'review', title: 'Review', tasks: [] },
  { id: 'done', title: 'Done', tasks: [] },
];

// Helper function to organize tasks into columns
const organizeTasksIntoColumns = (tasks: Task[]): Column[] => {
  const columns = JSON.parse(JSON.stringify(DEFAULT_COLUMNS)) as Column[];
  
  tasks.forEach(task => {
    const column = columns.find(col => col.id === task.status);
    if (column) {
      column.tasks.push(task);
    } else {
      // If task has an invalid status, default to todo
      columns[0].tasks.push({...task, status: 'todo'});
    }
  });
  
  return columns;
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      columns: DEFAULT_COLUMNS,
      isLoading: false,
      lastSynced: null,
      
      fetchTasksFromBackend: async () => {
        set({ isLoading: true });
        
        try {
          const backendTasks = await fetchTasks();
          if (backendTasks && backendTasks.length > 0) {
            const formattedTasks = backendTasks.map(mapBackendTaskToFrontend);
            const columns = organizeTasksIntoColumns(formattedTasks);
            
            set({ 
              tasks: formattedTasks, 
              columns, 
              isLoading: false,
              lastSynced: Date.now()
            });
          } else {
            set({ isLoading: false, lastSynced: Date.now() });
          }
        } catch (error) {
          console.error('Error fetching tasks:', error);
          set({ isLoading: false });
        }
      },
      
      addTask: async (taskData) => {
        // Create locally first for immediate feedback
        const task: Task = {
          ...taskData,
          id: uuidv4(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          labels: taskData.labels || [],
        };
        
        set(state => {
          const updatedTasks = [...state.tasks, task];
          const updatedColumns = state.columns.map(column => {
            if (column.id === task.status) {
              return {
                ...column,
                tasks: [...column.tasks, task],
              };
            }
            return column;
          });
          
          return { tasks: updatedTasks, columns: updatedColumns };
        });
        
        // Also create on the backend
        try {
          const createdTask = await createTaskApi(taskData);
          if (createdTask) {
            // Update the local task with the backend ID and data
            set(state => {
              // Replace our temporary task with the one from the backend
              const updatedTasks = state.tasks.filter(t => t.id !== task.id).concat(createdTask);
              const columns = organizeTasksIntoColumns(updatedTasks);
              
              return { tasks: updatedTasks, columns };
            });
            return createdTask;
          }
        } catch (error) {
          console.error('Error creating task on backend:', error);
        }
        
        return task;
      },
      
      updateTask: async (taskId, updates) => {
        // Update locally first for immediate feedback
        set(state => {
          const taskIndex = state.tasks.findIndex(t => t.id === taskId);
          
          if (taskIndex === -1) return state;
          
          const oldTask = state.tasks[taskIndex];
          const updatedTask = {
            ...oldTask,
            ...updates,
            updatedAt: Date.now(),
          };
          
          const updatedTasks = [...state.tasks];
          updatedTasks[taskIndex] = updatedTask;
          
          // Update columns if the status has changed
          let updatedColumns = state.columns;
          if (updates.status && updates.status !== oldTask.status) {
            updatedColumns = state.columns.map(column => {
              if (column.id === oldTask.status) {
                return {
                  ...column,
                  tasks: column.tasks.filter(t => t.id !== taskId),
                };
              }
              if (column.id === updates.status) {
                return {
                  ...column,
                  tasks: [...column.tasks, updatedTask],
                };
              }
              return column;
            });
          } else {
            // Just update the task in its current column
            updatedColumns = state.columns.map(column => {
              if (column.id === updatedTask.status) {
                return {
                  ...column,
                  tasks: column.tasks.map(t => t.id === taskId ? updatedTask : t),
                };
              }
              return column;
            });
          }
          
          return { tasks: updatedTasks, columns: updatedColumns };
        });
        
        // Also update on the backend
        try {
          await updateTaskOnBackend(taskId, updates);
        } catch (error) {
          console.error('Error updating task on backend:', error);
        }
      },
      
      deleteTask: async (taskId) => {
        // Delete locally first for immediate feedback
        set(state => {
          const taskToDelete = state.tasks.find(t => t.id === taskId);
          if (!taskToDelete) return state;
          
          const updatedTasks = state.tasks.filter(t => t.id !== taskId);
          
          const updatedColumns = state.columns.map(column => {
            if (column.id === taskToDelete.status) {
              return {
                ...column,
                tasks: column.tasks.filter(t => t.id !== taskId),
              };
            }
            return column;
          });
          
          return { tasks: updatedTasks, columns: updatedColumns };
        });
        
        // Also delete on the backend
        try {
          await deleteTaskOnBackend(taskId);
        } catch (error) {
          console.error('Error deleting task on backend:', error);
        }
      },
      
      moveTask: async (taskId, sourceStatus, destinationStatus) => {
        // Move locally first for immediate feedback
        set(state => {
          const taskToMove = state.tasks.find(t => t.id === taskId);
          if (!taskToMove) return state;
          
          // Update the task's status
          const updatedTask = {
            ...taskToMove,
            status: destinationStatus,
            updatedAt: Date.now(),
          };
          
          const updatedTasks = state.tasks.map(t => 
            t.id === taskId ? updatedTask : t
          );
          
          // Update columns
          const updatedColumns = state.columns.map(column => {
            if (column.id === sourceStatus) {
              return {
                ...column,
                tasks: column.tasks.filter(t => t.id !== taskId),
              };
            }
            if (column.id === destinationStatus) {
              return {
                ...column,
                tasks: [...column.tasks, updatedTask],
              };
            }
            return column;
          });
          
          return { tasks: updatedTasks, columns: updatedColumns };
        });
        
        // Also update on the backend
        try {
          await updateTaskOnBackend(taskId, { status: destinationStatus });
        } catch (error) {
          console.error('Error updating task status on backend:', error);
        }
      },
    }),
    {
      name: 'task-storage',
      onRehydrateStorage: () => (state) => {
        // When the store rehydrates from localStorage, also fetch from backend
        if (state) {
          setTimeout(() => {
            state.fetchTasksFromBackend();
          }, 1000); // Delay to ensure app is fully loaded
        }
      }
    }
  )
);