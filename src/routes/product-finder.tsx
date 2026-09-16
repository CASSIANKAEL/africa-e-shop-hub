import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/product-finder")({
  component: ProductFinderLayout,
});

function ProductFinderLayout() {
  return <Outlet />;
}