type ScheduleItem = {
  time: string;
  event: string;
};

const todaysEvents: ScheduleItem[] = [
  { time: "09:00 AM", event: "Math Class" },
  { time: "11:00 AM", event: "Science Project" },
  { time: "01:00 PM", event: "Lunch Break" },
  { time: "03:00 PM", event: "Study Group" },
];

function TodaysSchedule() {
  return (
    <div>
      <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '12px' }}>🗓️ Today's Schedule</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {todaysEvents.map((item, i) => (
          <div className="widget-row" key={i}>
            <span style={{ fontWeight: 'bold' }}>{item.time}</span>: {item.event}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TodaysSchedule