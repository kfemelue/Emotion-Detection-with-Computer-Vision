import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Pie, Bar } from 'react-chartjs-2';
import { useState, useEffect } from 'react';



function UploadPhoto() {

    /**
     * TODO: 
     * styling
     * status bar animation
     */

    const [base64ImgUpload, setBase64ImgUpload] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [fileError, setFileError] = useState('');
    const [loading, setLoading] = useState(false);
    const api_base_url = import.meta.env.api_url ?? "http://localhost:3000";

    const chartOptions = {
        scales: {
            y: {
                beginAtZero: true,
                max: 1
            },
        },
        plugins: {
            datalabels: {
                display: true,
                color: 'black',
                anchor: 'end',
                align: 'top',
                formatter: (value, context) => {
                    return value.toFixed(2); // Format the number
                }
            }
        }
    };

    let chartData;
    let resultsHTML;

    if (analysisResult) {
        chartData = {
            labels: ['Anger', 'Disgust', 'Fear', 'Happiness', 'Sadness', 'Surprise', 'Neutral'],
            datasets: [
                {
                    label: 'Detected Emotions',
                    data: [
                        Number(analysisResult['0'].anger),
                        Number(analysisResult['0'].disgust),
                        Number(analysisResult['0'].fear),
                        Number(analysisResult['0'].happiness),
                        Number(analysisResult['0'].sadness),
                        Number(analysisResult['0'].surprise),
                        Number(analysisResult['0'].neutral),
                    ],
                    minBarLength: 10
                }
            ]
        };
    }

    if (loading) {
        resultsHTML =
            <section>
                <h4 className="loading-message"> Loading Analysis Results </h4>
                <p>progess bar placeholder</p>
            </section>;

    } else if (analysisResult) {
        resultsHTML =
            <div>
                <section>
                    <h6 className="results-header"> Analysis Results </h6>
                </section>
                <section className="chart-container">
                    < Bar
                        datasetIdKey={1}
                        data={chartData}
                        options={chartOptions}
                        plugins={[ChartDataLabels]}
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
                        <input type="file" id="myfile" name="myfile" onChange={ (event) => {
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
