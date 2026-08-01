"use client";

import Link from "next/link";
import { useProjects } from "@/features/projects/queries/projects.queries";

export function ProjectList() {
  const { data, isPending, isError, error, refetch, isFetching } =
    useProjects();

  if (isPending) {
    return <p className="text-sm text-zinc-600">Loading projects…</p>;
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-red-600">
          Failed to load projects
          {error instanceof Error ? `: ${error.message}` : "."}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="w-fit rounded border border-zinc-300 px-3 py-1.5 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data.length) {
    return <p className="text-sm text-zinc-600">No projects yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-medium">Projects</h2>
        {isFetching ? (
          <span className="text-xs text-zinc-500">Refreshing…</span>
        ) : null}
      </div>
      <ul className="divide-y divide-zinc-200 rounded border border-zinc-200">
        {data.map((project) => (
          <li key={project.id}>
            <Link
              href={`/dashboard/projects/${project.id}/overview`}
              className="block px-4 py-3 hover:bg-zinc-50"
            >
              <p className="font-medium">{project.name}</p>
              {project.description ? (
                <p className="text-sm text-zinc-600">{project.description}</p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
