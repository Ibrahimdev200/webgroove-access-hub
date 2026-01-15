import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAdminAnnouncements } from "@/hooks/useNotifications";
import { toast } from "sonner";
import { Megaphone, Trash2, Send, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminPage = () => {
  const { announcements, isLoading, createAnnouncement, deleteAnnouncement, isCreating, isDeleting } = useAdminAnnouncements();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("0");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !message.trim()) {
      toast.error("Please fill in both title and message");
      return;
    }

    createAnnouncement(
      { title: title.trim(), message: message.trim(), priority: parseInt(priority) },
      {
        onSuccess: () => {
          toast.success("Notification sent to all users!");
          setTitle("");
          setMessage("");
          setPriority("0");
        },
        onError: (error) => {
          toast.error("Failed to send notification. Make sure you have admin privileges.");
          console.error(error);
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteAnnouncement(id, {
      onSuccess: () => toast.success("Notification deactivated"),
      onError: () => toast.error("Failed to deactivate notification"),
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground">Manage notifications and announcements</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Create Announcement Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-tau" />
                Send Notification
              </CardTitle>
              <CardDescription>
                Create an announcement that will be visible to all users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., System Maintenance"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Write your announcement message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {message.length}/500
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Normal</SelectItem>
                      <SelectItem value="1">High</SelectItem>
                      <SelectItem value="2">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" disabled={isCreating}>
                  <Send className="w-4 h-4 mr-2" />
                  {isCreating ? "Sending..." : "Send Notification"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Announcements List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-tau" />
                Active Announcements
              </CardTitle>
              <CardDescription>
                Manage existing notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground text-center py-4">Loading...</p>
              ) : announcements.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No announcements yet</p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="p-3 border border-border rounded-lg bg-secondary/30"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">{announcement.title}</h4>
                            {announcement.priority > 0 && (
                              <Badge variant={announcement.priority >= 2 ? "destructive" : "secondary"} className="text-xs">
                                {announcement.priority >= 2 ? "Urgent" : "High"}
                              </Badge>
                            )}
                            {!announcement.is_active && (
                              <Badge variant="outline" className="text-xs">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {announcement.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        {announcement.is_active && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(announcement.id)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminPage;
