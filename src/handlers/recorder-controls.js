const WEBSOCKET_URL = "ws://localhost:8080/ws/asset";
let record = null; // audio data
let ws = null; // websocket

export async function startRecording(setRecorderState) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        init(new Recorder(stream));
        console.log('start recording');
        // use websocket
        ws = new WebSocket(WEBSOCKET_URL);
        ws.binaryType = 'arraybuffer';
        ws.onopen = function (event) {
            console.log('connected');
            setInterval(function () {
                if (ws.readyState === 1) {
                    record.start();
                }
            }, 180);
        };
        ws.onmessage = function (msg) {
            console.info(msg)
        }
        ws.onerror = function (err) {
            console.info(err)
        }

        setRecorderState((prevState) => {
            return {
                ...prevState,
                initRecording: true,
                mediaStream: stream,
            };
        });
    } catch (err) {
        console.log(err);
    }
}

export function stopRecording(recorder) {
    if (ws) {
        ws.close();
        record.stop();
        console.log('websocket closed');
    }
    if (recorder.state !== "inactive") recorder.stop();
}

class Recorder {
    constructor(stream) {
        var sampleBits = 16; // output sample bit 8, 16
        var sampleRate = 16000; // output sample rate
        var context = new AudioContext();
        var audioInput = context.createMediaStreamSource(stream);
        var recorder = context.createScriptProcessor(4096, 1, 1);
        var audioData = {
            size: 0,
            buffer: [],
            inputSampleRate: 48000,
            inputSampleBits: 16,
            outputSampleRate: sampleRate,
            oututSampleBits: sampleBits,
            clear: function () {
                this.buffer = [];
                this.size = 0;
            },
            input: function (data) {
                this.buffer.push(new Float32Array(data));
                this.size += data.length;
            },
            compress: function () {
                var data = new Float32Array(this.size);
                var offset = 0;
                for (var i = 0; i < this.buffer.length; i++) {
                    data.set(this.buffer[i], offset);
                    offset += this.buffer[i].length;
                }
                var compression = parseInt(this.inputSampleRate / this.outputSampleRate);
                var length = data.length / compression;
                var result = new Float32Array(length);
                var index = 0, j = 0;
                while (index < length) {
                    result[index] = data[j];
                    j += compression;
                    index++;
                }
                return result;
            },
            encodePCM: function () {
                // var sampleRate = Math.min(this.inputSampleRate, this.outputSampleRate);
                var sampleBits = Math.min(this.inputSampleBits, this.oututSampleBits);
                var bytes = this.compress();
                var dataLength = bytes.length * (sampleBits / 8);
                var buffer = new ArrayBuffer(dataLength);
                var data = new DataView(buffer);
                var offset = 0;
                for (var i = 0; i < bytes.length; i++, offset += 2) {
                    var s = Math.max(-1, Math.min(1, bytes[i]));
                    data.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
                }
                return new Blob([data]);
            }
        };

        var sendData = function () {
            var reader = new FileReader();
            reader.onload = e => {
                var outbuffer = e.target.result;
                var arr = new Int8Array(outbuffer);
                if (arr.length > 0) {
                    var tmparr = new Int8Array(1024);
                    var j = 0;
                    for (var i = 0; i < arr.byteLength; i++) {
                        tmparr[j++] = arr[i];
                        if (((i + 1) % 1024) === 0) {
                            ws.send(tmparr);
                            if (arr.byteLength - i - 1 >= 1024) {
                                tmparr = new Int8Array(1024);
                            } else {
                                tmparr = new Int8Array(arr.byteLength - i - 1);
                            }
                            j = 0;
                        }
                        if ((i + 1 === arr.byteLength) && ((i + 1) % 1024) !== 0) {
                            ws.send(tmparr);
                        }
                    }
                }
            };
            reader.readAsArrayBuffer(audioData.encodePCM());
            audioData.clear(); // clear old data
        };

        this.start = function () {
            audioInput.connect(recorder);
            recorder.connect(context.destination);
        };

        this.stop = function () {
            recorder.disconnect();
        };

        this.getBlob = function () {
            return audioData.encodePCM();
        };

        this.clear = function () {
            audioData.clear();
        };

        recorder.onaudioprocess = function (e) {
            var inputBuffer = e.inputBuffer.getChannelData(0);
            audioData.input(inputBuffer);
            sendData();
        };
    }
}

function init(rec) {
    record = rec;
}