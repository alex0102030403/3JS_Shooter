import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Map from "./Map";
import { useEffect, useState } from "react";
import { onPlayerJoin, insertCoin, isHost, myPlayer, Joystick, useMultiplayerState } from "playroomkit";
import CharacterController from "./CharacterController";
import { CharacterSoldier } from "./CharacterSoldier";
import { Bullet } from "./Bullet";


export default function Experience(){

  const [players, setPlayers] = useState([]);
  const [bullets, setBullets] = useState([]);
  const [networkBullets, setNetworkBullets] = useMultiplayerState("bullets", []);

  const onFire = (bullet) => {
    setBullets((bullets) => [...bullets, bullet]);
    
  };

  const onHit = (bulletId) => {
    setBullets((bullets) => bullets.filter((b) => b.id !== bulletId));
  };

  useEffect(() => {
    setNetworkBullets(bullets);
  },[bullets]);

  const start = async () => {
    // Start the game
    await insertCoin();

    // Create a joystick controller for each joining player
    onPlayerJoin((state) => {
      // Joystick will only create UI for current player (myPlayer)
      // For others, it will only sync their state
      const joystick = new Joystick(state, {
        type: "angular",
        buttons: [{ id: "fire", label: "Fire" }],
      });
      const newPlayer = { state, joystick };
      state.setState("health", 100);
      state.setState("deaths", 0);
      state.setState("kills", 0);
      setPlayers((players) => [...players, newPlayer]);
      state.onQuit(() => {
        setPlayers((players) => players.filter((p) => p.state.id !== state.id));
      });
    });
  };

  useEffect(() => {
    
    start();
    
  }, []);

  const onKilled = (_victim, killer) => {
    const killerState = players.find((p) => p.state.id === killer).state;
    killerState.setState("kills", killerState.state.kills + 1);
  };
 
  

  return (
    <>

      <directionalLight 
      position={[25,18,-25]}
      intensity={0.3}
      castShadow
      shadow-camera-near={0}
      shadow-camera-far={80}
      shadow-camera-left={-30}
      shadow-camera-right={30}
      shadow-camera-top={25}
      shadow-camera-bottom={-25}
      shadow-mapSize-width={4096}
      shadow-bias={-0.0001}
      />
      <Environment preset="sunset"/>
 
    <Map/>
   
      
      {
      players.map(({state,joystick}, idx) => (
        
        <CharacterController 
        key={state.id} 

        //position-x = {idx * 2}
        userPlayer={state.id === myPlayer()?.id}

        state={state} 

        joystick={joystick} 

        onKilled={onKilled}

        onFire={onFire}

        
        
        />
        
      ))}
    
     
      {(isHost() ? bullets : networkBullets).map((bullet) => (
        <Bullet key={bullet.id} {...bullet} onHit={() => onHit(bullet.id)}/>
      ))}
    </>
  )
}
