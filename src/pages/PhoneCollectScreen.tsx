import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import { toast } from "sonner";

interface PhoneCollectScreenProps {
  complexName: string;
  onLogout: () => void;
  onChangeComplex: () => void;
}

interface CollectedEntry {
  phone: string;
  timestamp: string;
}

const CONSENT_TEXT = `[개인정보 수집 및 이용 동의]

수집 항목: 휴대폰 번호
수집 목적: 입주 안내 및 앱 설치 링크 발송 (카카오톡)
보유 기간: 입주 완료 후 1개월 이내 파기

동의를 거부할 수 있으며, 거부 시 카카오톡 안내를 받으실 수 없습니다.`;

const PhoneCollectScreen = ({ complexName, onLogout, onChangeComplex }: PhoneCollectScreenProps) => {
  const [phone, setPhone] = useState("");
  const [collected, setCollected] = useState<CollectedEntry[]>([]);
  const [sending, setSending] = useState(false);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  };

  const rawDigits = phone.replace(/\D/g, "");
  const isValid = rawDigits.length === 10 || rawDigits.length === 11;

  const handleSubmit = async () => {
    if (!isValid) return;
    setSending(true);

    // Simulate sending KakaoTalk
    await new Promise((r) => setTimeout(r, 800));

    const entry: CollectedEntry = {
      phone: formatPhone(rawDigits),
      timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
    };
    setCollected((prev) => [entry, ...prev]);
    setPhone("");
    setSending(false);
    toast.success("카카오톡 발송 완료!");
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader complexName={complexName} onLogout={onLogout} />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-6 p-4 lg:p-6 max-w-7xl mx-auto w-full">
        {/* LEFT: Consent display */}
        <div className="flex flex-col gap-4">
          <div className="bg-secondary rounded-xl p-6 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">📋 동의 안내문</h3>
            <pre className="whitespace-pre-wrap text-base leading-relaxed text-foreground font-sans">
              {CONSENT_TEXT}
            </pre>
          </div>

          {/* Collection log */}
          <div className="bg-card rounded-xl border border-border p-4 flex-1 min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-foreground">수집 현황</h3>
              <span className="bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded-full">
                {collected.length}건
              </span>
            </div>
            <div className="overflow-y-auto max-h-48 lg:max-h-64 space-y-2">
              {collected.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">아직 수집된 번호가 없습니다</p>
              ) : (
                collected.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-secondary/60 rounded-lg px-4 py-2.5"
                  >
                    <span className="font-mono text-foreground">{entry.phone}</span>
                    <span className="text-muted-foreground text-sm">{entry.timestamp}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Phone input */}
        <div className="flex flex-col items-center gap-4 mt-4 lg:mt-0">
          <div className="w-full max-w-sm flex flex-col items-center gap-4">
            <h3 className="text-lg font-bold text-foreground">전화번호 입력</h3>

            {/* Phone display */}
            <div className="w-full bg-secondary rounded-xl px-6 py-5 text-center">
              <span className="text-3xl font-bold tracking-wider text-foreground font-mono">
                {phone || "010-0000-0000"}
              </span>
              {!phone && <span className="sr-only">placeholder</span>}
            </div>

            {/* Number pad */}
            <div className="grid grid-cols-3 gap-2.5 w-full">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "←"].map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    if (key === "←") handleDelete();
                    else if (key === "C") handleClear();
                    else handleDigit(key);
                  }}
                  className={`h-14 rounded-lg text-xl font-semibold transition-all select-none touch-manipulation active:scale-95 ${
                    key === "C"
                      ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                      : key === "←"
                      ? "bg-muted text-muted-foreground hover:bg-muted/80"
                      : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={!isValid || sending}
              className="w-full py-4 rounded-xl text-lg font-bold transition-all touch-manipulation
                bg-accent text-accent-foreground
                hover:opacity-90 active:scale-[0.98]
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {sending ? "발송 중..." : "✅ 동의 & 카카오톡 발송"}
            </button>

            <button
              onClick={onChangeComplex}
              className="text-muted-foreground text-sm hover:text-foreground transition-colors"
            >
              ← 단지 변경
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneCollectScreen;
