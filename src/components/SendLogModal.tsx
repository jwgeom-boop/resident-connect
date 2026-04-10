interface LogEntry {
  time: string;
  phoneLast4: string;
  status: "성공" | "실패";
  method?: "kakao" | "sms";
}

interface SendLogModalProps {
  entries: LogEntry[];
  onClose: () => void;
}

const SendLogModal = ({ entries, onClose }: SendLogModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40" onClick={onClose}>
      <div
        className="bg-card rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">발송 내역</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-2xl leading-none">
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          {entries.length === 0 ? (
            <p className="text-muted-foreground text-center py-8" style={{ fontSize: '18px' }}>
              오늘 발송 내역이 없습니다
            </p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="pb-2 font-medium" style={{ fontSize: '16px' }}>시간</th>
                  <th className="pb-2 font-medium" style={{ fontSize: '16px' }}>전화번호</th>
                  <th className="pb-2 font-medium" style={{ fontSize: '16px' }}>상태</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-3 text-foreground font-mono" style={{ fontSize: '16px' }}>{entry.time}</td>
                    <td className="py-3 text-foreground font-mono" style={{ fontSize: '16px' }}>****-{entry.phoneLast4}</td>
                    <td className="py-3" style={{ fontSize: '16px' }}>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${
                          entry.status === "성공"
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {entry.status}
                        {entry.method && ` (${entry.method})`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 border-t border-border">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-muted transition-colors"
            style={{ fontSize: '18px' }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendLogModal;
