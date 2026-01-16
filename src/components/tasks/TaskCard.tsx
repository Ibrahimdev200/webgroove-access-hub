import { motion } from "framer-motion";
import { Coins, Calendar, Users, ChevronRight, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/hooks/useTasks";
import { formatDistanceToNow, format } from "date-fns";

interface TaskCardProps {
  task: Task;
  index: number;
  onApply?: () => void;
  onViewApplications?: () => void;
  showApplyButton?: boolean;
  showViewApplications?: boolean;
  isOwner?: boolean;
  isAssignee?: boolean;
}

export const TaskCard = ({
  task,
  index,
  onApply,
  onViewApplications,
  showApplyButton,
  showViewApplications,
  isOwner,
  isAssignee,
}: TaskCardProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-blue-500/10 text-blue-500 border-0">Open</Badge>;
      case "in_progress":
        return <Badge className="bg-amber-500/10 text-amber-500 border-0"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-500/10 text-green-500 border-0"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500/10 text-red-500 border-0">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-6 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors"
    >
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-lg text-foreground">{task.title}</h3>
            {getStatusBadge(task.status)}
          </div>
          
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
            {task.description}
          </p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-tau font-semibold">
              <Coins className="w-4 h-4" />
              {task.tau_reward} TAU
            </span>
            
            {task.deadline && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Due {format(new Date(task.deadline), "MMM d, yyyy")}
              </span>
            )}
            
            <span className="text-muted-foreground">
              Posted {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
          {showApplyButton && task.status === "open" && (
            <Button variant="tau" onClick={onApply}>
              Apply Now
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
          
          {showViewApplications && isOwner && (
            <Button variant="outline" onClick={onViewApplications}>
              <Users className="w-4 h-4 mr-2" />
              View Applications
            </Button>
          )}

          {isAssignee && task.status === "in_progress" && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Assigned to you</p>
              <Badge className="bg-amber-500/10 text-amber-500 border-0">
                In Progress
              </Badge>
            </div>
          )}

          {isAssignee && task.status === "completed" && (
            <div className="text-right">
              <Badge className="bg-green-500/10 text-green-500 border-0">
                <CheckCircle className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Requirements (if any) */}
      {task.requirements && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-1">Requirements:</p>
          <p className="text-sm text-foreground">{task.requirements}</p>
        </div>
      )}
    </motion.div>
  );
};