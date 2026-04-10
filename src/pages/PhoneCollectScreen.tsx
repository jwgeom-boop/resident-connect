import { useState, useEffect } from "react";
import AppHeader from "@/components/AppHeader";
import { toast } from "sonner";
import SendLogModal from "@/components/SendLogModal";

/*
Edge Function: send-kakao

POST /functions/v1/send-kakao

Body: { phone: string, complex: string }

1. Call Solapi API to send KakaoTalk 알림톡:
   - Template ID: [등록 후 추가]
   - Variables: #{단지명} = complex
   - Message fallback to SMS if KakaoTalk fails

2. KakaoTalk message content:
   "📱 입주ON

   잔금대출 한도 미리 계산하고,
   협약은행 금리도 한눈에 비교해보세요.

   ─── 개인정보 수집 동의 ───
   · 수집 항목: 휴대전화번호
   · 수집 목적: 앱 링크 발송
   · 보유 기간: 발송 후 즉시 파기
   (본 메시지 수신으로 동의 처리됩니다)

   👇 앱 다운로드
   https://ipjuon.app"

3. Return: { success: boolean, method: "kakao" | "sms", error?: string }
*/

interface PhoneCollectScreenProps {
  complexName: string;
  onLogout: () => void;
  onChangeComplex: () => void;
}

interface LogEntry {
  time: string;
  phoneLast4: string;
  status: "성공" | "실패";
  method?: "kakao" | "sms";
}

const CONSENT_TEXT = `[개인정보 수집 및 이용 동의]

수집 항목: 휴대폰 번호
수집 목적: 입주 안내 및 앱 설치 링크 발송 (카카오톡)
보유 기간: 입주 완료 후 1개월 이내 파기

동의를 거부할 수 있으며, 거부 시 카카오톡 안내를 받으실 수 없습니다.`;

function getTodayKey() {
  return `send-log-${new Date().toISOString().slice(0, 10)}`;
}

