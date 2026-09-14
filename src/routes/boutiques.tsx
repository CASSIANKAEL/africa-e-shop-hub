import { createFileRoute, redirect } from "@tanstack/react-router";

/** Ancienne page « Boutiques » : l'édition se fait désormais sur la boutique active. */
export const Route = createFileRoute("/boutiques")({
  beforeLoad: () => {
    throw redirect({ to: "/boutique" });
  },
});
