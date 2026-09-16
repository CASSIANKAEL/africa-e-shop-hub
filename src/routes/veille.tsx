import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/veille")({
  beforeLoad: () => {
    throw redirect({ to: "/product-finder" });
  },
});
