import Chart from 'chart.js/auto';
import { Pie, Bar } from 'react-chartjs-2';
import { useState, useEffect } from 'react';



function UploadPhoto() {

    /**
     * TODO: 
     * styling
     * status bar animation
     * Chart debugging
     */

    const [base64ImgUpload, setBase64ImgUpload] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [fileError, setFileError] = useState('');
    const [loading, setLoading] = useState(false);
    const api_base_url = import.meta.env.api_url ?? "http://localhost:3000";

    let chartData;
    if (analysisResult) {
        console.log(analysisResult.anger)
        chartData = {
            labels: ['Anger', 'Disgust', 'Fear', 'Happiness', 'Sadness', 'Surprise', 'Neutral'],
            datasets: [
                {
                    label: 'Detected Emotions',
                    data: [
                        Number(100* analysisResult.anger),
                        Number(100* analysisResult.disgust),
                        Number(100* analysisResult.fear),
                        Number(100* analysisResult.happiness),
                        Number(100* analysisResult.sadness),
                        Number(100* analysisResult.surprise),
                        Number(100* analysisResult.neutral),
                    ]
                }
            ]
        }
    }

    console.log(chartData)

    let resultsHTML;

    if (loading) {
        resultsHTML =
            <section>
                <h4 className="results"> Loading Analysis Results </h4>
                <p>progess bar blaceholder</p>
            </section>;

    } else if (analysisResult) {
        resultsHTML =
            <div>
                <section>
                    <h6 className="results-header"> Analysis Results </h6>
                </section>
                <section>
                    < Bar
                        datasetIdKey={1}
                        data={chartData}
                        options={{

                        }}
                    />
                </section>
            </div>
    } else {
        resultsHTML = <p>results will be here</p>
    }

    const handleUpload = async (event) => {
        const now = await Date.now();
        const file = event.target.files[0]
        const reader = new FileReader();
        const allowedTypes = ['image/jpeg', 'image/png'];
        const maxSizeMB = 5;

        if (file && !fileError) {
            reader.onload = async (e) => {
                await setBase64ImgUpload(e.target.result)
            }

            reader.onerror = async (e) => {
                console.error(e)
            }

            reader.readAsDataURL(file);

        } else if (file && (!allowedTypes.includes(file.type))) {
            setFileError("Error: File type must be jpeg or png.")

        } else if (file && (file.size > maxSizeMB * 1024 * 1024)) {
            setFileError("Error: The maximum file size allowed is 5 MB.")
        } else {
            setFileError("Error: Please select a file.")
        }

    }


    const handleSubmit = async (event) => {


        if (base64ImgUpload) {
            await setLoading(true);
            const body = {
                timestamp_ms: await Date.now(),
                base64: base64ImgUpload
            }

            const options = {
                "method": "POST",
                "body": await JSON.stringify(body),
                "headers": {
                    "Content-Type": "application/json"
                }
            }

            const request = await fetch(`${api_base_url}/analyze`, options);
            const response = await request.json();
            const data = await JSON.parse(response);

            await setAnalysisResult(data);
            await setLoading(false);

        } else {
            console.log("no file uploaded")
        }
    }

    return (
        <div>
            <main>
                <section>
                    <section>
                        <label htmlFor="myfile">Upload an Image: </label>
                        <input type="file" id="myfile" name="myfile" onChange={(event) => {
                            handleUpload(event)
                        }} />
                    </section>
                    <section>
                        <p>We do not keep your files or data.</p>
                    </section>
                </section>
                <section className="uploaded-image-container">
                    <p>Image: </p>
                    <img className="display-img" src={base64ImgUpload ? base64ImgUpload : "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"} alt="User uploaded Image" />
                </section>
                <section>
                    <button onClick={() => {
                        handleSubmit();
                    }}> Analyze </button>
                </section>
                <section>
                    {resultsHTML}
                </section>
            </main>
        </div>
    )
}

export default UploadPhoto;
