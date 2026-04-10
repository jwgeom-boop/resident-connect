import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import { toast } from "sonner";

const CORRECT_PIN = "1234";

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [pin, setPin] = useState("");

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    if (newPin.length === 4) {
      if (newPin === CORRECT_PIN) {
        onLogin();
      } else {
        toast.error("PIN이 올바르지 않습니다.");
        setTimeout(() => setPin(""), 300);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-8 p-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground text-center">직원 로그인</h2>
            <p className="text-muted-foreground text-center mt-1">4자리 PIN을 입력하세요</p>
          </div>

          {/* PIN dots */}
          <div className="flex gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-full border-2 transition-all ${
                  i < pin.length
                    ? "bg-primary border-primary scale-110"
                    : "border-muted-foreground/40 bg-transparent"
                }`}
              />
            ))}
          </div>

          {/* Number pad */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "←"].map(
              (key) =>
                key === "" ? (
                  <div key="empty" />
                ) : (
                  <button
                    key={key}
                    onClick={() => (key === "←" ? handleDelete() : handleDigit(key))}
                    className="h-16 rounded-lg bg-secondary text-secondary-foreground text-2xl font-semibold
                      hover:bg-primary hover:text-primary-foreground active:scale-95 transition-all
                      select-none touch-manipulation"
                  >
                    {key}
                  </button>
                )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
