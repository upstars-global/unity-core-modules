export interface IStatuses {
    id: string
    name: string
    status: boolean
    writable: boolean
    conditions: Condition[]
}

export interface Condition {
    persistent_comp_points: PersistentCompPoints
}

export interface PersistentCompPoints {
    type: string
    exclude_end: boolean
    min: number
    max: number
}
