import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Ban,
  CheckCircle,
  Snowflake,
  Sun,
  Plus,
  Minus,
  MoreHorizontal,
  Wallet,
} from "lucide-react";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { toast } from "sonner";

interface UserWithWallet {
  user_id: string;
  email: string;
  display_name: string | null;
  is_blocked: boolean;
  blocked_at: string | null;
  blocked_reason: string | null;
  created_at: string;
  wallet?: {
    id: string;
    balance: number;
    is_active: boolean;
    frozen_at: string | null;
    frozen_reason: string | null;
    wallet_address: string;
  };
}

interface UserManagementTableProps {
  users: UserWithWallet[];
}

export const UserManagementTable = ({ users }: UserManagementTableProps) => {
  const { blockUser, freezeWallet, adjustBalance, isBlocking, isFreezing, isAdjusting } = useAdminUsers();
  
  const [actionDialog, setActionDialog] = useState<{
    type: "block" | "unblock" | "freeze" | "unfreeze" | "credit" | "debit" | null;
    user: UserWithWallet | null;
  }>({ type: null, user: null });
  
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleAction = () => {
    if (!actionDialog.user) return;

    const { type, user } = actionDialog;

    switch (type) {
      case "block":
        blockUser(
          { userId: user.user_id, block: true, reason },
          {
            onSuccess: () => {
              toast.success("User blocked successfully");
              closeDialog();
            },
            onError: () => toast.error("Failed to block user"),
          }
        );
        break;
      case "unblock":
        blockUser(
          { userId: user.user_id, block: false },
          {
            onSuccess: () => {
              toast.success("User unblocked successfully");
              closeDialog();
            },
            onError: () => toast.error("Failed to unblock user"),
          }
        );
        break;
      case "freeze":
        if (!user.wallet) return;
        freezeWallet(
          { walletId: user.wallet.id, freeze: true, reason },
          {
            onSuccess: () => {
              toast.success("Wallet frozen successfully");
              closeDialog();
            },
            onError: () => toast.error("Failed to freeze wallet"),
          }
        );
        break;
      case "unfreeze":
        if (!user.wallet) return;
        freezeWallet(
          { walletId: user.wallet.id, freeze: false },
          {
            onSuccess: () => {
              toast.success("Wallet unfrozen successfully");
              closeDialog();
            },
            onError: () => toast.error("Failed to unfreeze wallet"),
          }
        );
        break;
      case "credit":
      case "debit":
        if (!user.wallet || !amount || !description) return;
        adjustBalance(
          {
            walletId: user.wallet.id,
            amount: parseFloat(amount),
            type,
            description,
          },
          {
            onSuccess: () => {
              toast.success(`Account ${type}ed successfully`);
              closeDialog();
            },
            onError: (error) => toast.error(error.message || `Failed to ${type} account`),
          }
        );
        break;
    }
  };

  const closeDialog = () => {
    setActionDialog({ type: null, user: null });
    setReason("");
    setAmount("");
    setDescription("");
  };

  const getDialogContent = () => {
    const { type, user } = actionDialog;
    if (!type || !user) return null;

    switch (type) {
      case "block":
        return {
          title: "Block User",
          description: `Block ${user.email}? They will not be able to access their account.`,
          showReason: true,
          showAmount: false,
        };
      case "unblock":
        return {
          title: "Unblock User",
          description: `Unblock ${user.email}? They will regain access to their account.`,
          showReason: false,
          showAmount: false,
        };
      case "freeze":
        return {
          title: "Freeze Wallet",
          description: `Freeze ${user.email}'s wallet? They will not be able to make transactions.`,
          showReason: true,
          showAmount: false,
        };
      case "unfreeze":
        return {
          title: "Unfreeze Wallet",
          description: `Unfreeze ${user.email}'s wallet? They will be able to make transactions again.`,
          showReason: false,
          showAmount: false,
        };
      case "credit":
        return {
          title: "Credit Account",
          description: `Add TAU to ${user.email}'s wallet.`,
          showReason: false,
          showAmount: true,
        };
      case "debit":
        return {
          title: "Debit Account",
          description: `Remove TAU from ${user.email}'s wallet. Current balance: ${user.wallet?.balance || 0} TAU`,
          showReason: false,
          showAmount: true,
        };
    }
  };

  const dialogContent = getDialogContent();

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Wallet</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.display_name || "No name"}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.is_blocked ? (
                      <Badge variant="destructive">Blocked</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-green-500/10 text-green-500">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.wallet ? (
                      user.wallet.is_active ? (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-500">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Frozen</Badge>
                      )
                    ) : (
                      <Badge variant="outline">No wallet</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Wallet className="w-4 h-4 text-tau" />
                      <span>{user.wallet ? Number(user.wallet.balance).toFixed(2) : "0.00"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.is_blocked ? (
                          <DropdownMenuItem onClick={() => setActionDialog({ type: "unblock", user })}>
                            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                            Unblock User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => setActionDialog({ type: "block", user })}>
                            <Ban className="w-4 h-4 mr-2 text-destructive" />
                            Block User
                          </DropdownMenuItem>
                        )}
                        {user.wallet && (
                          <>
                            {user.wallet.is_active ? (
                              <DropdownMenuItem onClick={() => setActionDialog({ type: "freeze", user })}>
                                <Snowflake className="w-4 h-4 mr-2 text-blue-500" />
                                Freeze Wallet
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => setActionDialog({ type: "unfreeze", user })}>
                                <Sun className="w-4 h-4 mr-2 text-yellow-500" />
                                Unfreeze Wallet
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => setActionDialog({ type: "credit", user })}>
                              <Plus className="w-4 h-4 mr-2 text-green-500" />
                              Credit Account
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setActionDialog({ type: "debit", user })}>
                              <Minus className="w-4 h-4 mr-2 text-destructive" />
                              Debit Account
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!actionDialog.type} onOpenChange={() => closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogContent?.title}</DialogTitle>
            <DialogDescription>{dialogContent?.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {dialogContent?.showReason && (
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter reason for this action..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            )}
            {dialogContent?.showAmount && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (TAU)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="e.g., Bonus reward, Refund, etc."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={isBlocking || isFreezing || isAdjusting}
              variant={actionDialog.type === "block" || actionDialog.type === "debit" ? "destructive" : "default"}
            >
              {isBlocking || isFreezing || isAdjusting ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
