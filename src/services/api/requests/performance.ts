import { FE_API_PREFIX } from "../../../consts/apiConfig";
import { log } from "../../../controllers/Logger";
import { IGameObserveDTO } from "../DTO/performanceDTO";
import { http } from "../http";

export async function gameStartObserve(data: IGameObserveDTO) {
    try {
        await http().put(`${ FE_API_PREFIX }/game-start-performance`, data);
    } catch (err) {
        log.error("GAME_START_OBSERVE", err);
    }
}
