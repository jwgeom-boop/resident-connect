import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface Complex {
  id: number;
  name: string;
  inspectionStart: string;
  inspectionEnd: string;
}

const COMPLEX_LIST: Complex[] = [
  { id: 1, name: "스마트 아파트", inspectionStart: "2026-04-10", inspectionEnd: "2026-04-12" },
  { id: 2, name: "힐스테이트 OO", inspectionStart: "2026-04-18", inspectionEnd: "2026-04-20" },
  { id: 3, name: "래미안 OO", inspectionStart: "2026-05-02", inspectionEnd: "2026-05-04" },
];

type Status = "진행중" | "예정" | "완료";

function getStatus(complex: Complex): Status {
  const today = new Date().toISOString().slice(0, 10);
  if (today < complex.inspectionStart) return "예정";
  if (today > complex.inspectionEnd) return "완료";
  return "진행중";
}

function getDday(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getMonth() + 1}.${d.getDate()}`;
}

export function saveTodayComplex(name: string) {
  localStorage.setItem(
    "ipjuon_today_complex",
    JSON.stringify({ date: new Date().toISOString().slice(0, 10), complexName: name })
  );
}

export function loadTodayComplex(): string | null {
  try {
    const raw = localStorage.getItem("ipjuon_today_complex");
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data.date === new Date().toISOString().slice(0, 10) ? data.complexName : null;
  } catch {
    return null;
  }
}

interface ComplexSelectScreenProps {
  onSelect: (complex: string) => void;
  onLogout: () => void;
}

const ComplexSelectScreen = ({ onSelect, onLogout }: ComplexSelectScreenProps) => {
  const [pendingComplex, setPendingComplex] = useState<Complex | null>(null);
  const [warningComplex, setWarningComplex] = useState<Complex | null>(null);

  const handleClick = (complex: Complex) => {
    const status = getStatus(complex);
    if (status === "완료") return;
    if (status === "예정") {
      setWarningComplex(complex);
    } else {
      setPendingComplex(complex);
    }
  };

  const handleConfirm = (complex: Complex) => {
    saveTodayComplex(complex.name);
    onSelect(complex.name);
    setPendingComplex(null);
    setWarningComplex(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader onLogout={onLogout} />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto flex flex-col gap-6 p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">단지 선택</h2>
            <p className="text-muted-foreground mt-1">방문할 단지를 선택하세요</p>
          </div>

          <div className="flex flex-col gap-3">
            {COMPLEX_LIST.map((complex) => {
              const status = getStatus(complex);
              const isActive = status === "진행중";
              const isUpcoming = status === "예정";
              const isDone = status === "완료";
              const dday = isUpcoming ? getDday(complex.inspectionStart) : 0;

              return (
                <button
                  key={complex.id}
                  onClick={() => handleClick(complex)}
                  disabled={isDone}
                  className={`w-full py-5 px-6 rounded-xl border text-left transition-all touch-manipulation
                    ${isActive
                      ? "bg-blue-50 border-blue-500 hover:border-blue-600 active:scale-[0.98]"
                      : isUpcoming
                      ? "bg-card border-border hover:border-primary active:scale-[0.98]"
                      : "bg-muted border-muted cursor-not-allowed opacity-60"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-lg font-medium ${isDone ? "text-muted-foreground" : "text-card-foreground"}`}>
                        {complex.name}
                      </p>
                      <p className={`text-sm mt-1 ${isDone ? "text-muted-foreground" : "text-muted-foreground"}`}>
                        사전점검: {formatDate(complex.inspectionStart)} ~ {formatDate(complex.inspectionEnd)}
                      </p>
                    </div>
                    {isActive && (
                      <Badge className="bg-green-500 text-white hover:bg-green-500 border-0">진행중</Badge>
                    )}
                    {isUpcoming && (
                      <Badge className="bg-blue-500 text-white hover:bg-blue-500 border-0">D-{dday}</Badge>
                    )}
                    {isDone && (
                      <Badge variant="secondary">완료</Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 진행중 확인 모달 */}
      <AlertDialog open={!!pendingComplex} onOpenChange={() => setPendingComplex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>단지 확인</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">📍 {pendingComplex?.name}</p>
                {pendingComplex && (
                  <p className="text-sm text-muted-foreground">
                    사전점검: {formatDate(pendingComplex.inspectionStart)} ~ {formatDate(pendingComplex.inspectionEnd)}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-2">이 단지로 시작하시겠습니까?</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={() => pendingComplex && handleConfirm(pendingComplex)}>
              시작하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 예정 경고 모달 */}
      <AlertDialog open={!!warningComplex} onOpenChange={() => setWarningComplex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ 사전점검 기간이 아닙니다</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                {warningComplex && (
                  <p className="text-sm text-muted-foreground">
                    사전점검 시작일: {formatDate(warningComplex.inspectionStart)}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">그래도 이 단지로 진행하시겠습니까?</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={() => warningComplex && handleConfirm(warningComplex)}>
              그래도 진행
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ComplexSelectScreen;
