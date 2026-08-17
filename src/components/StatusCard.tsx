interface StatusCardProps {
  isConnected: boolean;
}

export function StatusCard({ isConnected }: StatusCardProps) {
  return (
    <div className="card status-card">
      <span className="status-card__label">Estado</span>
      <span
        className={`status-card__indicator ${
          isConnected ? "status-card__indicator--on" : "status-card__indicator--off"
        }`}
      >
        <span className="status-card__dot" />{" "}
        {isConnected ? "Conectado" : "Desconectado"}
      </span>
    </div>
  );
}
