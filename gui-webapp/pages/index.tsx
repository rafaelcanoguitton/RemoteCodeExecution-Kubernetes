import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useState, useRef, useEffect } from "react";
import React from "react";
import { NextPage } from "next";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
const Home: NextPage = () => {
  //code lines for the editor
  const [code, setCode] = useState("");
  const [output, setOutput] = useState(">>>");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState("");
  const [baseUrl, setBaseUrl] = useState("");

  const router = useRouter();
  useEffect(() => {
    setBaseUrl(window.location.origin.replace(":3000", ""));
    console.log(window.location.origin.replace(":3000", ""));
    if (router.query.room) {
      setRoom(router.query.room as string);
      // use current location
      const sock = io(`${window.location.origin}:8000`);
      sock.on("connect", () => {
        console.log("connected");
      });
      sock.on("message", (msg) => {
        setCode(msg);
      });
      sock.emit("join", { room: router.query.room });
      setSocket(sock);
      axios.post(`${window.location.origin.replace(":3000", "")}:8000/code_from_room`, {
        room: router.query.room,
      }).then((res) => {
        setCode(res.data);
      }
      );
    }
  }, [router.query.room]);
  //function to handle the code submission
  const handleSubmit = async () => {
    setLoading(true);
    const res = await axios.post(`${baseUrl}:8000/eval`, {
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
  const shareThisSession = async () => {
    const randomRoomId = Math.random().toString(36).substring(2, 7);
    setRoom(randomRoomId);
    const sock = io(`${baseUrl}:8000`);
    sock.on("connect", () => {
      console.log("connected");
    });
    sock.emit("join", { room: randomRoomId, code: code });
    sock.on("message", (msg) => {
      setCode(msg);
    });
    setSocket(sock);
    Swal.fire({
      title: "Comparte este link con tus amigos :D",
      text: `${window.location.origin}/?room=${randomRoomId}`,
      icon: "success",
      confirmButtonText: "Ok",
    });
  };

  const sendToSocket = ({ codeToSend }: { codeToSend: string }) => {
    socket?.emit("message", { message: codeToSend, room: room });
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
          <div className="flex flex-row justify-around">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleSubmit}
            >
              Run
            </button>
            {!socket && (
              <button
                className="bg-fuchsia-400 hover:bg-fuchsia-900 text-white font-bold py-2 px-4 rounded"
                onClick={shareThisSession}
              >
                Share
              </button>
            )}
          </div>
          <textarea
            className="w-96 h-5/6 border-2 border-gray-300 rounded-m font-mono flex-grow p-2"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (socket) {
                sendToSocket({ codeToSend: e.target.value });
              }
            }}
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
            onClick={() => {
              setOutput("");
              setError("");
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
