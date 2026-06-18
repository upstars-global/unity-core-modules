import type { SourceOfFundsSurveyTicketPayload } from "./api/DTO/sourceOfFundsSurvey";
import { createSourceOfFundsSurveyTicketReq } from "./api/requests/sourceOfFundsSurvey";

export async function createSourceOfFundsSurveyTicket(
    payload: SourceOfFundsSurveyTicketPayload,
): Promise<void> {
    await createSourceOfFundsSurveyTicketReq(payload);
}
