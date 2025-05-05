export interface ActionItem {
  id: string;
  reportId: string;
  title: string;
  description?: string;
  status: "ToDo" | "InProgress" | "Complete";
  priority: "Low" | "Medium" | "High";
  createdAt: string;
  updatedAt: string;
}
