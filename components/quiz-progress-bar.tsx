"use client";

import { Progress } from "@/components/ui/progress";

export function QuizProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return <Progress value={current} max={total} />;
}
