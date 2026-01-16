import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Users, Check, X, MessageSquare, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  useTaskApplications, 
  useAcceptApplication, 
  useRejectApplication,
  Task 
} from "@/hooks/useTasks";
import { formatDistanceToNow } from "date-fns";

interface TaskApplicationsModalProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TaskApplicationsModal = ({ task, open, onOpenChange }: TaskApplicationsModalProps) => {
  const { toast } = useToast();
  const { data: applications, isLoading } = useTaskApplications(task.id);
  const acceptApplication = useAcceptApplication();
  const rejectApplication = useRejectApplication();

  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAccept = async (application: any) => {
    setProcessingId(application.id);
    try {
      await acceptApplication.mutateAsync({
        applicationId: application.id,
        taskId: task.id,
        applicantId: application.applicant_id,
      });

      toast({
        title: "Application accepted!",
        description: "The contributor has been assigned to this task.",
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to accept application",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (applicationId: string) => {
    setProcessingId(applicationId);
    try {
      await rejectApplication.mutateAsync(applicationId);

      toast({
        title: "Application rejected",
        description: "The applicant has been notified.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to reject application",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const pendingApplications = applications?.filter(a => a.status === "pending") || [];
  const otherApplications = applications?.filter(a => a.status !== "pending") || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-tau" />
            Task Applications
          </DialogTitle>
          <DialogDescription>
            Review applications for: {task.title}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : applications && applications.length > 0 ? (
          <div className="space-y-4">
            {/* Pending Applications */}
            {pendingApplications.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  Pending ({pendingApplications.length})
                </h4>
                <div className="space-y-3">
                  {pendingApplications.map((application, index) => (
                    <motion.div
                      key={application.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 bg-secondary/50 rounded-lg border border-border"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-tau/10 flex items-center justify-center">
                            <span className="text-tau font-semibold text-sm">
                              {application.applicant_id.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm text-foreground">
                              Applicant
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Applied {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-amber-500/10 text-amber-500 border-0">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      </div>

                      {application.cover_message && (
                        <div className="mb-3 p-3 bg-background rounded-lg">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <MessageSquare className="w-3 h-3" />
                            Cover Message
                          </div>
                          <p className="text-sm text-foreground">
                            {application.cover_message}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleReject(application.id)}
                          disabled={processingId === application.id}
                        >
                          {processingId === application.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="tau"
                          className="flex-1"
                          onClick={() => handleAccept(application)}
                          disabled={processingId === application.id}
                        >
                          {processingId === application.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Accept
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Applications */}
            {otherApplications.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  Previous ({otherApplications.length})
                </h4>
                <div className="space-y-2">
                  {otherApplications.map((application) => (
                    <div
                      key={application.id}
                      className="p-3 bg-secondary/30 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {application.applicant_id.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">Applicant</span>
                      </div>
                      <Badge 
                        variant="secondary"
                        className={
                          application.status === "accepted" ? "bg-green-500/10 text-green-500 border-0" :
                          application.status === "rejected" ? "bg-red-500/10 text-red-500 border-0" :
                          ""
                        }
                      >
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h4 className="font-medium text-foreground mb-1">No applications yet</h4>
            <p className="text-sm text-muted-foreground">
              Contributors will appear here when they apply to your task
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
