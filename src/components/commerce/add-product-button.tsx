import { Link } from "@tanstack/react-router";
import { ChevronDown, FileUp, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AddProductButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Plus className="mr-1 h-4 w-4" /> Ajouter un produit
          <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem asChild>
          <Link to="/produits/nouveau">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un produit manuellement
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/produits/import">
            <FileUp className="mr-2 h-4 w-4" />
            Importer par CSV
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
