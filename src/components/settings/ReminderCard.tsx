import { useTimer } from '../../services/TimerContext'; // ✅ Step 1: import context

type ReminderCardProps = {
  onStart: () => void;
};

const ReminderCard = ({ onStart }: ReminderCardProps) => {
  const { startTimer } = useTimer(); // ✅ Step 2: use timer context

  const handleStart = () => {
    startTimer(25);  // Start a 25-minute timer
    onStart();        // Hide the reminder card
  };

  return (
    <section className="settings-section">
      <h2>Reminder</h2>
      <h3>Time to study!</h3>
      <p>Ready for your 25-minute session?</p>
      <div className="button-group">
        <button className="start-button" onClick={handleStart}>Start</button>
        <button className="snooze-button">Snooze</button>
      </div>
    </section>
  );
};

export default ReminderCard;
