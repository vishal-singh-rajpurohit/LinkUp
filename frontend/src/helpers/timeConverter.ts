export function getTimeDifference(updateTime: string | Date | number): string {
    const now: Date = new Date();

    let updateDate: Date;

    if (typeof updateTime === 'number') {
        // ✅ Handle numbers as timestamps (ms since epoch)
        updateDate = new Date(updateTime);
    } else if (updateTime instanceof Date) {
        // ✅ Already a Date object
        updateDate = updateTime;
    } else if (typeof updateTime === 'string') {
        // ✅ Parse string to Date
        updateDate = new Date(updateTime);
    } else {
        // ❌ Invalid input (failsafe)
        return "invalid time";
    }

    if (isNaN(updateDate.getTime())) {
        // If parsing failed, avoid NaN calculations
        return "invalid time";
    }

    const diffMs: number = now.getTime() - updateDate.getTime();
    const diffMins: number = Math.floor(diffMs / (1000 * 60));
    const diffHours: number = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays: number = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
        return "just now";
    } else if (diffMins < 60) {
        return `${diffMins}m`;
    } else if (diffHours < 24) {
        return `${diffHours}h`;
    } else {
        return `${diffDays}d`;
    }
}
