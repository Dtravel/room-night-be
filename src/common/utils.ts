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
        let currentDate = new Date(startDate)
        while (currentDate < endDate) {
            dates.push(currentDate.getTime() / 1000)
            currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1))
        }
        return dates
    }

    static async sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    static parseEventArgs(eventArgs) {
        let keys = Object.keys(eventArgs)
        let values = {}
        for (let i = keys.length / 2; i < keys.length; i++) {
            if (Array.isArray(eventArgs[keys[i]])) {
                values[keys[i]] = Object.values(eventArgs[keys[i]]).map((x) => x.toString())
            } else {
                values[keys[i]] = eventArgs[keys[i]].toString()
            }
        }
        return values
    }
}
