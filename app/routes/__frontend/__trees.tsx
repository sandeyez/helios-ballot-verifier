import { ErrorPage } from "@/components/ErrorPage";
import { Outlet } from "@remix-run/react";

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorPage error={error} />;
}

export default function TreeFrame() {
  return (
    <div className="flex flex-col w-full h-full justify-center items-center gap-2">
      <Outlet />
    </div>
  );
}
