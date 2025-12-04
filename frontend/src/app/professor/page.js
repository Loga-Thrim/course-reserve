"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfessorPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/professor/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand"></div>
    </div>
  );
}
