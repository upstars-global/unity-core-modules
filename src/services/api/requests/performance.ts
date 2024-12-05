import { IGameObserveDTO } from "../DTO/performanceDTO";
import { http } from "../http";
import log from "../../../controllers/Logger";

export async function gameStartObserve(data: IGameObserveDTO) {
    try {
        await http().put("/game-start-performance", data);
    } catch (err) {
        log.error("GAME_START_OBSERVE", err);
    }
}
