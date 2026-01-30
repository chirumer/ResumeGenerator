import { z } from "zod";
export declare const GitHubSchema: z.ZodObject<{
    url: z.ZodEffects<z.ZodString, string, string>;
    commit_count: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    url: string;
    commit_count: number;
}, {
    url: string;
    commit_count: number;
}>;
export declare const CategorySchema: z.ZodObject<{
    category_name: z.ZodString;
    resume_points_file: z.ZodString;
}, "strip", z.ZodTypeAny, {
    category_name: string;
    resume_points_file: string;
}, {
    category_name: string;
    resume_points_file: string;
}>;
export declare const ProjectSchema: z.ZodObject<{
    id: z.ZodString;
    project_name: z.ZodString;
    description_file: z.ZodString;
    github: z.ZodObject<{
        url: z.ZodEffects<z.ZodString, string, string>;
        commit_count: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        url: string;
        commit_count: number;
    }, {
        url: string;
        commit_count: number;
    }>;
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
    user_notes: z.ZodDefault<z.ZodString>;
    archived: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: string;
    project_name: string;
    description_file: string;
    github: {
        url: string;
        commit_count: number;
    };
    categories: {
        category_name: string;
        resume_points_file: string;
    }[];
    user_notes: string;
    archived: boolean;
}, {
    id: string;
    project_name: string;
    description_file: string;
    github: {
        url: string;
        commit_count: number;
    };
    categories: {
        category_name: string;
        resume_points_file: string;
    }[];
    user_notes?: string | undefined;
    archived?: boolean | undefined;
}>;
export declare const ProjectsArraySchema: z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    project_name: z.ZodString;
    description_file: z.ZodString;
    github: z.ZodObject<{
        url: z.ZodEffects<z.ZodString, string, string>;
        commit_count: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        url: string;
        commit_count: number;
    }, {
        url: string;
        commit_count: number;
    }>;
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
    user_notes: z.ZodDefault<z.ZodString>;
    archived: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: string;
    project_name: string;
    description_file: string;
    github: {
        url: string;
        commit_count: number;
    };
    categories: {
        category_name: string;
        resume_points_file: string;
    }[];
    user_notes: string;
    archived: boolean;
}, {
    id: string;
    project_name: string;
    description_file: string;
    github: {
        url: string;
        commit_count: number;
    };
    categories: {
        category_name: string;
        resume_points_file: string;
    }[];
    user_notes?: string | undefined;
    archived?: boolean | undefined;
}>, "many">;
export type Project = z.infer<typeof ProjectSchema>;
export type GitHub = z.infer<typeof GitHubSchema>;
