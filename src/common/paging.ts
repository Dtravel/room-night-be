export class Paging {
    page: number
    pageSize: number
    total: number
    totalPages: number

    constructor(page: number, pageSize: number, total: number, totalPages: number) {
        this.page = page
        this.pageSize = pageSize
        this.total = total
        this.totalPages = totalPages
    }

    public static build(page: number, pageSize: number, total: number): Paging {
        const totalPage = Math.ceil(total / pageSize)
        return new Paging(page, pageSize, total, totalPage)
    }
}
