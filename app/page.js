"use client"
import RoomModel from './ModelCode/roomOne';
// import Desktop from './ModelCode/desktop';
import * as THREE from "three";
import RoomTwoModel from './ModelCode/roomTwo';
import RoomThreeModel from './ModelCode/roomThree';
import MapPage from './ModelCode/Map';
import LoadingScreen from './ModelCode/loading';

const HomePage = () => {
  return(
    <div className="overflow-hidden">
    {/* <RoomModel /> */}
    {/* <RoomTwoModel /> */}
    {/* <Desktop /> */}
    {/* <RoomThreeModel /> */}
    <LoadingScreen />
    <MapPage />
    </div>
  )
}

export default HomePage