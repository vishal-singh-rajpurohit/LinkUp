export function getTimeDifference(updateTime: string | Date): string{
    const now: Date = new Date();

    const updateDate: Date = new Date(updateTime)

    const diffMs: number = now.getTime() - updateDate.getTime();
    const diffMins: number = (Math.floor(diffMs / (1000 * 60)))
    const diffHours: number =(Math.floor(diffMs / (1000* 60 * 60)))
    const diffDays: number = (Math.floor(diffMs / (1000* 60 * 60 * 24)))
 
    if(diffMins < 1){
        return "just now"
    }else if(diffMins < 60){
        return `${diffMins}m`
    }else if(diffHours < 24){
        return `${diffHours}h`
    }else{
        return `${diffDays}d`
    }
}