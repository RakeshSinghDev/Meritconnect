export interface Job {
    _id: string;
    title: string;
    company: string;
    location: string;
    employmentType: "Full-Time" | "Part-Time" | "Internship" | "Contract";
    salary: number;
    description: string;
    skills: string[];
    experience: number;
    isActive: boolean;
    createdAt: string;
}

export interface CreateJobDto {
    title: string;
    company: string;
    location: string;
    employmentType: "Full-Time" | "Part-Time" | "Internship" | "Contract";
    salary: number;
    description: string;
    skills: string[];
    experience: number;
}

export type UpdateJobDto = Partial<CreateJobDto>;
