import { motion } from "framer-motion";
import { Clock, ArrowDownLeft, ArrowUpRight, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import {
  useIncomingTransfers,
  useOutgoingTransfers,
  useAcceptTransfer,
  useCancelTransfer,
  PendingTransfer,
} from "@/hooks/usePendingTransfers";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const TransferCard = ({ 
  transfer, 
  type 
}: { 
  transfer: PendingTransfer; 
  type: "incoming" | "outgoing";
}) => {
  const { toast } = useToast();
  const acceptTransfer = useAcceptTransfer();
  const cancelTransfer = useCancelTransfer();

  const isExpiringSoon = new Date(transfer.expires_at).getTime() - Date.now() < 6 * 60 * 60 * 1000; // 6 hours

  const handleAccept = async () => {
    try {
      await acceptTransfer.mutateAsync(transfer.id);
      toast({
        title: "Transfer Accepted!",
        description: `You received ${transfer.amount} TAU successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to Accept",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleCancel = async () => {
    try {
      await cancelTransfer.mutateAsync(transfer.id);
      toast({
        title: "Transfer Cancelled",
        description: "The pending transfer has been cancelled.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to Cancel",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 bg-card rounded-lg border"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          type === "incoming" 
            ? "bg-tau/10 text-tau" 
            : "bg-orange-100 dark:bg-orange-900/20 text-orange-500"
        }`}>
          {type === "incoming" ? (
            <ArrowDownLeft className="w-5 h-5" />
          ) : (
            <ArrowUpRight className="w-5 h-5" />
          )}
        </div>
        <div>
          <p className="font-medium">
            {type === "incoming" 
              ? `From ${transfer.sender_profile?.display_name || "Unknown"}`
              : `To ${transfer.recipient_profile?.display_name || "Unknown"}`
            }
          </p>
          {type === "incoming" && transfer.sender_wallet && (
            <p className="text-xs text-muted-foreground font-mono">
              {transfer.sender_wallet.wallet_address}
            </p>
          )}
          {transfer.purpose && (
            <p className="text-xs text-muted-foreground">{transfer.purpose}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className={`text-xs ${isExpiringSoon ? "text-amber-500" : "text-muted-foreground"}`}>
              Expires {formatDistanceToNow(new Date(transfer.expires_at), { addSuffix: true })}
            </span>
            {isExpiringSoon && <Badge variant="outline" className="text-xs py-0">Expiring Soon</Badge>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className={`text-lg font-bold ${type === "incoming" ? "text-tau" : "text-foreground"}`}>
            {type === "incoming" ? "+" : ""}{transfer.amount} TAU
          </p>
          <Badge variant="secondary" className="text-xs">Pending</Badge>
        </div>

        {type === "incoming" ? (
          <Button 
            size="sm" 
            onClick={handleAccept}
            disabled={acceptTransfer.isPending}
            className="bg-tau hover:bg-tau/90"
          >
            {acceptTransfer.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4 mr-1" />
                Accept
              </>
            )}
          </Button>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                size="sm" 
                variant="outline"
                disabled={cancelTransfer.isPending}
              >
                {cancelTransfer.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Transfer?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel this pending transfer of {transfer.amount} TAU? 
                  The recipient will be notified.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Transfer</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancel}>Yes, Cancel</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </motion.div>
  );
};

export const PendingTransfersSection = () => {
  const { data: incomingTransfers = [], isLoading: loadingIncoming } = useIncomingTransfers();
  const { data: outgoingTransfers = [], isLoading: loadingOutgoing } = useOutgoingTransfers();

  const hasTransfers = incomingTransfers.length > 0 || outgoingTransfers.length > 0;

  if (loadingIncoming || loadingOutgoing) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasTransfers) {
    return null;
  }

  return (
    <div className="space-y-6">
      {incomingTransfers.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowDownLeft className="w-5 h-5 text-tau" />
              Incoming Transfers
              <Badge className="ml-2">{incomingTransfers.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {incomingTransfers.map((transfer) => (
              <TransferCard key={transfer.id} transfer={transfer} type="incoming" />
            ))}
          </CardContent>
        </Card>
      )}

      {outgoingTransfers.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-orange-500" />
              Pending Outgoing Transfers
              <Badge variant="secondary" className="ml-2">{outgoingTransfers.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {outgoingTransfers.map((transfer) => (
              <TransferCard key={transfer.id} transfer={transfer} type="outgoing" />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
