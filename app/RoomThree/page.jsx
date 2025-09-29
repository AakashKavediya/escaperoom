import BackButton from "../ModelCode/backButton"
import LoadingScreen from "../ModelCode/loading"
import RoomThreeModel from "../ModelCode/roomThree"

const RoomThree = () => {
    return(
        <div>
            <LoadingScreen />
            <RoomThreeModel />
            <BackButton />
        </div>
    )
}
export default RoomThree