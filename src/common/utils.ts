export class Utils {
    static calculateAdditionalGasLimit(amount: number): number {
        try {
            return Math.ceil(amount * (10 / 100))
        } catch (e) {
            return 1e5
        }
    }
    static getDateInRange(startDate: Date, endDate: Date): number[] {
        let dates = []
        let currentDate = startDate
        while (currentDate <= endDate) {
            dates.push(currentDate.getSeconds())
            currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1))
        }
        return dates
    }

   static async sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

}
