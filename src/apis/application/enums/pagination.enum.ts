export enum SortByEnum {
    APP_ID = 'appID',
    TOTAL_COST = 'totalCost',
    EFFECTIVE_DATE = 'effectiveDate',
    LAST_STATUS_UPDATE = 'lastStatusUpdate',
    STATUS = 'status',
    CREATED_DATE = 'createdDate',
}

export enum SortByMapToDBEnum {
    APP_ID = 'oi.item_id',
    TOTAL_COST = 'oi.total_cost',
    EFFECTIVE_DATE = 'oi.effective_date',
    LAST_STATUS_UPDATE = 'ish.changed',
    STATUS = 'oi.status_id',
    CREATED_DATE = 'oi.created',
}

export enum SortOrderEnum {
    DESC = 'desc',
    ASC = 'asc',
}
