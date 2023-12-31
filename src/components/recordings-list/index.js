import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import useRecordingsList from "../../hooks/use-recordings-list";
import "./styles.css";

export default function RecordingsList({ audio }) {
    const { recordings, deleteAudio } = useRecordingsList(audio);

    return (
        <div className="recordings-container">
            {recordings.length > 0 ? (
                <>
                    <h1>Your recordings</h1>
                    <div className="recordings-list">
                        {recordings.map((record) => (
                            <div className="record" key={record.key}>
                                <audio controls src={record.audio} />
                                <div className="delete-button-container">
                                    <button
                                        className="delete-button"
                                        title="Delete this audio"
                                        onClick={() => deleteAudio(record.key)}>
                                        <FontAwesomeIcon icon={faTrashAlt} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="no-records">
                    <span>Press the microphone for your first record</span>
                </div>
            )}
        </div>
    );
}