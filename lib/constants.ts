export const STATUS_LIST = [
  { value: "INTERESTED", label: "관심", color: "bg-gray-100 text-gray-600" },
  { value: "PLANNED", label: "지원 예정", color: "bg-blue-100 text-blue-600" },
  { value: "APPLIED", label: "지원 완료", color: "bg-indigo-100 text-indigo-600" },
  { value: "DOCUMENT_PASSED", label: "서류 합격", color: "bg-purple-100 text-purple-600" },
  { value: "INTERVIEW", label: "면접 진행", color: "bg-orange-100 text-orange-600" },
  { value: "FINAL_PASSED", label: "최종 합격", color: "bg-green-100 text-green-600" },
  { value: "REJECTED", label: "불합격", color: "bg-red-100 text-red-600" },
] as const;

export type StatusValue = (typeof STATUS_LIST)[number]["value"];

export function getStatus(value: string) {
  return STATUS_LIST.find((s) => s.value === value) ?? STATUS_LIST[0];
}

export function calcDday(deadline: Date | string | null): string | null {
  if (!deadline) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(deadline);
  d.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "D-day";
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
}
