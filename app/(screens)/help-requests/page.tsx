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
} from "lucide-react";
import { THelpRequest } from "@/types";
import RequestCard from "@/components/screens/help-request/request-card";
import { ProviderService } from "@/services/providerService";
import { IServiceProvider } from "@/models/ServiceProvider";

export default function HelpRequestsPage() {
  const [helpRequests, setHelpRequests] = useState<THelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedRequest, setSelectedRequest] = useState<THelpRequest | null>(
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
  const [providers, setProviders] = useState<IServiceProvider[]>([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchHelpRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      if (typeFilter && typeFilter !== "all") params.append("type", typeFilter);
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

  const fetchProviders = async () => {
    try {
      const response = await ProviderService.fetchProvidersLinkedWithConsumer();
      setProviders(response?.data || []);
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    if (newRequest.type === "consumer_to_provider") {
      fetchProviders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newRequest.type]);

  const createHelpRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const payload = { ...newRequest };
      if (
        payload.type === "admin_support" ||
        payload.type === "provider_support"
      ) {
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

      <div className="mx-auto max-w-xl px-4 py-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900">
              Help Requests
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Manage support requests and communications
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-white rounded-full px-3 py-2 shadow-md flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="text-sm">New</span>
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg rounded-2xl p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle className="text-lg font-medium text-gray-800">
                  Create Help Request
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500">
                  Submit a new help request for assistance
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={createHelpRequest} className="mt-3 space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="type" className="text-xs">
                      Request Type
                    </Label>
                    <Select
                      value={newRequest.type}
                      onValueChange={(value) =>
                        setNewRequest((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger className="rounded-lg border border-gray-200 mt-1">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin_support">
                          Admin Support
                        </SelectItem>
                        {user?.role === "consumer" && (
                          <>
                            <SelectItem value="provider_support">
                              Provider Support
                            </SelectItem>
                            <SelectItem value="consumer_to_provider">
                              To Provider
                            </SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {providers.length > 0 &&
                    newRequest.type === "consumer_to_provider" && (
                      <div>
                        <Label className="text-xs">Provider</Label>
                        <Select
                          value={newRequest.toUserId}
                          onValueChange={(value) =>
                            setNewRequest((prev) => ({
                              ...prev,
                              toUserId: value,
                            }))
                          }
                        >
                          <SelectTrigger className="rounded-lg border border-gray-200 mt-1">
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                          <SelectContent>
                            {providers.map((item) => (
                              <SelectItem
                                key={(item.userId as any)?._id}
                                value={(item.userId as any)?._id}
                              >
                                {item.businessName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                  <div>
                    <Label className="text-xs">Priority</Label>
                    <Select
                      value={newRequest.priority}
                      onValueChange={(value) =>
                        setNewRequest((prev) => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger className="rounded-lg border border-gray-200 mt-1">
                        <SelectValue placeholder="Select priority" />
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

                <div>
                  <Label className="text-xs">Category</Label>
                  <Select
                    value={newRequest.category}
                    onValueChange={(value) =>
                      setNewRequest((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger className="rounded-lg border border-gray-200 mt-1">
                      <SelectValue placeholder="Select category" />
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

                <div>
                  <Label className="text-xs">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description"
                    value={newRequest.subject}
                    onChange={(e) =>
                      setNewRequest((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                    required
                    className="mt-1 rounded-lg border border-gray-200"
                  />
                </div>

                <div>
                  <Label className="text-xs">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Detailed description"
                    value={newRequest.message}
                    onChange={(e) =>
                      setNewRequest((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    rows={4}
                    required
                    className="mt-1 rounded-lg border border-gray-200"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {success && (
          <Alert className="mb-3 border border-green-200 bg-green-50 text-green-700">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <div className="mb-3">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all" onClick={() => setStatusFilter("all")}>
                All
              </TabsTrigger>
              <TabsTrigger value="open" onClick={() => setStatusFilter("open")}>
                Open
              </TabsTrigger>
              <TabsTrigger
                value="in_progress"
                onClick={() => setStatusFilter("in_progress")}
              >
                In Progress
              </TabsTrigger>
              <TabsTrigger
                value="resolved"
                onClick={() => setStatusFilter("resolved")}
              >
                Resolved
              </TabsTrigger>
            </TabsList>

            {/* Filter select */}
            <div className="flex justify-end my-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40 rounded-full border border-gray-200 text-sm">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="admin_support">Admin Support</SelectItem>
                  <SelectItem value="provider_support">
                    Provider Support
                  </SelectItem>
                  <SelectItem value="consumer_to_provider">
                    To Provider
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              {helpRequests.length > 0 ? (
                helpRequests.map((request) => (
                  <RequestCard
                    response={response}
                    setResponse={setResponse}
                    request={request}
                    user={user}
                    updateStatus={updateStatus}
                    addResponse={addResponse}
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                    getPriorityColor={getPriorityColor}
                  />
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
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
