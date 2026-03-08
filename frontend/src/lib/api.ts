import API from "./axios-client";
import {
  AllMembersInWorkspaceResponseType,
  AllProjectPayloadType,
  AllProjectResponseType,
  AllTaskPayloadType,
  AllTaskResponseType,
  AnalyticsResponseType,
  ChangeWorkspaceMemberRoleType,
  CreateProjectPayloadType,
  CreateTaskPayloadType,
  EditTaskPayloadType,
  CreateWorkspaceResponseType,
  EditProjectPayloadType,
  ProjectByIdPayloadType,
  ProjectResponseType,
} from "../types/api.type";
import {
  AllWorkspaceResponseType,
  CreateWorkspaceType,
  CurrentUserResponseType,
  LoginResponseType,
  loginType,
  registerType,
  WorkspaceByIdResponseType,
  EditWorkspaceType,
} from "@/types/api.type";

<<<<<<< HEAD
// ******** AUTH *********
=======
>>>>>>> 8e4f80f3bec2d316a813eacf15e003c20af43cc5
export const loginMutationFn = async (
  data: loginType
): Promise<LoginResponseType> => {
  const response = await API.post("/auth/login", data);
  return response.data;
};

export const registerMutationFn = async (data: registerType) =>
  await API.post("/auth/register", data);

export const logoutMutationFn = async () => await API.post("/auth/logout");

export const getCurrentUserQueryFn =
  async (): Promise<CurrentUserResponseType> => {
    const response = await API.get(`/user/current`);
<<<<<<< HEAD
    return response.data;
  };

// ******** WORKSPACE *********
=======
    console.log("Response from /user/current:", response.data);
    return response.data;
  };

//********* WORKSPACE ****************
//************* */

>>>>>>> 8e4f80f3bec2d316a813eacf15e003c20af43cc5
export const createWorkspaceMutationFn = async (
  data: CreateWorkspaceType
): Promise<CreateWorkspaceResponseType> => {
  const response = await API.post(`/workspace/create/new`, data);
  return response.data;
};

export const editWorkspaceMutationFn = async ({
  workspaceId,
  data,
}: EditWorkspaceType) => {
  const response = await API.put(`/workspace/update/${workspaceId}`, data);
  return response.data;
};

export const getAllWorkspacesUserIsMemberQueryFn =
  async (): Promise<AllWorkspaceResponseType> => {
    const response = await API.get(`/workspace/all`);
    return response.data;
  };

export const getWorkspaceByIdQueryFn = async (
  workspaceId: string
): Promise<WorkspaceByIdResponseType> => {
  const response = await API.get(`/workspace/${workspaceId}`);
  return response.data;
};

export const getMembersInWorkspaceQueryFn = async (
  workspaceId: string
): Promise<AllMembersInWorkspaceResponseType> => {
  const response = await API.get(`/workspace/members/${workspaceId}`);
  return response.data;
};

export const getWorkspaceAnalyticsQueryFn = async (
  workspaceId: string
): Promise<AnalyticsResponseType> => {
  const response = await API.get(`/workspace/analytics/${workspaceId}`);
  return response.data;
};

export const changeWorkspaceMemberRoleMutationFn = async ({
  workspaceId,
  data,
}: ChangeWorkspaceMemberRoleType) => {
  const response = await API.put(
    `/workspace/change/member/role/${workspaceId}`,
    data
  );
  return response.data;
};

export const deleteWorkspaceMutationFn = async (
  workspaceId: string
): Promise<{
  message: string;
  currentWorkspace: string;
}> => {
  const response = await API.delete(`/workspace/delete/${workspaceId}`);
  return response.data;
};

<<<<<<< HEAD
// ******** MEMBER *********
export const invitedUserJoinWorkspaceMutationFn = async (
  inviteCode: string
=======
//*******MEMBER ****************

export const invitedUserJoinWorkspaceMutationFn = async (
  inviteCode : string
>>>>>>> 8e4f80f3bec2d316a813eacf15e003c20af43cc5
): Promise<{
  message: string;
  workspaceId: string;
}> => {
  const response = await API.post(`/member/workspace/${inviteCode}/join`);
  return response.data;
};

<<<<<<< HEAD
// ******** PROJECT *********
=======
//********* */
//********* PROJECTS
>>>>>>> 8e4f80f3bec2d316a813eacf15e003c20af43cc5
export const createProjectMutationFn = async ({
  workspaceId,
  data,
}: CreateProjectPayloadType): Promise<ProjectResponseType> => {
  const response = await API.post(
    `/project/workspace/${workspaceId}/create`,
    data
  );
  return response.data;
};

export const editProjectMutationFn = async ({
  projectId,
  workspaceId,
  data,
}: EditProjectPayloadType): Promise<ProjectResponseType> => {
  const response = await API.put(
    `/project/${projectId}/workspace/${workspaceId}/update`,
    data
  );
  return response.data;
};

export const getProjectsInWorkspaceQueryFn = async ({
  workspaceId,
  pageSize = 10,
  pageNumber = 1,
}: AllProjectPayloadType): Promise<AllProjectResponseType> => {
  const response = await API.get(
    `/project/workspace/${workspaceId}/all?pageSize=${pageSize}&pageNumber=${pageNumber}`
  );
  return response.data;
};

export const getProjectByIdQueryFn = async ({
  workspaceId,
  projectId,
}: ProjectByIdPayloadType): Promise<ProjectResponseType> => {
  const response = await API.get(
    `/project/${projectId}/workspace/${workspaceId}`
  );
  return response.data;
};

export const getProjectAnalyticsQueryFn = async ({
  workspaceId,
  projectId,
}: ProjectByIdPayloadType): Promise<AnalyticsResponseType> => {
  const response = await API.get(
    `/project/${projectId}/workspace/${workspaceId}/analytics`
  );
  return response.data;
};

export const deleteProjectMutationFn = async ({
  workspaceId,
  projectId,
<<<<<<< HEAD
}: ProjectByIdPayloadType): Promise<{ message: string }> => {
=======
}: ProjectByIdPayloadType): Promise<{
  message: string;
}> => {
>>>>>>> 8e4f80f3bec2d316a813eacf15e003c20af43cc5
  const response = await API.delete(
    `/project/${projectId}/workspace/${workspaceId}/delete`
  );
  return response.data;
};

