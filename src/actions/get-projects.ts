"use server";

import { getSession } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { Project } from "@/lib/models/project";

export async function getProjects() {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  await connectDB();

  const projects = await Project.find({ userId: session.userId })
    .sort({ updatedAt: -1 })
    .select("id name createdAt updatedAt");

  return projects.map((p) => ({
    id: p.id,
    name: p.name,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));
}
