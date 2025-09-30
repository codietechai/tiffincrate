"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/layout/Navbar";
import { LoadingPage } from "@/components/ui/loading";
import {
  Plus,
  MessageCircle,
  Clock,
  CircleCheck as CheckCircle,
  Circle as XCircle,
  TriangleAlert as AlertTriangle,
  Send,
} from "lucide-react";

interface HelpRequest {
  _id: string;
  fromUserId: {
    name: string;
    email: string;
    role: string;
  };
  toUserId?: {
    name: string;
    email: string;
    role: string;
  };
  type: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  category: string;
  responses: Array<{
    userId: {
      name: string;
      role: string;
    };
    message: string;
    timestamp: string;
    isAdmin: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function HelpRequestsPage() {
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(
    null
  );
  const [newRequest, setNewRequest] = useState({
    type: "admin_support",
    subject: "",
    message: "",
    priority: "medium",
    category: "general",
    toUserId: "",
  });
  const [response, setResponse] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchHelpRequests();
  }, [statusFilter, typeFilter]);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/auth/login");
    }
  };

  const fetchHelpRequests = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (typeFilter) params.append("type", typeFilter);
      params.append("limit", "20");

      const response = await fetch(`/api/help-requests?${params}`);
      if (response.ok) {
        const data = await response.json();
        setHelpRequests(data.helpRequests);
      }
    } catch (error) {
      console.error("Error fetching help requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const createHelpRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const payload = { ...newRequest };
      if (payload.type === "admin_support" || payload.type === "provider_support") {
        delete (payload as any).toUserId;
      }
      const response = await fetch("/api/help-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Help request created successfully");
        setNewRequest({
          type: "admin_support",
          subject: "",
          message: "",
          priority: "medium",
          category: "general",
          toUserId: "",
        });
        setIsDialogOpen(false);
        fetchHelpRequests();
      } else {
        setError(data.error || "Failed to create help request");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    }
  };

  const addResponse = async (requestId: string) => {
    if (!response.trim()) return;

    try {
      const res = await fetch(`/api/help-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ response }),
      });

      if (res.ok) {
        setResponse("");
        fetchHelpRequests();
        if (selectedRequest) {
          const updatedResponse = await fetch(
            `/api/help-requests/${requestId}`
          );
          if (updatedResponse.ok) {
            const data = await updatedResponse.json();
            setSelectedRequest(data.helpRequest);
          }
        }
      }
    } catch (error) {
      console.error("Error adding response:", error);
    }
  };

  const updateStatus = async (requestId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/help-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchHelpRequests();
        if (selectedRequest && selectedRequest._id === requestId) {
          setSelectedRequest({ ...selectedRequest, status: newStatus });
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <Clock className="h-4 w-4" />;
      case "in_progress":
        return <AlertTriangle className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      case "closed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Help Requests</h1>
            <p className="text-gray-600">
              Manage support requests and communications
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Help Request</DialogTitle>
                <DialogDescription>
                  Submit a new help request for support or assistance
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={createHelpRequest} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Request Type</Label>
                    <Select
                      value={newRequest.type}
                      onValueChange={(value) =>
                        setNewRequest((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin_support">
                          Admin Support
                        </SelectItem>
                        {user?.role === "consumer" && (
                          <SelectItem value="provider_support">
                            Provider Support
                          </SelectItem>
                        )}
                        {user?.role === "provider" && (
                          <SelectItem value="admin_support">
                            Contact Admin
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newRequest.priority}
                      onValueChange={(value) =>
                        setNewRequest((prev) => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newRequest.category}
                    onValueChange={(value) =>
                      setNewRequest((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="order">Order</SelectItem>
                      <SelectItem value="account">Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    value={newRequest.subject}
                    onChange={(e) =>
                      setNewRequest((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Detailed description of your issue or request"
                    value={newRequest.message}
                    onChange={(e) =>
                      setNewRequest((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    rows={4}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Request</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {success && (
          <Alert className="mb-6">
            <AlertDescription className="text-green-600">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="all">All Requests</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="admin_support">Admin Support</SelectItem>
                  <SelectItem value="provider_support">
                    Provider Support
                  </SelectItem>
                  <SelectItem value="consumer_to_provider">
                    Consumer to Provider
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="all" className="space-y-4">
            {helpRequests.length > 0 ? (
              helpRequests.map((request) => (
                <Card
                  key={request._id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{request.subject}</h3>
                          <Badge className={getStatusColor(request.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(request.status)}
                              {request.status.replace("_", " ")}
                            </div>
                          </Badge>
                          <Badge className={getPriorityColor(request.priority)}>
                            {request.priority}
                          </Badge>
                          <Badge variant="outline">{request.category}</Badge>
                        </div>

                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {request.message}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            From: {request.fromUserId.name} (
                            {request.fromUserId.role})
                          </span>
                          {request.toUserId && (
                            <span>
                              To: {request.toUserId.name} (
                              {request.toUserId.role})
                            </span>
                          )}
                          <span>•</span>
                          <span>
                            {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span>{request.responses.length} responses</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {user?.role === "admin" &&
                          request.status !== "resolved" &&
                          request.status !== "closed" && (
                            <Select
                              value={request.status}
                              onValueChange={(value) =>
                                updateStatus(request._id, value)
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">
                                  In Progress
                                </SelectItem>
                                <SelectItem value="resolved">
                                  Resolved
                                </SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                          )}

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <MessageCircle className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                {selectedRequest?.subject}
                                <Badge
                                  className={getStatusColor(
                                    selectedRequest?.status || ""
                                  )}
                                >
                                  {selectedRequest?.status.replace("_", " ")}
                                </Badge>
                              </DialogTitle>
                              <DialogDescription>
                                Request #{selectedRequest?._id.slice(-8)} •{" "}
                                {selectedRequest?.category}
                              </DialogDescription>
                            </DialogHeader>

                            {selectedRequest && (
                              <div className="space-y-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="font-medium">
                                      {selectedRequest.fromUserId.name}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      {new Date(
                                        selectedRequest.createdAt
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-gray-700">
                                    {selectedRequest.message}
                                  </p>
                                </div>

                                {selectedRequest.responses.length > 0 && (
                                  <div className="space-y-4">
                                    <h4 className="font-medium">Responses</h4>
                                    {selectedRequest.responses.map(
                                      (resp, index) => (
                                        <div
                                          key={index}
                                          className="bg-blue-50 p-4 rounded-lg"
                                        >
                                          <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium">
                                                {resp.userId.name}
                                              </span>
                                              {resp.isAdmin && (
                                                <Badge
                                                  variant="default"
                                                  className="text-xs"
                                                >
                                                  Admin
                                                </Badge>
                                              )}
                                            </div>
                                            <span className="text-sm text-gray-500">
                                              {new Date(
                                                resp.timestamp
                                              ).toLocaleString()}
                                            </span>
                                          </div>
                                          <p className="text-gray-700">
                                            {resp.message}
                                          </p>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}

                                {selectedRequest.status !== "closed" &&
                                  selectedRequest.status !== "resolved" && (
                                    <div className="space-y-2">
                                      <Label htmlFor="response">
                                        Add Response
                                      </Label>
                                      <Textarea
                                        id="response"
                                        placeholder="Type your response..."
                                        value={response}
                                        onChange={(e) =>
                                          setResponse(e.target.value)
                                        }
                                        rows={3}
                                      />
                                      <Button
                                        onClick={() =>
                                          addResponse(selectedRequest._id)
                                        }
                                        disabled={!response.trim()}
                                      >
                                        <Send className="mr-2 h-4 w-4" />
                                        Send Response
                                      </Button>
                                    </div>
                                  )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No help requests found
                </h3>
                <p className="text-gray-600">
                  Create a new help request to get started
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="open" className="space-y-4">
            {helpRequests
              .filter((req) => req.status === "open")
              .map((request) => (
                <Card key={request._id}>
                  {/* Same card content as above */}
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="in_progress" className="space-y-4">
            {helpRequests
              .filter((req) => req.status === "in_progress")
              .map((request) => (
                <Card key={request._id}>
                  {/* Same card content as above */}
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="resolved" className="space-y-4">
            {helpRequests
              .filter((req) => req.status === "resolved")
              .map((request) => (
                <Card key={request._id}>
                  {/* Same card content as above */}
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