<<<<<<< HEAD
// ******** TASK *********
=======
//*******TASKS ********************************
//************************* */

>>>>>>> 8e4f80f3bec2d316a813eacf15e003c20af43cc5
export const createTaskMutationFn = async ({
  workspaceId,
  projectId,
  data,
}: CreateTaskPayloadType) => {
  const response = await API.post(
    `/task/project/${projectId}/workspace/${workspaceId}/create`,
    data
  );
  return response.data;
};

<<<<<<< HEAD
=======

>>>>>>> 8e4f80f3bec2d316a813eacf15e003c20af43cc5
export const editTaskMutationFn = async ({
  taskId,
  projectId,
  workspaceId,
  data,
<<<<<<< HEAD
}: EditTaskPayloadType): Promise<{ message: string }> => {
=======
}: EditTaskPayloadType): Promise<{message: string;}> => {
>>>>>>> 8e4f80f3bec2d316a813eacf15e003c20af43cc5
  const response = await API.put(
    `/task/${taskId}/project/${projectId}/workspace/${workspaceId}/update/`,
    data
  );
  return response.data;
};

export const getAllTasksQueryFn = async ({
  workspaceId,
  keyword,
  projectId,
  assignedTo,
  priority,
  status,
  dueDate,
  pageNumber,
  pageSize,
}: AllTaskPayloadType): Promise<AllTaskResponseType> => {
  const baseUrl = `/task/workspace/${workspaceId}/all`;

  const queryParams = new URLSearchParams();
  if (keyword) queryParams.append("keyword", keyword);
  if (projectId) queryParams.append("projectId", projectId);
  if (assignedTo) queryParams.append("assignedTo", assignedTo);
  if (priority) queryParams.append("priority", priority);
  if (status) queryParams.append("status", status);
  if (dueDate) queryParams.append("dueDate", dueDate);
  if (pageNumber) queryParams.append("pageNumber", pageNumber?.toString());
  if (pageSize) queryParams.append("pageSize", pageSize?.toString());

  const url = queryParams.toString() ? `${baseUrl}?${queryParams}` : baseUrl;
  const response = await API.get(url);
  return response.data;
};

export const deleteTaskMutationFn = async ({
  workspaceId,
  taskId,
}: {
  workspaceId: string;
  taskId: string;
<<<<<<< HEAD
}): Promise<{ message: string }> => {
  const response = await API.delete(
    `/task/${taskId}/workspace/${workspaceId}/delete`
  );
  return response.data;
};

// ******** REPORTS *********
=======
}): Promise<{
  message: string;
}> => {
  const response = await API.delete(
    `task/${taskId}/workspace/${workspaceId}/delete`
  );
  return response.data;
};
// ******** REPORTS *********

// export const generateReportQueryFn = async (workspaceId?: string) => {
//   const url = workspaceId
//     ? `/reports/generate?workspaceId=${workspaceId}`
//     : `/reports/generate`;

//   const response = await API.get(url, {
//     responseType: "blob", // ضروري لتنزيل ملف Excel
//   });

//   // إنشاء رابط تحميل مباشر
//   const blob = new Blob([response.data], {
//     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//   });
//   const link = document.createElement("a");
//   const today = new Date().toISOString().split("T")[0];
//   const fileName = workspaceId
//     ? `Report_${workspaceId}_${today}.xlsx`
//     : `Report_AllWorkspaces_${today}.xlsx`;

//   link.href = window.URL.createObjectURL(blob);
//   link.download = fileName;
//   link.click();
// };
// ******** REPORTS *********

>>>>>>> 8e4f80f3bec2d316a813eacf15e003c20af43cc5
export const generateReportQueryFn = async (workspaceId?: string) => {
  const url = workspaceId
    ? `/reports/generate?workspaceId=${workspaceId}`
    : `/reports/generate`;

<<<<<<< HEAD
=======
  // ✅ نحدد نوع الاستجابة blob لأننا ننتظر ملف Excel
>>>>>>> 8e4f80f3bec2d316a813eacf15e003c20af43cc5
  const response = await API.get(url, {
    responseType: "blob",
  });

<<<<<<< HEAD
  return response;
};
=======
  // ✅ نرجع response حتى يقدر الـ hook يتعامل معه
  return response;
};
>>>>>>> 8e4f80f3bec2d316a813eacf15e003c20af43cc5
