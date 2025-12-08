import { useState, useEffect } from 'react';

function UploadPhoto() {

    /**
     * TODO: 
     * styling
     * display to users when results are loading, status bar animation
     */

    const [base64ImgUpload, setBase64ImgUpload] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const api_base_url = import.meta.env.api_url ?? "http://localhost:3000";


    const resultsHTML = <div>
        <h6 className="results-header">Analysis Results</h6>
        <p className="results">{analysisResult}</p>
    </div>

    const handleUpload = async (event) => {
        const now = await Date.now();
        const file = event.target.files[0]
        const reader = new FileReader();

        reader.onload = async (e) => {
            await setBase64ImgUpload(e.target.result)
        }

        reader.onerror = async (e) => {
            console.error(e)
        }

        reader.readAsDataURL(file);
    }


    const handleSubmit = async (event) => {

        if (base64ImgUpload) {
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
            await setLoading(true)
            const response = await request.json();

            const data = response;
            await setAnalysisResult(data);
            await setLoading(false)

        } else {
            console.log("no file uploaded")
        }
    }

    return (
        <div>
            <main>
                <section>
                    <div>
                        <label htmlFor="myfile">Select a file to upload</label>
                        <input type="file" id="myfile" name="myfile" onChange={(event) => {
                            handleUpload(event)
                        }} />
                        <p>We do not keep your files or data.</p>
                    </div>
                </section>

                <section>
                    <p>Uploaded Image: </p>
                    <img className="display-img" src={base64ImgUpload} alt="User uploaded Image" />
                    <button onClick={() => {
                        handleSubmit();
                    }}> Analyze </button>
                </section>

                <section>
                    {loading ? <p>results loading</p> : resultsHTML}
                </section>

            </main>
        </div>
    )
}

export default UploadPhoto;