function loadTodayLog(): LogEntry[] {
  try {
    const data = localStorage.getItem(getTodayKey());
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveTodayLog(entries: LogEntry[]) {
  localStorage.setItem(getTodayKey(), JSON.stringify(entries));
}

async function sendKakao(phone: string, complex: string): Promise<{ success: boolean; method: "kakao" | "sms"; error?: string }> {
  // MVP: mock success response. Replace with real Supabase Edge Function call:
  // const { data, error } = await supabase.functions.invoke('send-kakao', { body: { phone, complex } });
  await new Promise((r) => setTimeout(r, 1200));
  
  // Simulate 90% success rate for demo
  if (Math.random() > 0.1) {
    return { success: true, method: "kakao" };
  }
  return { success: false, method: "kakao", error: "알림톡 발송 실패" };
}

const PhoneCollectScreen = ({ complexName, onLogout, onChangeComplex }: PhoneCollectScreenProps) => {
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [log, setLog] = useState<LogEntry[]>(loadTodayLog);
  const [showLogModal, setShowLogModal] = useState(false);

  useEffect(() => {
    saveTodayLog(log);
  }, [log]);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  };

  const rawDigits = phone.replace(/\D/g, "");
  const isValid = /^010\d{7,8}$/.test(rawDigits);

  const addLog = (phoneLast4: string, status: "성공" | "실패", method?: "kakao" | "sms") => {
    const entry: LogEntry = {
      time: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      phoneLast4,
      status,
      method,
    };
    setLog((prev) => [entry, ...prev]);
  };

  const handleSubmit = async () => {
    if (!isValid || sending) return;
    setSending(true);

    const last4 = rawDigits.slice(-4);

    try {
      const result = await sendKakao(rawDigits, complexName);

      if (result.success) {
        addLog(last4, "성공", result.method);
        setPhone("");
        toast.success("✅ 카카오톡 발송 완료", { duration: 2000 });
      } else {
        addLog(last4, "실패");
        toast.error("⚠️ 카카오톡 실패 — SMS로 발송할까요?", {
          duration: 10000,
          action: {
            label: "재시도",
            onClick: () => handleRetrySms(last4),
          },
          cancel: {
            label: "취소",
            onClick: () => {},
          },
        });
      }
    } catch {
      addLog(last4, "실패");
      toast.error("⚠️ 발송 실패 — 네트워크를 확인하세요.", { duration: 5000 });
    } finally {
      setSending(false);
    }
  };

  const handleRetrySms = async (last4: string) => {
    // Mock SMS retry
    toast.loading("SMS 발송 중...", { id: "sms-retry" });
    await new Promise((r) => setTimeout(r, 1000));
    addLog(last4, "성공", "sms");
    toast.success("✅ SMS 발송 완료", { id: "sms-retry", duration: 2000 });
  };

  const handleDigit = (digit: string) => {
    if (rawDigits.length >= 11) return;
    setPhone(formatPhone(rawDigits + digit));
  };

  const handleDelete = () => {
    if (rawDigits.length === 0) return;
    setPhone(formatPhone(rawDigits.slice(0, -1)));
  };

  const handleClear = () => setPhone("");

  const todayCount = log.filter((e) => e.status === "성공").length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader complexName={complexName} onLogout={onLogout} />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 p-4 lg:p-6 max-w-7xl mx-auto w-full">
        {/* LEFT: Consent display for resident */}
        <div className="flex flex-col gap-4">
          <div className="bg-secondary rounded-xl p-6 lg:p-8 border border-border">
            <h3 className="text-xl font-bold text-foreground mb-4">📋 동의 안내문</h3>
            <pre className="whitespace-pre-wrap text-lg leading-relaxed text-foreground font-sans" style={{ fontSize: '18px' }}>
              {CONSENT_TEXT}
            </pre>
          </div>
        </div>

        {/* RIGHT: Staff input area */}
        <div className="flex flex-col gap-4">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">입주민 전화번호</h3>

            {/* Phone display */}
            <div className="w-full bg-secondary rounded-xl px-6 py-5 text-center mb-4">
              <span
                className={`text-3xl font-bold tracking-wider font-mono ${
                  phone ? "text-foreground" : "text-muted-foreground/40"
                }`}
                style={{ fontSize: '32px' }}
              >
                {phone || "010-0000-0000"}
              </span>
            </div>

            {/* Number pad */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "←"].map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    if (key === "←") handleDelete();
                    else if (key === "C") handleClear();
                    else handleDigit(key);
                  }}
                  className={`h-14 rounded-lg font-semibold transition-all select-none touch-manipulation active:scale-95 ${
                    key === "C"
                      ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                      : key === "←"
                      ? "bg-muted text-muted-foreground hover:bg-muted/80"
                      : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
                  }`}
                  style={{ fontSize: '20px' }}
                >
                  {key}
                </button>
              ))}
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={!isValid || sending}
              className="w-full py-4 rounded-xl font-bold transition-all touch-manipulation
                bg-primary text-primary-foreground
                hover:opacity-90 active:scale-[0.98]
                disabled:opacity-40 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
              style={{ fontSize: '20px' }}
            >
              {sending ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  발송 중...
                </>
              ) : (
                "동의 후 발송"
              )}
            </button>

            <button
              onClick={onChangeComplex}
              className="w-full text-muted-foreground mt-3 hover:text-foreground transition-colors"
              style={{ fontSize: '16px' }}
            >
              ← 단지 변경
            </button>
          </div>

          {/* Daily Log Panel */}
          <div className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-foreground font-medium" style={{ fontSize: '18px' }}>
                오늘 발송:
              </span>
              <span className="bg-primary text-primary-foreground font-bold px-3 py-1 rounded-full" style={{ fontSize: '18px' }}>
                {todayCount}건
              </span>
            </div>
            <button
              onClick={() => setShowLogModal(true)}
              className="text-accent hover:underline font-medium"
              style={{ fontSize: '16px' }}
            >
              발송 내역 보기
            </button>
          </div>
        </div>
      </div>

      {showLogModal && <SendLogModal entries={log} onClose={() => setShowLogModal(false)} />}
    </div>
  );
};

export default PhoneCollectScreen;
