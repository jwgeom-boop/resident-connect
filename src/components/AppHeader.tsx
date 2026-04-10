interface AppHeaderProps {
  title?: string;
  complexName?: string;
  onLogout?: () => void;
}

const AppHeader = ({ title = "입주ON 현장수집", complexName, onLogout }: AppHeaderProps) => {
  if (complexName) {
    return (
      <header className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-lg font-bold text-primary flex items-center gap-1">
              📍 {complexName}
            </p>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              로그아웃
            </button>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-bold tracking-tight">{title}</h1>
      {onLogout && (
        <button
          onClick={onLogout}
          className="text-primary-foreground/70 hover:text-primary-foreground text-sm font-medium transition-colors"
        >
          로그아웃
        </button>
      )}
    </header>
  );
};

export default AppHeader;
