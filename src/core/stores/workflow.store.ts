import { create } from 'zustand';

interface WorkflowState {
  currentStep: string;
  progress: number;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  data: Record<string, any>;
  error?: string;

  // Actions
  startWorkflow: (config: any) => void;
  pauseWorkflow: () => void;
  resumeWorkflow: () => void;
  cancelWorkflow: () => void;
  resetWorkflow: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
  currentStep: 'import',
  progress: 0,
  status: 'idle',
  data: {},

  startWorkflow: (config) => set({ status: 'running', progress: 0 }),
  pauseWorkflow: () => set({ status: 'paused' }),
  resumeWorkflow: () => set({ status: 'running' }),
  cancelWorkflow: () => set({ status: 'idle', progress: 0 }),
  resetWorkflow: () => set({ status: 'idle', progress: 0, currentStep: 'import', data: {}, error: undefined })
}));
