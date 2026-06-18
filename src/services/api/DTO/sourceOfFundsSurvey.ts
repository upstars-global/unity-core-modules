export interface SourceOfFundsSurveyAnswers {
    main_source_of_income: string;
    other_sources_of_income: string[];
    total_annual_earnings: string;
    expected_yearly_spending: string;
    employment_status: string;
    primary_occupation: string;
    nationality: string;
    place_of_birth: string;
}

export interface SourceOfFundsSurveyTicketPayload {
    email: string;
    player_id: string | number;
    submitted_at?: string;
    answers: SourceOfFundsSurveyAnswers;
}

export type SourceOfFundsSurveyTicketResponse = {
    status: "ok";
    statusCode: 200;
    error: null;
    ticketId?: number;
} | {
    status: "failed";
    statusCode: 400 | 502 | 503;
    error: {
        label: string;
        message: string;
    };
};
