import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useState } from "react";
import React from "react";
import { NextPage } from "next";
import axios from "axios";

const Home: NextPage = () => {
  //code lines for the editor
  const [code, setCode] = useState("");
  const [output, setOutput] = useState(">>>");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  //function to handle the code submission
  const handleSubmit = async () => {
    setLoading(true);
    // const res = await fetch("http://localhost:5000/eval", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ code: code }),
    // });
    const res = await axios.post("http://127.0.0.1:8000/eval", {
      code: code,
    });
    setLoading(false);
    if (res.data.error) {
      setError(res.data.error);
      setOutput("");
    }
    if (res.data) {
      setError("");
      setOutput((prev) => prev.slice(0, -1) + res.data + "\n>>>");
    }
  };
  return (
    <div className="h-screen bg-gray-500">
      <Head>
        <title>UCSP IDE</title>
        <meta
          name="description"
          content="Remote Code Execution App developed by UCSP students"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="text-center text-3xl font-bold font-mono bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
        UCSP IDE
      </h1>
      <div className="flex flex-row h-5/6 justify-around">
        <div className="flex flex-col justify-center">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleSubmit}
          >
            Run
          </button>
          <textarea
            className="w-96 h-5/6 border-2 border-gray-300 rounded-m font-mono flex-grow p-2"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Tab") {
                e.preventDefault();
                setCode(code + "\t");
              }
            }}
          />
        </div>
        <div className="flex flex-col justify-center">
        <button
            className="bg-red-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={()=>{
              setOutput("")
              setError("")
            }}
          >
            Clear
          </button>
          <textarea
            className="w-96 h-5/6 border-2 border-gray-300 rounded-m font-mono flex-grow p-2 bg-gray-800 text-gray-100"
            value={output}
            onChange={(e) => setOutput(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
