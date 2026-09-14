import { MessageCircle } from "lucide-react";

import { whatsappNumber } from "@/lib/countries";
import { useWhatsappWidget } from "@/services/forms.store";

/** Bouton WhatsApp flottant affiché sur la boutique en ligne. */
export function WhatsappFloat({ storeId }: { storeId: string }) {
  const widget = useWhatsappWidget(storeId);
  if (!widget.enabled) return null;

  const number = whatsappNumber(widget.countryCode, widget.phone);
  if (!number) return null;

  const href = `https://wa.me/${number}${widget.message ? `?text=${encodeURIComponent(widget.message)}` : ""}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={widget.label || "Écrire sur WhatsApp"}
      className={`fixed bottom-5 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-medium text-white shadow-lg transition-transform hover:scale-105 ${
        widget.position === "left" ? "left-5" : "right-5"
      }`}
    >
      <MessageCircle className="h-5 w-5" />
      {widget.label ? <span className="hidden sm:inline">{widget.label}</span> : null}
    </a>
  );
}
