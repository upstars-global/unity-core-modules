import log from "../../../controllers/Logger";
import { IGameObserveDTO } from "../DTO/performanceDTO";
import { http } from "../http";

export async function gameStartObserve(data: IGameObserveDTO) {
    try {
        await http().put("/game-start-performance", data);
    } catch (err) {
        log.error("GAME_START_OBSERVE", err);
    }
}
