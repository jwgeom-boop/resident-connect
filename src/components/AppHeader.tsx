interface AppHeaderProps {
  title?: string;
  complexName?: string;
  onLogout?: () => void;
}

const AppHeader = ({ title = "입주ON 현장수집", complexName, onLogout }: AppHeaderProps) => {
  return (
    <header className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        {complexName && (
          <span className="bg-primary-foreground/15 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
            {complexName}
          </span>
        )}
      </div>
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
