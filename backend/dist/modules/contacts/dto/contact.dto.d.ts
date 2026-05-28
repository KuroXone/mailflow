export declare class CreateContactDto {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    source?: string;
    tags?: string[];
    customFields?: Record<string, any>;
    listId?: string;
}
declare const UpdateContactDto_base: import("@nestjs/common").Type<Partial<CreateContactDto>>;
export declare class UpdateContactDto extends UpdateContactDto_base {
}
export declare class CreateListDto {
    name: string;
    description?: string;
}
export declare class ImportCsvDto {
    listId: string;
}
export declare class BulkTagDto {
    contactIds: string[];
    tags: string[];
}
export {};
