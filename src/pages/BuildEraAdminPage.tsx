import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Calendar,
  Target,
  Layers,
  Award,
  Lock,
  Users
} from "lucide-react";
import { format } from "date-fns";
import {
  useBuildPhases,
  useAllBuildTasks,
  useBadges,
  useCreateBuildTask,
  useUpdateBuildTask,
  useDeleteBuildTask,
  useUpdateBuildPhase,
  BuildTask,
  BuildPhase,
  BuildTaskType,
  BuildTaskStatus,
} from "@/hooks/useBuildEra";

export default function BuildEraAdminPage() {
  const { data: phases } = useBuildPhases();
  const { data: tasks } = useAllBuildTasks();
  const { data: badges } = useBadges();
  
  const createTask = useCreateBuildTask();
  const updateTask = useUpdateBuildTask();
  const deleteTask = useDeleteBuildTask();
  const updatePhase = useUpdateBuildPhase();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<BuildTask | null>(null);

  // Task form state
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    task_type: 'daily' as BuildTaskType,
    tau_reward: 1,
    phase_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '2026-05-15',
    status: 'draft' as BuildTaskStatus,
    max_completions_per_user: 1,
    requires_approval: false,
  });

  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      task_type: 'daily',
      tau_reward: 1,
      phase_id: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '2026-05-15',
      status: 'draft',
      max_completions_per_user: 1,
      requires_approval: false,
    });
  };

  const handleCreateTask = () => {
    createTask.mutate({
      title: taskForm.title,
      description: taskForm.description,
      task_type: taskForm.task_type,
      tau_reward: taskForm.tau_reward,
      phase_id: taskForm.phase_id || null,
      start_date: new Date(taskForm.start_date).toISOString(),
      end_date: new Date(taskForm.end_date).toISOString(),
      status: taskForm.status,
      max_completions_per_user: taskForm.max_completions_per_user,
      max_total_completions: null,
      requires_approval: taskForm.requires_approval,
      is_system_task: false,
      created_by: null,
    }, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        resetTaskForm();
      }
    });
  };

  const handleUpdateTask = () => {
    if (!editingTask) return;
    
    updateTask.mutate({
      id: editingTask.id,
      title: taskForm.title,
      description: taskForm.description,
      task_type: taskForm.task_type,
      tau_reward: taskForm.tau_reward,
      phase_id: taskForm.phase_id || null,
      start_date: new Date(taskForm.start_date).toISOString(),
      end_date: new Date(taskForm.end_date).toISOString(),
      status: taskForm.status,
      max_completions_per_user: taskForm.max_completions_per_user,
      requires_approval: taskForm.requires_approval,
    }, {
      onSuccess: () => {
        setEditingTask(null);
        resetTaskForm();
      }
    });
  };

  const handleEditClick = (task: BuildTask) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      task_type: task.task_type,
      tau_reward: task.tau_reward,
      phase_id: task.phase_id || '',
      start_date: new Date(task.start_date).toISOString().split('T')[0],
      end_date: new Date(task.end_date).toISOString().split('T')[0],
      status: task.status,
      max_completions_per_user: task.max_completions_per_user || 1,
      requires_approval: task.requires_approval,
    });
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask.mutate(taskId);
    }
  };

  const handlePhaseToggle = (phase: BuildPhase, isActive: boolean) => {
    // Deactivate all other phases first
    if (isActive && phases) {
      phases.forEach(p => {
        if (p.id !== phase.id && p.is_active) {
          updatePhase.mutate({ id: p.id, is_active: false });
        }
      });
    }
    updatePhase.mutate({ id: phase.id, is_active: isActive });
  };

  const getStatusColor = (status: BuildTaskStatus) => {
    const colors: Record<BuildTaskStatus, string> = {
      draft: 'bg-gray-500',
      scheduled: 'bg-blue-500',
      active: 'bg-green-500',
      inactive: 'bg-yellow-500',
      expired: 'bg-red-500',
    };
    return colors[status];
  };

  const getTypeColor = (type: BuildTaskType) => {
    const colors: Record<BuildTaskType, string> = {
      daily: 'bg-blue-500/10 text-blue-500',
      weekly: 'bg-purple-500/10 text-purple-500',
      seasonal: 'bg-orange-500/10 text-orange-500',
      special: 'bg-yellow-500/10 text-yellow-500',
    };
    return colors[type];
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Build Era Admin</h1>
          <p className="text-muted-foreground">Manage tasks, phases, and rewards for the pre-launch engagement system</p>
        </div>

        <Tabs defaultValue="tasks" className="w-full">
          <TabsList>
            <TabsTrigger value="tasks" className="gap-2">
              <Target className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="phases" className="gap-2">
              <Layers className="h-4 w-4" />
              Phases
            </TabsTrigger>
            <TabsTrigger value="badges" className="gap-2">
              <Award className="h-4 w-4" />
              Badges
            </TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">All Tasks</h2>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2" onClick={resetTaskForm}>
                    <Plus className="h-4 w-4" />
                    Create Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                  </DialogHeader>
                  <TaskForm 
                    form={taskForm} 
                    setForm={setTaskForm} 
                    phases={phases || []}
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleCreateTask} disabled={createTask.isPending}>
                      Create Task
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks?.map(task => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {task.is_system_task && (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="font-medium">{task.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getTypeColor(task.task_type)}>
                          {task.task_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{task.tau_reward} TAU</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                          {task.status}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(task.start_date), 'MMM d')} - {format(new Date(task.end_date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        {task.is_system_task ? (
                          <Badge variant="secondary">Locked</Badge>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <Dialog open={editingTask?.id === task.id} onOpenChange={(open) => !open && setEditingTask(null)}>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(task)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Edit Task</DialogTitle>
                                </DialogHeader>
                                <TaskForm 
                                  form={taskForm} 
                                  setForm={setTaskForm} 
                                  phases={phases || []}
                                />
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                  </DialogClose>
                                  <Button onClick={handleUpdateTask} disabled={updateTask.isPending}>
                                    Save Changes
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Phases Tab */}
          <TabsContent value="phases" className="space-y-4">
            <h2 className="text-lg font-semibold">Build Phases</h2>
            <div className="grid gap-4">
              {phases?.map(phase => (
                <Card key={phase.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                          phase.is_active ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          {phase.phase_number}
                        </div>
                        <div>
                          <h3 className="font-semibold">{phase.name}</h3>
                          <p className="text-sm text-muted-foreground">{phase.description}</p>
                          <div className="text-xs text-muted-foreground mt-1">
                            {format(new Date(phase.start_date), 'MMM d, yyyy')} - {format(new Date(phase.end_date), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`phase-${phase.id}`}>Active</Label>
                          <Switch
                            id={`phase-${phase.id}`}
                            checked={phase.is_active}
                            onCheckedChange={(checked) => handlePhaseToggle(phase, checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-4">
            <h2 className="text-lg font-semibold">Available Badges</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges?.map(badge => (
                <Card key={badge.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{badge.name}</h4>
                        <p className="text-sm text-muted-foreground">{badge.description}</p>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {badge.badge_type === 'auto' ? 'Auto-awarded' : 'Admin approval'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Task Form Component
function TaskForm({ 
  form, 
  setForm, 
  phases 
}: { 
  form: any; 
  setForm: (form: any) => void; 
  phases: BuildPhase[];
}) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Task title"
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Task description"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="task_type">Task Type</Label>
          <Select
            value={form.task_type}
            onValueChange={(value) => setForm({ ...form, task_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="seasonal">Seasonal</SelectItem>
              <SelectItem value="special">Special</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={form.status}
            onValueChange={(value) => setForm({ ...form, status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="tau_reward">TAU Reward</Label>
          <Input
            id="tau_reward"
            type="number"
            min="0.01"
            step="0.01"
            value={form.tau_reward}
            onChange={(e) => setForm({ ...form, tau_reward: parseFloat(e.target.value) || 0 })}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="phase_id">Phase (Optional)</Label>
          <Select
            value={form.phase_id}
            onValueChange={(value) => setForm({ ...form, phase_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select phase" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No phase</SelectItem>
              {phases.map(phase => (
                <SelectItem key={phase.id} value={phase.id}>
                  {phase.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            type="date"
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="end_date">End Date</Label>
          <Input
            id="end_date"
            type="date"
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="max_completions">Max Completions per User</Label>
          <Input
            id="max_completions"
            type="number"
            min="1"
            value={form.max_completions_per_user}
            onChange={(e) => setForm({ ...form, max_completions_per_user: parseInt(e.target.value) || 1 })}
          />
        </div>
        
        <div className="flex items-center gap-2 pt-6">
          <Switch
            id="requires_approval"
            checked={form.requires_approval}
            onCheckedChange={(checked) => setForm({ ...form, requires_approval: checked })}
          />
          <Label htmlFor="requires_approval">Requires Admin Approval</Label>
        </div>
      </div>
    </div>
  );
}
