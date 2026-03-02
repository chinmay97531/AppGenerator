"use server";

import { getSession } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { Project } from "@/lib/models/project";

export async function getProject(projectId: string) {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  await connectDB();

  const project = await Project.findOne({
    _id: projectId,
    userId: session.userId,
  });

  if (!project) {
    throw new Error("Project not found");
  }

  return {
    id: project.id,
    name: project.name,
    messages: JSON.parse(project.messages),
    data: JSON.parse(project.data),
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}
