"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageCircle, Send } from "lucide-react";
import { THelpRequest } from "@/types";
import { IUser } from "@/models/User";

interface RequestCardProps {
  request: THelpRequest;
  user: IUser;
  updateStatus: (id: string, status: string) => void;
  addResponse: (id: string, message: string) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => JSX.Element;
  getPriorityColor: (priority: string) => string;
  response: string;
  setResponse: Dispatch<SetStateAction<string>>;
}

export default function RequestCard({
  request,
  user,
  updateStatus,
  addResponse,
  getStatusColor,
  getStatusIcon,
  getPriorityColor,
  response,
  setResponse,
}: RequestCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <Card
      key={request._id}
      className="cursor-pointer hover:shadow-md transition-shadow"
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* LEFT SIDE */}
          <div className="flex-1 w-full">
            {/* Title & Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="font-semibold text-base sm:text-lg">
                {request.subject}
              </h3>
              <Badge className={getStatusColor(request.status)}>
                <div className="flex items-center gap-1 text-xs sm:text-sm">
                  {getStatusIcon(request.status)}
                  {request.status.replace("_", " ")}
                </div>
              </Badge>
              <Badge className={getPriorityColor(request.priority)}>
                {request.priority}
              </Badge>
              <Badge variant="outline">{request.category}</Badge>
            </div>

            {/* Message preview */}
            <p className="text-gray-600 mb-3 text-sm line-clamp-2">
              {request.message}
            </p>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500">
              <span>
                From: {request.fromUserId.name} ({request.fromUserId.role})
              </span>
              {request.toUserId && (
                <span>
                  To: {request.toUserId.name} ({request.toUserId.role})
                </span>
              )}
              <span>• {new Date(request.createdAt).toLocaleDateString()}</span>
              <span>• {request.responses.length} responses</span>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {user &&
              (user.role === "admin" ||
                request.toUserId?._id.toString() === user._id) &&
              request.status !== "resolved" &&
              request.status !== "closed" && (
                <Select
                  value={request.status}
                  onValueChange={(value) => updateStatus(request._id, value)}
                >
                  <SelectTrigger className="w-full sm:w-32 text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              )}

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(true)}
                  className="w-full sm:w-auto"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  View
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex flex-wrap items-center gap-2">
                    {request.subject}
                    <Badge className={getStatusColor(request.status)}>
                      {request.status.replace("_", " ")}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-500">
                    Request #{request._id.slice(-8)} • {request.category}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Original message */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                      <span className="font-medium">
                        {request.fromUserId.name}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{request.message}</p>
                  </div>

                  {/* Responses */}
                  {request.responses.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-base">Responses</h4>
                      {request.responses.map((resp: any, index: number) => (
                        <div
                          key={index}
                          className="bg-blue-50 p-3 rounded-lg text-sm"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {resp.userId.name}
                              </span>
                              {resp.isAdmin && (
                                <Badge variant="default" className="text-xs">
                                  Admin
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(resp.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{resp.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Response */}
                  {request.status !== "closed" &&
                    request.status !== "resolved" && (
                      <div className="space-y-2">
                        <Label htmlFor="response">Add Response</Label>
                        <Textarea
                          id="response"
                          placeholder="Type your response..."
                          value={response}
                          onChange={(e) => setResponse(e.target.value)}
                          rows={3}
                        />
                        <Button
                          onClick={() => {
                            addResponse(request._id, response);
                            setResponse("");
                          }}
                          disabled={!response.trim()}
                          className="w-full sm:w-auto"
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Send Response
                        </Button>
                      </div>
                    )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
