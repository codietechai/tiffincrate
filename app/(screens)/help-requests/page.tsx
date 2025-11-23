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
  HandHelping,
} from "lucide-react";
import { THelpRequest } from "@/types";
import RequestCard from "@/components/screens/help-request/request-card";
import { ProviderService } from "@/services/provider-service";
import { IServiceProvider } from "@/models/ServiceProvider";
import { HelpRequestService } from "@/services/help-request-service";
import { SUCCESSMESSAGE } from "@/constants/response-messages";
import TitleHeader from "@/components/common/title-header";
import { ElseComponent } from "@/components/common/else-component";
import { Skeleton } from "@/components/ui/skeleton";

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
  }, [statusFilter, typeFilter]);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
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
      setLoading(true);
      const data = await HelpRequestService.fetchHelpRequests({
        statusFilter,
        typeFilter,
        limit: "20",
      });

      setHelpRequests(data.data);
    } catch (error) {
      console.error("Error fetching help requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerProviders = async () => {
    try {
      const response = await fetch("/api/help-requests/customer-providers", {
        headers: {
          "x-user-id": user?.id,
          "x-user-role": user?.role,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch providers");

      const result = await response.json();
      setProviders(result.data || []);
    } catch (error) {
      console.log("error fetching providers:", error);
    }
  };

  useEffect(() => {
    if (newRequest.type === "consumer_to_provider") {
      fetchCustomerProviders();
    }
  }, [newRequest.type]);

  const createHelpRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      HelpRequestService.createHelpRequest(newRequest);

      setSuccess(SUCCESSMESSAGE.HELPREQUEST_CREATE);
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
    } catch (error: any) {
      setError(error.error || "Network error. Please try again.");
    }
  };

  const addResponse = async (requestId: string) => {
    if (!response.trim()) return;

    try {
      const res = await HelpRequestService.updateHelpRequest(requestId, {
        response,
      });

      if (!!res) {
        setResponse("");
        fetchHelpRequests();
        if (selectedRequest) {
          const updatedResponse = await HelpRequestService.fetchHelpRequest(
            requestId
          );
          if (updatedResponse) {
            setSelectedRequest(updatedResponse.data);
          }
        }
      }
    } catch (error) {
      console.error("Error adding response:", error);
    }
  };

  const updateStatus = async (requestId: string, newStatus: string) => {
    try {
      const response = await HelpRequestService.updateHelpRequest(requestId, {
        status: newStatus,
      });

      if (!!response) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-xl lg:max-w-4xl px-4 py-4">
        <TitleHeader
          title="Help Requests"
          icon={<HandHelping />}
          description=" Manage support requests and communications"
          rightComponent={
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-white rounded-full px-3 py-2 shadow-md flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="text-sm">New</span>
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-lg rounded-2xl p-4 sm:p-6">
                <DialogHeader>
                  <DialogTitle className="font-medium text-gray-800">
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
                          setNewRequest((prev) => ({
                            ...prev,
                            priority: value,
                          }))
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
          }
        />

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
              {loading ? (
                <>
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton className="h-[136px] w-full" />
                    ))}
                </>
              ) : helpRequests.length > 0 ? (
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
                  <h3 className="font-medium text-gray-900 mb-2"></h3>
                  <p className="text-gray-600"></p>
                  <ElseComponent
                    icon={<MessageCircle />}
                    description="Create a new help request to get started"
                    heading={"No help requests found"}
                    button={
                      <Button size={"sm"}>
                        <Plus /> Send Help Request
                      </Button>
                    }
                  />
                </div>
              )}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
