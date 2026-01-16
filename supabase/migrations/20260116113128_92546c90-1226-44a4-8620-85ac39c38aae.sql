-- Create task status enum
CREATE TYPE public.task_status AS ENUM ('open', 'in_progress', 'completed', 'cancelled', 'disputed');

-- Create tasks table for task owners to post work
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  tau_reward NUMERIC NOT NULL CHECK (tau_reward > 0),
  deadline TIMESTAMP WITH TIME ZONE,
  status task_status NOT NULL DEFAULT 'open',
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task applications table (contributors apply for tasks)
CREATE TABLE public.task_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cover_message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, applicant_id)
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_applications ENABLE ROW LEVEL SECURITY;

-- Tasks RLS Policies
CREATE POLICY "Anyone can view open tasks"
  ON public.tasks FOR SELECT
  USING (status = 'open' OR owner_id = auth.uid() OR assigned_to = auth.uid());

CREATE POLICY "Users can create tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their open tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = owner_id AND status = 'open');

-- Task Applications RLS Policies
CREATE POLICY "Task owners can view applications for their tasks"
  ON public.task_applications FOR SELECT
  USING (
    applicant_id = auth.uid() OR 
    task_id IN (SELECT id FROM public.tasks WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can apply to tasks"
  ON public.task_applications FOR INSERT
  WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Applicants can update their applications"
  ON public.task_applications FOR UPDATE
  USING (auth.uid() = applicant_id);

CREATE POLICY "Task owners can update applications"
  ON public.task_applications FOR UPDATE
  USING (task_id IN (SELECT id FROM public.tasks WHERE owner_id = auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_task_applications_updated_at
  BEFORE UPDATE ON public.task_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();