import AppHeader from "@/components/AppHeader";

const COMPLEXES = ["스마트 아파트", "힐스테이트 OO", "래미안 OO"];

interface ComplexSelectScreenProps {
  onSelect: (complex: string) => void;
  onLogout: () => void;
}

const ComplexSelectScreen = ({ onSelect, onLogout }: ComplexSelectScreenProps) => {
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
            {COMPLEXES.map((name) => (
              <button
                key={name}
                onClick={() => onSelect(name)}
                className="w-full py-5 px-6 rounded-xl border border-border bg-card text-card-foreground
                  text-lg font-medium text-left
                  hover:border-primary hover:bg-primary/5 active:scale-[0.98] transition-all
                  touch-manipulation"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplexSelectScreen;
