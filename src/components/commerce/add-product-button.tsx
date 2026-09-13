import { Link } from "@tanstack/react-router";
import { ChevronDown, FileUp, Plus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/lib/i18n";

export function AddProductButton() {
  const { t } = useLanguage();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Plus className="mr-1 h-4 w-4" /> {t("addProduct")}
          <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem asChild>
          <Link to="/produits/nouveau">
            <Plus className="mr-2 h-4 w-4" />
            {t("addProductManually")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/produits/import">
            <FileUp className="mr-2 h-4 w-4" />
            {t("importCsv")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/produits/ia">
            <Sparkles className="mr-2 h-4 w-4" />
            {t("addProductAi")}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
