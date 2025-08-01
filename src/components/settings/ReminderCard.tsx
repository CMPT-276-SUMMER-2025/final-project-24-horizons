import { useTimer } from '../../services/TimerContext';

type ReminderCardProps = {
  onStart: () => void;
};

const ReminderCard = ({ onStart }: ReminderCardProps) => {
  const { startTimer, sessionDuration } = useTimer(); // use sessionDuration from context

  const handleStart = () => {
    startTimer(sessionDuration); // start with selected duration
    onStart(); // hide the reminder card 
  };
/* removed this line: <button className="snooze-button">Snooze</button> */
  return (
    <section className="settings-section">
      <h2>Reminder</h2>
      <h3>Time to study!</h3>
      <p>Ready for your {sessionDuration}-minute session?</p>
      <div className="button-group">
        <button className="start-button" onClick={handleStart}>Start</button>
        
      </div>
    </section>
  );
};

export default ReminderCard;