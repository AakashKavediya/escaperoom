import BackButton from "../ModelCode/backButton"
import LoadingScreen from "../ModelCode/loading"
import RoomTwoModel from "../ModelCode/roomTwo"

const RoomTwo = () => {
    return(
        <div>
            <LoadingScreen />
            <RoomTwoModel />
            <BackButton />
        </div>
    )
}
export default RoomTwo