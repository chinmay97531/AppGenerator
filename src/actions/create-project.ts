"use server";

import { getSession } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { Project } from "@/lib/models/project";

interface CreateProjectInput {
  name: string;
  messages: any[];
  data: Record<string, any>;
}

export async function createProject(input: CreateProjectInput) {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  await connectDB();

  const project = await Project.create({
    name: input.name,
    userId: session.userId,
    messages: JSON.stringify(input.messages),
    data: JSON.stringify(input.data),
  });

  return {
    id: project.id,
    name: project.name,
    userId: project.userId,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}
