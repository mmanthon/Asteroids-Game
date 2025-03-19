export interface AdditionalProductData {
    im_policy_duration?: string;
    br_policy_duration?: string;
}

export interface AmpApplication {
    item_id: number;
    created_from_renewal: number;
    user_id: number;
    created: string;
    total_cost: number;
    program_id: number;
    program_type_id: number;
    product_ids: number;
    agency_name: string;
    insured_company_name: string;
    insured_first_name: string;
    insured_last_name: string;
    product_name: string;
    carrier_name: string;
    status_name: string;
    user_first_name: string;
    user_last_name: string;
    first_bound_date?: string;
    group_id?: number;
    insured_email?: string;
    last_updated?: string;
    effective_date?: string;
    insured_address?: string;
    insured_city?: string;
    insured_state?: string;
    insured_zip?: string;
    insured_phone?: string;
    project_end_date?: string;
    last_status_update?: string;
}

export interface FindAllResult {
    applications: AmpApplication[];
    currentPage: number;
    nextPage: number | null;
    totalPages: number;
}

export interface GetLinkedProductResult {
    product_id: number;
    product_name: string;
    program_type_id: number;
    program_id: number;
    carrier_name: string;
}
