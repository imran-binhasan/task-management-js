export type Role = "ADMIN" | "USER";
export type TaskStatus = "PENDING" | "PROCESSING" | "DONE";
export type AuditAction =
  | "TASK_CREATED"
  | "TASK_UPDATED"
  | "TASK_DELETED"
  | "STATUS_CHANGED"
  | "TASK_ASSIGNED";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  assignedToId: number | null;
  createdById: number;
  assignedTo: User | null;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface AuditLog {
  id: number;
  actorId: number;
  actorName: string;
  action: AuditAction;
  taskId: number;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  summary: string;
  actor: User;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponseMeta {
  timestamp: string;
  requestId: string;
  pagination?: Pagination;
}

export interface ApiResponse<T> {
  data: T;
  status: "success" | "error";
  message?: string;
  errorCode?: string;
  errors?: Record<string, string[]>;
  meta: ApiResponseMeta;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  assignedToId?: number | null;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  assignedToId?: number | null;
}

export interface AuditLogFilters {
  taskId?: number;
  actorId?: number;
  action?: AuditAction;
}
