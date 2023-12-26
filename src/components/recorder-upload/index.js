import { useState } from "react"
import "./styles.css"

export default function RecorderUpload() {

    const uploadUrl = "http://localhost:8080/api/upload";
    const [isUpload, setIsUpload] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [audioFile, setAudioFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [detail, setDetail] = useState(null);
    const [isError, setIsError] = useState(false);

    function previewFile(e) {
        setFileName(e.target.files[0].name !== 'undefined' ? e.target.files[0].name : "");
        setSelectedFile(URL.createObjectURL(e.target.files[0]));
        setAudioFile(e.target.files[0]);
        setIsUpload(true);
    }

    async function submit() {
        let formData = new FormData();
        formData.append("file", audioFile);
        await fetch(uploadUrl, {
            method: "POST",
            body: formData
        }).then(res => {
            return res.json();
        }).then(data => {
            if (data.error) {
                setIsError(true);
                setDetail(data);
            } else {
                setIsError(false);
                setDetail(data);
            }
        }).catch(err => {
            console.log(err);
        })
    }

    return (
        <>
            <div className="input-file-container">
                <input className="input-file" id="my-audio" type="file"
                    accept="audio/*" onChange={(e) => previewFile(e)} />
                <label tabIndex="0" htmlFor="my-audio" className="input-file-trigger">
                    {fileName !== "" ? (fileName.length > 12 ? fileName.slice(0, 12) + "..." : fileName) : ("Choose a file...")}
                </label>
            </div>
            {isUpload ? (<>
                <audio className="audio" src={selectedFile} controls></audio>
                <button className="submitBtn" onClick={() => submit()}>submit</button></>)
                : (<></>)}
            {(detail && !isError) ? (<>
                <div className="detail-info">
                    <hr />
                    <ul className="ul-style">
                        <li>Info: {detail.format}</li>
                        <li>Duration: {detail.duration} sec</li>
                        <li>Sample Rate: {detail.sampleRate} Hz</li>
                        <li>BitDepth: {detail.bitDepth} bit</li>
                    </ul>
                </div>
            </>) : (<></>)}
            {(detail && isError) ? (<>
                <div className="detail-info">
                    <hr />
                    <p>Error: {detail.error}</p>
                </div>
            </>) : (<></>)}
        </>
    )
}