import type { NextPage } from "next";
import Head from "next/head";

import WaveText from "../components/WaveText";
import * as GOL from "../components/GameOfLife";
import { useEffect } from "react";

const Home: NextPage = () => {
  useEffect(() => {
    GOL.initGame();
    return () => GOL.resetGame();
  }, []);

  return (
    <>
      <Head>
        <title>Justin's Game of Life</title>
        <meta name="description" content="Justin's Game of Life" />
        <link rel="icon" href="/glider.gif" />
      </Head>

      <div className="flex flex-col items-center w-screen h-screen bg-gradient-to-b from-black to-purple-900">
        <WaveText loop={false} textProps="text-white p-0 m-0 text-lg mt-[40px]">
          Justin's Game of Life
        </WaveText>
        <div className="flex w-[100px] mx-auto my-[20px] justify-between">
          <button
            className="bg-transparent text-white border-[1px] border-white p-[5px] rounded-lg transition-all duration-100 hover:bg-white hover:text-black"
            onClick={() => GOL.startGame()}
          >
            Start
          </button>
          <button
            className="bg-transparent text-white border-[1px] border-white p-[5px] rounded-lg transition-all duration-100 hover:bg-white hover:text-black"
            onClick={() => GOL.resetGame()}
          >
            Reset
          </button>
        </div>
        <canvas
          id="game-of-life-canvas"
          className="w-[98vw] h-[calc(98vw / 1.3)] rounded-xl shadow-xl bg-black mx-auto mt-[15px]"
        />
      </div>
    </>
  );
};

export default Home;
