import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Coins, 
  Trophy, 
  Target, 
  Flame, 
  Calendar, 
  Gift,
  Copy,
  CheckCircle2,
  Clock,
  Star,
  Zap,
  Users,
  Shield,
  Award
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { toast } from "sonner";
import {
  useBuildPhases,
  useActiveBuildTasks,
  useUserBuildStats,
  useUserTaskCompletions,
  useUserBadges,
  useUserReferralCode,
  useDailyLoginStatus,
  useClaimDailyLogin,
  useCompleteTask,
  useCreateReferralCode,
  getRankInfo,
  BuildTask,
} from "@/hooks/useBuildEra";
import { useWallet } from "@/hooks/useWallet";

const LAUNCH_DATE = new Date("2026-05-15");

const getBadgeIcon = (icon: string | null) => {
  const icons: Record<string, React.ReactNode> = {
    construction: <Award className="h-5 w-5" />,
    star: <Star className="h-5 w-5" />,
    shield: <Shield className="h-5 w-5" />,
    users: <Users className="h-5 w-5" />,
    coins: <Coins className="h-5 w-5" />,
    target: <Target className="h-5 w-5" />,
    flame: <Flame className="h-5 w-5" />,
  };
  return icons[icon || ''] || <Award className="h-5 w-5" />;
};

