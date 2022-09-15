export function convertStringMinutesToHour(minutes: number) {
    const hoursConverted = Math.floor(minutes / 60);
    const minutesConverted = minutes % 60;

    return `${String(hoursConverted).padStart(2, '0')}:${String(minutesConverted).padStart(2, '0')}`;
}