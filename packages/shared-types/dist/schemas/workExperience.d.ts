import { z } from "zod";
export declare const WorkExperienceCategorySchema: z.ZodObject<{
    category_name: z.ZodString;
    resume_points_file: z.ZodString;
}, "strip", z.ZodTypeAny, {
    category_name: string;
    resume_points_file: string;
}, {
    category_name: string;
    resume_points_file: string;
}>;
export declare const WorkExperienceSchema: z.ZodObject<{
    id: z.ZodString;
    company: z.ZodString;
    role: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    startDate: z.ZodString;
    endDate: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    description_file: z.ZodString;
    categories: z.ZodArray<z.ZodObject<{
        category_name: z.ZodString;
        resume_points_file: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        category_name: string;
        resume_points_file: string;
    }, {
        category_name: string;
        resume_points_file: string;
    }>, "many">;
    tags: z.ZodArray<z.ZodString, "many">;
    archived: z.ZodDefault<z.ZodBoolean>;
    user_notes: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    description_file: string;
    categories: {
        category_name: string;
        resume_points_file: string;
    }[];
    user_notes: string;
    archived: boolean;
    company: string;
    role: string;
    startDate: string;
    endDate: string | null;
    tags: string[];
    location?: string | undefined;
}, {
    id: string;
    description_file: string;
    categories: {
        category_name: string;
        resume_points_file: string;
    }[];
    company: string;
    role: string;
    startDate: string;
    tags: string[];
    user_notes?: string | undefined;
    archived?: boolean | undefined;
    location?: string | undefined;
    endDate?: string | null | undefined;
}>;
export declare const WorkExperiencesArraySchema: z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    company: z.ZodString;
    role: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    startDate: z.ZodString;
    endDate: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    description_file: z.ZodString;
    categories: z.ZodArray<z.ZodObject<{
        category_name: z.ZodString;
        resume_points_file: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        category_name: string;
        resume_points_file: string;
    }, {
        category_name: string;
        resume_points_file: string;
    }>, "many">;
    tags: z.ZodArray<z.ZodString, "many">;
    archived: z.ZodDefault<z.ZodBoolean>;
    user_notes: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    description_file: string;
    categories: {
        category_name: string;
        resume_points_file: string;
    }[];
    user_notes: string;
    archived: boolean;
    company: string;
    role: string;
    startDate: string;
    endDate: string | null;
    tags: string[];
    location?: string | undefined;
}, {
    id: string;
    description_file: string;
    categories: {
        category_name: string;
        resume_points_file: string;
    }[];
    company: string;
    role: string;
    startDate: string;
    tags: string[];
    user_notes?: string | undefined;
    archived?: boolean | undefined;
    location?: string | undefined;
    endDate?: string | null | undefined;
}>, "many">;
export type WorkExperience = z.infer<typeof WorkExperienceSchema>;
