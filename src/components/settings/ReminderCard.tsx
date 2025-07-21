type ReminderCardProps = {
  onStart: () => void;
};

const ReminderCard = ({ onStart }: ReminderCardProps) => {
  return (
    <section className="settings-section">
      <h2>Reminder</h2>
      <h3>Time to study!</h3>
      <p>Ready for your 25-minute session?</p>
      <div className="button-group">
        <button className="start-button" onClick={onStart}>Start</button>
<button className="snooze-button">Snooze</button>
      </div>
    </section>
  );
};

export default ReminderCard;
