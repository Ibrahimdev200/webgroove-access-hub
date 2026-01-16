import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  Plus, 
  Clock, 
  CheckCircle, 
  Users, 
  Coins,
  Calendar,
  Search,
  Filter,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOpenTasks, useMyPostedTasks, useMyAssignedTasks, useMyApplications } from "@/hooks/useTasks";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskApplicationsModal } from "@/components/tasks/TaskApplicationsModal";
import { ApplyToTaskModal } from "@/components/tasks/ApplyToTaskModal";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

const TasksPage = () => {
  const { user } = useAuth();
  const { data: openTasks, isLoading: loadingOpen } = useOpenTasks();
  const { data: myPostedTasks, isLoading: loadingPosted } = useMyPostedTasks();
  const { data: myAssignedTasks, isLoading: loadingAssigned } = useMyAssignedTasks();
  const { data: myApplications, isLoading: loadingApplications } = useMyApplications();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTaskForApplications, setSelectedTaskForApplications] = useState<any>(null);
  const [selectedTaskToApply, setSelectedTaskToApply] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter open tasks (exclude user's own tasks)
  const availableTasks = openTasks?.filter(task => 
    task.owner_id !== user?.id &&
    (searchQuery === "" || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  // Stats
  const postedCount = myPostedTasks?.length || 0;
  const assignedCount = myAssignedTasks?.filter(t => t.status === "in_progress").length || 0;
  const completedCount = myAssignedTasks?.filter(t => t.status === "completed").length || 0;
  const pendingApplications = myApplications?.filter(a => a.status === "pending").length || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-blue-500/10 text-blue-500 border-0">Open</Badge>;
      case "in_progress":
        return <Badge className="bg-amber-500/10 text-amber-500 border-0">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-500/10 text-green-500 border-0">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500/10 text-red-500 border-0">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Task Board</h1>
            <p className="text-muted-foreground">
              Post tasks for contributors or find work to earn TAU
            </p>
          </div>
          <Button variant="tau" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Post a Task
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tasks Posted
              </CardTitle>
              <Briefcase className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{postedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Work
              </CardTitle>
              <Clock className="w-4 h-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">{assignedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{completedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Applications
              </CardTitle>
              <Users className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{pendingApplications}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="browse">Browse Tasks</TabsTrigger>
            <TabsTrigger value="posted">My Posted Tasks</TabsTrigger>
            <TabsTrigger value="working">My Work</TabsTrigger>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
          </TabsList>

          {/* Browse Tasks */}
          <TabsContent value="browse" className="space-y-4">
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loadingOpen ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-6 bg-card rounded-xl border border-border animate-pulse">
                    <div className="h-5 bg-secondary rounded w-1/3 mb-3" />
                    <div className="h-4 bg-secondary rounded w-2/3 mb-2" />
                    <div className="h-4 bg-secondary rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : availableTasks.length > 0 ? (
              <div className="space-y-4">
                {availableTasks.map((task, index) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    index={index}
                    onApply={() => setSelectedTaskToApply(task)}
                    showApplyButton
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tasks available</h3>
                  <p className="text-muted-foreground">
                    Check back later for new tasks or post your own!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* My Posted Tasks */}
          <TabsContent value="posted" className="space-y-4">
            {loadingPosted ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="p-6 bg-card rounded-xl border border-border animate-pulse">
                    <div className="h-5 bg-secondary rounded w-1/3 mb-3" />
                    <div className="h-4 bg-secondary rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : myPostedTasks && myPostedTasks.length > 0 ? (
              <div className="space-y-4">
                {myPostedTasks.map((task, index) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    index={index}
                    onViewApplications={() => setSelectedTaskForApplications(task)}
                    showViewApplications
                    isOwner
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Plus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tasks posted yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Post a task to find contributors for your projects
                  </p>
                  <Button variant="tau" onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Post Your First Task
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* My Work (Assigned Tasks) */}
          <TabsContent value="working" className="space-y-4">
            {loadingAssigned ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="p-6 bg-card rounded-xl border border-border animate-pulse">
                    <div className="h-5 bg-secondary rounded w-1/3 mb-3" />
                    <div className="h-4 bg-secondary rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : myAssignedTasks && myAssignedTasks.length > 0 ? (
              <div className="space-y-4">
                {myAssignedTasks.map((task, index) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    index={index}
                    isAssignee
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No active work</h3>
                  <p className="text-muted-foreground">
                    Apply to tasks to start earning TAU
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* My Applications */}
          <TabsContent value="applications" className="space-y-4">
            {loadingApplications ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="p-6 bg-card rounded-xl border border-border animate-pulse">
                    <div className="h-5 bg-secondary rounded w-1/3 mb-3" />
                    <div className="h-4 bg-secondary rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : myApplications && myApplications.length > 0 ? (
              <div className="space-y-4">
                {myApplications.map((application, index) => (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-card rounded-xl border border-border"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {application.task?.title || "Task"}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {application.task?.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-tau font-medium flex items-center gap-1">
                            <Coins className="w-4 h-4" />
                            {application.task?.tau_reward} TAU
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Applied {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <Badge 
                        className={
                          application.status === "pending" ? "bg-amber-500/10 text-amber-500 border-0" :
                          application.status === "accepted" ? "bg-green-500/10 text-green-500 border-0" :
                          application.status === "rejected" ? "bg-red-500/10 text-red-500 border-0" :
                          "bg-secondary"
                        }
                      >
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                  <p className="text-muted-foreground">
                    Browse open tasks and apply to start earning
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <CreateTaskModal 
          open={showCreateModal} 
          onOpenChange={setShowCreateModal} 
        />

        {selectedTaskForApplications && (
          <TaskApplicationsModal
            task={selectedTaskForApplications}
            open={!!selectedTaskForApplications}
            onOpenChange={(open) => !open && setSelectedTaskForApplications(null)}
          />
        )}

        {selectedTaskToApply && (
          <ApplyToTaskModal
            task={selectedTaskToApply}
            open={!!selectedTaskToApply}
            onOpenChange={(open) => !open && setSelectedTaskToApply(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default TasksPage;