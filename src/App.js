import { Routes, Route, Link, useLocation } from "react-router-dom"
import { useEffect } from "react";
import RecorderControls from "./components/recorder-controls";
import RecordingsList from "./components/recordings-list";
import RecorderUpload from "./components/recorder-upload";
import useRecorder from "./hooks/useRecorder";
import "./App.css";

function App() {

  const { recorderState, ...handlers } = useRecorder();
  const { audio } = recorderState;
  const location = useLocation();
  useEffect(() => { }, [location]);

  return (
    <section className="voice-recorder">
      <h1 className="title">Voice Recorder</h1>
      {location.pathname.indexOf("upload") === -1
        ? (<Link className="outline toggleBtn" to={"/upload"}>upload</Link>)
        : (<Link className="outline toggleBtn" to={"/"}>home</Link>)}
      <div className="recorder-container">
        <Routes>
          <Route path="/" element={<>
            <RecorderControls recorderState={recorderState} handlers={handlers} />
            <RecordingsList audio={audio} />
          </>} />
          <Route path="/upload" element={<RecorderUpload />} />
        </Routes>
      </div>
    </section>
  );
}

export default App;
