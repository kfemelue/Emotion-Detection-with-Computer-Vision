import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Pie, Bar } from 'react-chartjs-2';
import { useState, useEffect } from 'react';

async function UploadPhoto() {

    /**
     * TODO: 
     * decide on best chart to visualize them based on rational value of emotions preset
     * handle NAN results from Pyfeat, error message display to user that human images are needed?, etc
     * handle server errors
     */

    const [base64ImgUpload, setBase64ImgUpload] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [fileError, setFileError] = useState('');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [apiError, setApiError] = useState(null);
    const api_base_url = await import.meta.env.VITE_API_URL;

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
    let emotions;
    let emotionsHTML = [];

    if (analysisResult) {
        if ( analysisResult['0'].anger==NaN ) {
            setFileError('No Emotions were detected in image, please upload a file with a face featured in it')

        }

        emotions = [{ key: 'Anger', value: Number(analysisResult['0'].anger) ?? 0 },
        { key: 'Disgust', value: Number(analysisResult['0'].disgust) ?? 0 },
        { key: 'Fear', value: Number(analysisResult['0'].fear) ?? 0 },
        { key: 'Happiness', value: Number(analysisResult['0'].happiness) ?? 0 },
        { key: 'Sadness', value: Number(analysisResult['0'].sadness) ?? 0 },
        { key: 'Surprise', value: Number(analysisResult['0'].surprise) ?? 0 },
        { key: 'Neutral', value: Number(analysisResult['0'].neutral) ?? 0 }
        ];

        for (let i = 0; i < emotions.length; i++) {
            let row = <tr key={i}>
                <td> {emotions[i].key} </td>
                <td> {emotions[i].value} </td>
            </tr>
            emotionsHTML.push(row)
        }

        chartData = {
            labels: ['Anger', 'Disgust', 'Fear', 'Happiness', 'Sadness', 'Surprise', 'Neutral'],
            datasets: [
                {
                    label: 'Emotion Presence Likelihood',
                    data: [
                        Number(analysisResult['0'].anger) ?? 0,
                        Number(analysisResult['0'].disgust) ?? 0,
                        Number(analysisResult['0'].fear) ?? 0,
                        Number(analysisResult['0'].happiness) ?? 0,
                        Number(analysisResult['0'].sadness) ?? 0,
                        Number(analysisResult['0'].surprise) ?? 0,
                        Number(analysisResult['0'].neutral) ?? 0,
                    ],
                    minBarLength: 10
                }
            ]
        };
    }

    if (loading) {
        resultsHTML =
            <section>
                <h4 id="loading-message"> Loading Analysis Results </h4>
                <div id="progress-container">
                    <div id="progress-bar" style={{ width: `${progress}%` }}></div>
                </div>
            </section>;

    } else if (analysisResult) {

        const sortedEmotions = emotions.sort( (a,b) => {
            return b.value - a.value
        })

        resultsHTML =
            <section id="analysis-container">
                <section>
                    <h3 id="results-header"> Analysis Results </h3>
                </section>
                <section id="results-container">
                    <section id="results-table">
                        <table>
                            <tbody>
                                <tr>
                                    <th>Emotion</th>
                                    <th>Likelihood</th>
                                </tr>
                                {emotionsHTML}
                            </tbody>
                        </table>
                    </section>
                    <section className="chart-container">
                        < Bar
                            datasetIdKey={1}
                            data={chartData}
                            options={chartOptions}
                            plugins={[ChartDataLabels]}
                        />
                    </section>
                </section>
                <section id='results-explanation'>
                    <p>
                        The top three most likely emotions in the photo are: 
                        <br></br> {sortedEmotions[0].key} with a probability of {sortedEmotions[0].value}, 
                        <br></br> {sortedEmotions[1].key} with a probability of {sortedEmotions[1].value}, and 
                        <br></br> {sortedEmotions[2].key} with a probability of {sortedEmotions[2].value}.
                    </p>
                </section>
            </section>;
    } else {
        resultsHTML = <p></p>
    }

    const handleUpload = async (event) => {
        if (base64ImgUpload !== '') {
            setBase64ImgUpload('');
        }

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
            await setProgress(0);

            const timer = setInterval(() => {
                setProgress((p) => (p < 90 ? p + 10 : p))
            }, 300);

            const body = {
                timestamp_ms: await Date.now(),
                base64: base64ImgUpload
            }

            const options = {
                "method": "POST",
                "body": await JSON.stringify(body),
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            }

            const url = await `${api_base_url}/analyze`

            try {
                const request = await fetch("http://localhost:3000/analyze", options);
                const response = await request.json();
                const data = await JSON.parse(response);
                await setAnalysisResult(data);

            } catch (e) {
                await console.error(e)
                await setApiError(e.message)
            } finally {
                await clearInterval(timer)
                await setLoading(false);
            }

        } else {
            setFileError("Error: Please select a file.")
        }
    }

    return (
        <div>
            <main id='upload-container'>
                <section id='upload-section'>
                    <section className='description-container'>
                        <p id='description-text'>Upload a Photo of a human face for analysis</p>
                    </section>
                    <section id='input-container'>
                        {/* <label htmlFor="myfile">Upload an Image: </label> */}
                        <input type="file" id="file-input" name="myfile" onChange={(event) => {
                            handleUpload(event)
                        }} />
                        {/* <p id='upload-disclaimer-text'>We do not keep your files or data.</p> */}
                    </section>
                    <section className='description-container'>
                        <p id='description-text' style={{color: 'red'}}>{fileError}</p>
                    </section>

                </section>
                <section id="uploaded-image-container">
                    {/* <p id="image-label"> Image: </p> */}
                    <img id="displayed-image" src={base64ImgUpload ? base64ImgUpload : "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"} alt="User uploaded Image" />
                </section>
                <section id="submit-button-container">
                    <button id="submit-button" onClick={() => {
                        handleSubmit();
                    }}> Analyze </button>
                </section>
                <section id='results-container'>
                    {resultsHTML}
                </section>
            </main>
        </div>
    )
}

export default UploadPhoto;
