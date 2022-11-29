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
      axios
        .post(
          `${window.location.origin.replace(":3000", "")}:8000/code_from_room`,
          {
            room: router.query.room,
          }
        )
        .then((res) => {
          setCode(res.data);
        });
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
  useEffect(() => {
    Array.prototype.includes = function (value) {
      return this.indexOf(value) !== -1;
    };
    //@ts-ignore
    String.prototype.characterize = function (callback) {
      var characters = this.split("");
      var options = {};

      for (var i = 0; i < this.length; i++) {
        options = callback(characters[i]);
      }
    };
    //@ts-ignore
    var $textarea;
    //@ts-ignore
    var $highlight;

    var $keywords = [
      "False",
      "None",
      "True",
      "and",
      "as",
      "assert",
      "break",
      "class",
      "continue",
      "def",
      "del",
      "elif",
      "else",
      "except",
      "finally",
      "for",
      "from",
      "global",
      "if",
      "import",
      "in",
      "is",
      "lambda",
      "nonlocal",
      "not",
      "or",
      "pass",
      "raise",
      "return",
      "try",
      "while",
      "with",
      "yield",
    ];
    var $functions = [
      "abs",
      "dict",
      "help",
      "min",
      "setattr",
      "all",
      "dir",
      "hex",
      "next",
      "slice",
      "any",
      "divmod",
      "id",
      "object",
      "sorted",
      "ascii",
      "enumerate",
      "input",
      "oct",
      "staticmethod",
      "bin",
      "eval",
      "int",
      "open",
      "str",
      "bool",
      "exec",
      "isinstance",
      "ord",
      "sum",
      "bytearray",
      "filter",
      "issubclass",
      "pow",
      "super",
      "bytes",
      "float",
      "iter",
      "print",
      "tuple",
      "callable",
      "format",
      "len",
      "property",
      "type",
      "chr",
      "frozenset",
      "list",
      "range",
      "vars",
      "classmethod",
      "getattr",
      "locals",
      "repr",
      "zip",
      "compile",
      "globals",
      "map",
      "reversed",
      "_import_",
      "complex",
      "hasattr",
      "max",
      "round",
      "delattr",
      "hash",
      "memoryview",
      "set",
    ];

    window.addEventListener("load", function () {
      $textarea = document.getElementById("code");
      $highlight = document.getElementById("highlight-area");

      var triggerHighlight = function () {
        //@ts-ignore
        var tokens = tokenize($textarea.value);
        //@ts-ignore
        $highlight.innerHTML = "";
        for (var i = 0; i < tokens.length; i++) {
          var token = tokens[i];
          var span = document.createElement("span");
          span.className = "highlight-" + token.type;
          span.innerText = token.value;
          //@ts-ignore
          $highlight.appendChild(span);
        }
        //@ts-ignore
        var lines = $textarea.value.split("\n");
        if (lines[lines.length - 1] === "") {
          var br = document.createElement("br");
          //@ts-ignore
          $highlight.appendChild(br);
        }
        //@ts-ignore
        $highlight.scrollTop = $textarea.scrollTop;
      };
      //@ts-ignore
      $textarea.addEventListener("input", triggerHighlight);
      //@ts-ignore
      $textarea.addEventListener("scroll", function (event) {
        //@ts-ignore
        $highlight.scrollTop = this.scrollTop;
      });

      var tabCode = 9;
      var leftParenthesisCode = 40;
      //@ts-ignore
      $textarea.addEventListener("keydown", function (event) {
        switch (event.keyCode) {
          case tabCode:
            event.preventDefault();
            //@ts-ignore
            this.value += "    ";
            break;
        }
      });

      //$textarea.textContent = code;
      //@ts-ignore
      $highlight.textContent = code;
      triggerHighlight();
    });
    //@ts-ignore
    function tokenize(inputString) {
      //@ts-ignore
      var tokens = [];
      var lexedValue = "";
      //@ts-ignore
      var currentToken = null;

      function newSpaceToken() {
        currentToken = { type: "space", value: " " };
        lexedValue = "";
      }

      function parseLexedValueToToken() {
        if (lexedValue) {
          if ($keywords.includes(lexedValue)) {
            tokens.push({ type: "keyword", value: lexedValue });
          } else if ($functions.includes(lexedValue)) {
            tokens.push({ type: "function", value: lexedValue });
          } else if (lexedValue !== "") {
            //@ts-ignore
            if (isNaN(lexedValue)) {
              tokens.push({ type: "default", value: lexedValue });
            } else {
              tokens.push({ type: "number", value: lexedValue });
            }
          }
          lexedValue = "";
        }
      }
      //@ts-ignore
      function lex(char) {
        //@ts-ignore
        if (char !== " " && currentToken && currentToken.type === "space") {
          tokens.push(currentToken);
          lexedValue = "";
          currentToken = null;
        }

        switch (char) {
          case " ":
            if ($keywords.includes(lexedValue)) {
              tokens.push({ type: "keyword", value: lexedValue });
              newSpaceToken();
            } else if ($functions.includes(lexedValue)) {
              tokens.push({ type: "function", value: lexedValue });
              newSpaceToken();
            } else if (lexedValue !== "") {
              //@ts-ignore
              if (isNaN(lexedValue)) {
                tokens.push({ type: "default", value: lexedValue });
              } else {
                tokens.push({ type: "number", value: lexedValue });
              }
              newSpaceToken();
              //@ts-ignore
            } else if (currentToken) {
              //@ts-ignore
              currentToken.value += " ";
            } else {
              newSpaceToken();
            }
            break;

          case '"':
          case "'":
            //@ts-ignore
            if (currentToken) {
              if (currentToken.type === "string") {
                if (currentToken.value[0] === char) {
                  currentToken.value += char;
                  tokens.push(currentToken);
                  currentToken = null;
                } else {
                  currentToken.value += char;
                }
              } else if (currentToken.type === "comment") {
                currentToken.value += char;
              }
            } else {
              if (lexedValue) {
                tokens.push({ type: "default", value: lexedValue });
                lexedValue = "";
              }
              currentToken = { type: "string", value: char };
            }
            break;

          case "=":
          case "+":
          case "-":
          case "*":
          case "/":
          case "%":
          case "&":
          case "|":
          case ">":
          case "<":
          case "!":
            //@ts-ignore
            if (currentToken) {
              currentToken.value += char;
            } else {
              parseLexedValueToToken();
              tokens.push({ type: "operator", value: char });
            }
            break;

          case "#":
            //@ts-ignore
            if (currentToken) {
              currentToken.value += char;
            } else {
              parseLexedValueToToken();
              currentToken = { type: "comment", value: char };
            }
            break;

          case ":":
            //@ts-ignore
            if (currentToken) {
              currentToken.value += char;
            } else {
              parseLexedValueToToken();
              tokens.push({ type: "colon", value: char });
            }
            break;

          case "(":
            //@ts-ignore
            if (currentToken) {
              currentToken.value += char;
            } else {
              parseLexedValueToToken();
              tokens.push({ type: "left-parentheses", value: char });
            }
            break;

          case ")":
            //@ts-ignore
            if (currentToken) {
              currentToken.value += char;
            } else {
              parseLexedValueToToken();
              tokens.push({ type: "right-parentheses", value: char });
            }
            break;

          case "[":
            //@ts-ignore
            if (currentToken) {
              currentToken.value += char;
            } else {
              parseLexedValueToToken();
              tokens.push({ type: "left-bracket", value: char });
            }
            break;

          case "]":
            //@ts-ignore
            if (currentToken) {
              currentToken.value += char;
            } else {
              parseLexedValueToToken();
              tokens.push({ type: "right-bracket", value: char });
            }
            break;

          case ",":
            //@ts-ignore
            if (currentToken) {
              currentToken.value += char;
            } else {
              parseLexedValueToToken();
              tokens.push({ type: "comma", value: char });
            }
            break;

          case "\n":
            //@ts-ignore
            if (currentToken) {
              switch (currentToken.type) {
                case "string":
                case "comment":
                  tokens.push(currentToken);
                  currentToken = null;
                  break;
                default:
              }
            } else {
              parseLexedValueToToken();
              lexedValue = "";
            }
            tokens.push({ type: "newline", value: "\n" });
            break;

          case ";":
            //@ts-ignore
            if (currentToken) {
              currentToken.value += char;
            } else {
              parseLexedValueToToken();
              tokens.push({ type: "semicolon", value: char });
            }
            break;

          default:
            //@ts-ignore
            if (currentToken) {
              currentToken.value += char;
            } else {
              lexedValue += char;
            }

            break;
        }
      }

      /* Lexing the input codes */
      inputString.characterize(lex);

      /* Rest of the lexed value or token which is unfinished */
      parseLexedValueToToken();

      if (currentToken) tokens.push(currentToken);

      /* Secondary Parse to Match Some Patterns */
      var isFunctionArgumentScope = false;
      var tokenCount = tokens.length;
      for (var i = 0; i < tokenCount; i++) {
        //@ts-ignore
        var token = tokens[i];
        if (
          token.type === "keyword" &&
          (token.value === "def" || token.value === "class")
        ) {
          //@ts-ignore
          var peekToken = tokens[i + 2];
          if (peekToken && peekToken.type === "default")
            peekToken.type = "function-name";
        } else if (token.type === "default" && isFunctionArgumentScope) {
          token.type = "argument";
        } else if (token.type === "left-parentheses") {
          //@ts-ignore
          var peekToken = tokens[i - 1];
          if (peekToken && peekToken.type === "function-name")
            isFunctionArgumentScope = true;
        } else if (token.type === "right-parentheses") {
          isFunctionArgumentScope = false;
        }
      }
      //@ts-ignore
      return tokens;
    }
  }, [code]);
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
          <div id="content-box">
          <textarea
            //className="w-96 h-5/6 border-2 border-gray-300 rounded-m font-mono flex-grow p-2"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (socket) {
                sendToSocket({ codeToSend: e.target.value });
              }
            }}
            id="code"
            onKeyDown={(e) => {
              if (e.key === "Tab") {
                e.preventDefault();
                setCode(code + "\t");
              }
            }}
            spellCheck={false}
            wrap="soft"
          />
          <pre id="highlight-area"></pre>
          </div>
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
