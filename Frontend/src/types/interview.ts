export interface Interview {
    _id: string;

    application: string;

    recruiter: string;

    candidate: {
        _id: string;
        name: string;
        email: string;
    };

    job: {
        _id: string;
        title: string;
        company: string;
    };

    interviewDate: string;

    duration: number;

    mode: "Online" | "Offline";

    meetingLink?: string;

    venue?: string;

    notes?: string;

    status: "Scheduled" | "Completed" | "Cancelled";

    createdAt: string;

    updatedAt: string;
}

export interface ScheduleInterviewDto {
    applicationId: string;

    interviewDate: string;

    duration: number;

    mode: "Online" | "Offline";

    meetingLink?: string;

    venue?: string;

    notes?: string;
}