export default function BuildPassPage() {
  const { data: phases, isLoading: phasesLoading } = useBuildPhases();
  const { data: tasks, isLoading: tasksLoading } = useActiveBuildTasks();
  const { data: stats, isLoading: statsLoading } = useUserBuildStats();
  const { data: completions } = useUserTaskCompletions();
  const { data: userBadges } = useUserBadges();
  const { data: referralCode } = useUserReferralCode();
  const { data: loginStatus } = useDailyLoginStatus();
  const { data: wallet } = useWallet();
  
  const claimDaily = useClaimDailyLogin();
  const completeTask = useCompleteTask();
  const createReferralCode = useCreateReferralCode();

  const daysUntilLaunch = differenceInDays(LAUNCH_DATE, new Date());
  const currentPhase = phases?.find(p => p.is_active);
  const rankInfo = stats ? getRankInfo(stats.current_rank) : getRankInfo('explorer');

  const completedTaskIds = new Set(completions?.map(c => c.task_id) || []);
  
  const dailyTasks = tasks?.filter(t => t.task_type === 'daily' && !t.is_system_task) || [];
  const weeklyTasks = tasks?.filter(t => t.task_type === 'weekly') || [];
  const specialTasks = tasks?.filter(t => t.task_type === 'seasonal' || t.task_type === 'special') || [];

  const handleCopyReferralCode = () => {
    if (referralCode?.code) {
      navigator.clipboard.writeText(referralCode.code);
      toast.success("Referral code copied!");
    }
  };

  const handleCompleteTask = (task: BuildTask) => {
    completeTask.mutate({ taskId: task.id, tauReward: task.tau_reward });
  };

  if (phasesLoading || tasksLoading || statsLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-background border p-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">The Webgrow Build Era</h1>
            </div>
            <p className="text-muted-foreground mb-4">
              You're not waiting for launch — you're building the future.
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="bg-background/80 backdrop-blur rounded-lg px-4 py-2">
                <div className="text-sm text-muted-foreground">Launch in</div>
                <div className="text-2xl font-bold text-primary">{daysUntilLaunch} days</div>
              </div>
              <div className="bg-background/80 backdrop-blur rounded-lg px-4 py-2">
                <div className="text-sm text-muted-foreground">Current Phase</div>
                <div className="text-lg font-semibold">{currentPhase?.name || 'Phase 1'}</div>
              </div>
              <div className="bg-background/80 backdrop-blur rounded-lg px-4 py-2">
                <div className="text-sm text-muted-foreground">Your Rank</div>
                <div className={`text-lg font-semibold ${rankInfo.color}`}>
                  {rankInfo.icon} {rankInfo.label}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Coins className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">TAU Balance</div>
                  <div className="text-2xl font-bold">{wallet?.balance?.toFixed(2) || '0.00'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Target className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Tasks Done</div>
                  <div className="text-2xl font-bold">{stats?.tasks_completed || 0}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Login Streak</div>
                  <div className="text-2xl font-bold">{stats?.login_streak || 0} days</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Trophy className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Contribution</div>
                  <div className="text-2xl font-bold">{stats?.contribution_score || 0}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Login Reward */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Gift className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Daily Login Reward</h3>
                  <p className="text-sm text-muted-foreground">
                    Earn 1 TAU every day just for logging in!
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => claimDaily.mutate()}
                disabled={loginStatus?.claimed || claimDaily.isPending}
                className="gap-2"
              >
                {loginStatus?.claimed ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Claimed
                  </>
                ) : (
                  <>
                    <Coins className="h-4 w-4" />
                    Claim +1 TAU
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Tabs */}
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily" className="gap-2">
              <Calendar className="h-4 w-4" />
              Daily
            </TabsTrigger>
            <TabsTrigger value="weekly" className="gap-2">
              <Clock className="h-4 w-4" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="special" className="gap-2">
              <Star className="h-4 w-4" />
              Special
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4 mt-4">
            {dailyTasks.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No daily tasks available right now. Check back later!
                </CardContent>
              </Card>
            ) : (
              dailyTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  completed={completedTaskIds.has(task.id)}
                  onComplete={() => handleCompleteTask(task)}
                  isPending={completeTask.isPending}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4 mt-4">
            {weeklyTasks.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No weekly tasks available right now. Check back later!
                </CardContent>
              </Card>
            ) : (
              weeklyTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  completed={completedTaskIds.has(task.id)}
                  onComplete={() => handleCompleteTask(task)}
                  isPending={completeTask.isPending}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="special" className="space-y-4 mt-4">
            {specialTasks.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No special tasks available right now. Check back later!
                </CardContent>
              </Card>
            ) : (
              specialTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  completed={completedTaskIds.has(task.id)}
                  onComplete={() => handleCompleteTask(task)}
                  isPending={completeTask.isPending}
                />
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Badges and Referral */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Your Badges
              </CardTitle>
              <CardDescription>Achievements you've unlocked</CardDescription>
            </CardHeader>
            <CardContent>
              {userBadges && userBadges.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {userBadges.map(ub => (
                    <div 
                      key={ub.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {getBadgeIcon(ub.badge?.icon || null)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{ub.badge?.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(ub.awarded_at), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  Complete tasks to earn badges!
                </div>
              )}
            </CardContent>
          </Card>

          {/* Referral Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Referral Program
              </CardTitle>
              <CardDescription>Invite friends and earn TAU</CardDescription>
            </CardHeader>
            <CardContent>
              {referralCode ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-lg text-center">
                      {referralCode.code}
                    </div>
                    <Button variant="outline" size="icon" onClick={handleCopyReferralCode}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">{referralCode.uses_count}</div>
                      <div className="text-sm text-muted-foreground">Referrals</div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">+{referralCode.tau_per_referral}</div>
                      <div className="text-sm text-muted-foreground">TAU per invite</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">Get your unique referral code</p>
                  <Button onClick={() => createReferralCode.mutate()} disabled={createReferralCode.isPending}>
                    Generate Code
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Phase Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Journey to Launch</CardTitle>
            <CardDescription>May 15, 2026 - The official Webgrow launch</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {phases?.map((phase, index) => {
                const isActive = phase.is_active;
                const isPast = new Date(phase.end_date) < new Date();
                const isFuture = new Date(phase.start_date) > new Date();
                
                return (
                  <div 
                    key={phase.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      isActive ? 'border-primary bg-primary/5' : 
                      isPast ? 'border-muted bg-muted/30' : 
                      'border-muted/50 opacity-60'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      isActive ? 'bg-primary text-primary-foreground' :
                      isPast ? 'bg-green-500 text-white' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {isPast ? <CheckCircle2 className="h-5 w-5" /> : phase.phase_number}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{phase.name}</div>
                      <div className="text-sm text-muted-foreground">{phase.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(new Date(phase.start_date), 'MMM d, yyyy')} - {format(new Date(phase.end_date), 'MMM d, yyyy')}
                      </div>
                    </div>
                    {isActive && (
                      <Badge variant="default">Active</Badge>
                    )}
                    {isPast && (
                      <Badge variant="secondary">Completed</Badge>
                    )}
                    {isFuture && (
                      <Badge variant="outline">Upcoming</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Task Card Component
function TaskCard({ 
  task, 
  completed, 
  onComplete, 
  isPending 
}: { 
  task: BuildTask; 
  completed: boolean; 
  onComplete: () => void;
  isPending: boolean;
}) {
  const taskTypeColors: Record<string, string> = {
    daily: 'bg-blue-500/10 text-blue-500',
    weekly: 'bg-purple-500/10 text-purple-500',
    seasonal: 'bg-orange-500/10 text-orange-500',
    special: 'bg-yellow-500/10 text-yellow-500',
  };

  return (
    <Card className={completed ? 'opacity-60' : ''}>
      <CardContent className="py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-lg ${taskTypeColors[task.task_type]}`}>
              <Target className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{task.title}</h4>
                <Badge variant="outline" className="text-xs capitalize">
                  {task.task_type}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{task.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-bold text-primary">+{task.tau_reward} TAU</div>
              <div className="text-xs text-muted-foreground">
                Ends {format(new Date(task.end_date), 'MMM d')}
              </div>
            </div>
            <Button 
              onClick={onComplete}
              disabled={completed || isPending}
              variant={completed ? "secondary" : "default"}
              size="sm"
            >
              {completed ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Done
                </>
              ) : (
                'Complete'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
