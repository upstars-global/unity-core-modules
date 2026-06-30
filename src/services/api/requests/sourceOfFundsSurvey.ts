import { FE_API_PREFIX } from "../../../consts/apiConfig";
import { log } from "../../../controllers/Logger";
import type {
    SourceOfFundsSurveyTicketPayload,
    SourceOfFundsSurveyTicketResponse,
} from "../DTO/sourceOfFundsSurvey";
import { http } from "../http";

export async function createSourceOfFundsSurveyTicketReq(
    payload: SourceOfFundsSurveyTicketPayload,
): Promise<SourceOfFundsSurveyTicketResponse> {
    try {
        const { data } = await http().post<SourceOfFundsSurveyTicketResponse>(
            `${ FE_API_PREFIX }/freshdesk/tickets`,
            payload,
        );

        return data;
    } catch (error) {
        log.error("CREATE_SOURCE_OF_FUNDS_SURVEY_TICKET_ERROR", error);
        throw error;
    }
}
