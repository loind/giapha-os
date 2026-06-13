"use client";

import { Check, ClipboardCopy } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/Toast";

export default function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast("success", "Đã sao chép mã SQL vào clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("error", "Không thể sao chép. Hãy thử bôi đen và copy thủ công.");
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleCopy}
        className={`btn-cta w-full ${copied ? "!bg-teal-500 hover:!bg-teal-600 !text-white" : ""}`}
      >
        {copied ? (
          <>
            <Check className="size-5" />
            Đã Copy thành công!
          </>
        ) : (
          <>
            <ClipboardCopy className="size-5" />
            Copy Mã SQL
          </>
        )}
      </button>
    </div>
  );
}
