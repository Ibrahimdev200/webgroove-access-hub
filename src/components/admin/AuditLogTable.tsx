import { formatDistanceToNow } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_user_id: string | null;
  target_wallet_id: string | null;
  details: unknown;
  created_at: string;
}

interface AuditLogTableProps {
  logs: AuditLog[];
}

const getActionBadge = (action: string) => {
  switch (action) {
    case "block_user":
      return <Badge variant="destructive">Block User</Badge>;
    case "unblock_user":
      return <Badge className="bg-green-500/10 text-green-500">Unblock User</Badge>;
    case "freeze_wallet":
      return <Badge className="bg-blue-500/10 text-blue-500">Freeze Wallet</Badge>;
    case "unfreeze_wallet":
      return <Badge className="bg-yellow-500/10 text-yellow-500">Unfreeze Wallet</Badge>;
    case "credit_account":
      return <Badge className="bg-green-500/10 text-green-500">Credit</Badge>;
    case "debit_account":
      return <Badge variant="destructive">Debit</Badge>;
    case "recovery_approved":
      return <Badge className="bg-green-500/10 text-green-500">Recovery Approved</Badge>;
    case "recovery_rejected":
      return <Badge variant="destructive">Recovery Rejected</Badge>;
    default:
      return <Badge variant="outline">{action}</Badge>;
  }
};

export const AuditLogTable = ({ logs }: AuditLogTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Action</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                No audit logs yet
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{getActionBadge(log.action)}</TableCell>
                <TableCell className="max-w-[300px]">
                  <p className="text-sm text-muted-foreground truncate">
                    {log.details ? JSON.stringify(log.details) : "No details"}
                  </p>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
