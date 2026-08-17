import { Header } from "./components/Header";
import { TemperatureCard } from "./components/TemperatureCard";
import { FaseCard } from "./components/FaseCard";
import { StatusCard } from "./components/StatusCard";
import { BakingHoursCard } from "./components/BakingHoursCard";
import { InfoCard } from "./components/InfoCard";
import { HistorialView } from "./components/HistorialView";
import { ControlPanel } from "./components/ControlPanel";
import { PerfilEditor } from "./components/PerfilEditor";
import { useHorno } from "./hooks/useHorno";
import { useHistorial } from "./hooks/useHistorial";
import { usePhaseTimer } from "./hooks/usePhaseTimer";

export default function App() {
  const { currentLectura, currentTemp, history, isConnected, trend, controlStatus } = useHorno();
  const {
    historial,
    currentRate,
    loading,
    error,
    windowMin,
    setWindowMin,
    windowOptions,
  } = useHistorial();

  const timer = usePhaseTimer(currentLectura?.fase_actual);

  const latestEntries = history.slice(-10).reverse();

  return (
    <div className="app">
      <Header />

      <div className="status-pill">
        <StatusCard isConnected={isConnected} />
      </div>

      <div className="top-row">
        <TemperatureCard label="T1" temp={currentTemp} trend={trend} />
        <FaseCard
          fase={currentLectura?.fase_actual ?? null}
          timerRemainingSec={timer.remainingSec}
          timerRunning={timer.isRunning}
          timerDurationMin={timer.durationMin}
          onTimerDurationChange={timer.setDurationMin}
          onTimerReset={timer.reset}
        />
        <BakingHoursCard totalSeconds={currentLectura?.tiempo_s ?? null} />
      </div>

      <div className="control-row">
        <ControlPanel status={controlStatus} />
        <PerfilEditor />
      </div>

      <HistorialView
        data={historial}
        currentRate={currentRate}
        loading={loading}
        error={error}
        windowMin={windowMin}
        windowOptions={windowOptions}
        onWindowChange={setWindowMin}
      />

      <div className="bottom-row">
        <InfoCard lectura={currentLectura} />
        <div className="card">
          <h2 className="history-card__title">Ultimos valores</h2>
          <ul className="history-list">
            {latestEntries.map((entry) => (
              <li key={entry.id} className="history-list__item">
                <span>{entry.formattedTime}</span>
                <span className="history-list__temp">T1:{entry.temp}°C</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
