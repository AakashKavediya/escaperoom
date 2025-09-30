import BackButton from "../ModelCode/backButton"
import LoadingScreen from "../ModelCode/loading"
import RoomFourModel from "../ModelCode/roomFour"

const RoomFour = () => {
    return(
        <div>
            <LoadingScreen />
            <RoomFourModel />
            <BackButton />
        </div>
    )
}
export default RoomFour