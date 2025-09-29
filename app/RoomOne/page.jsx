import BackButton from "../ModelCode/backButton"
import LoadingScreen from "../ModelCode/loading"
import RoomModel from "../ModelCode/roomOne"

const RoomOne = () => {
    return(
        <div>
            <LoadingScreen />
            <RoomModel />
            <BackButton />
        </div>
    )
}
export default RoomOne