import { useState } from "react";
import api from "../services/api";
import Editor from "@monaco-editor/react"
import { getCodingLanguages } from "../data/codeLanguages";

export default function Home() {
    
    // UseState() returns an array containing a variable, and a function that can edit that variable's value
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [modelResponse, setModelResponse] = useState('')
    const [codeLanguage, setCodeLanguage] = useState('plaintext')

    const handleFileInput = (e) => {
        const file = e.target.files[0]
        setCodeLanguage(getCodingLanguages(file.name))

        if(file){
            const fileReader = new FileReader();
    
            fileReader.onload = (event) =>{
                setCode(event.target.result)
            };
    
            fileReader.readAsText(file)
        }
    }

    // To send the code to the backend
    const handleSubmission = async () => {
        if (!code){
            alert("Error")
            return
        }

        setLoading(true)
        const response = await api.post('/upload', {codeToReview: code})
        setLoading(false)

        setModelResponse(response.data)
    };
    
    return(
        <div className="flex flex-col w-full ">
            <div className="flex">
                <div className="flex-2 m-4 rounded-2xl overflow-hidden">
                    <Editor height="80vh" theme="vs-dark" 
                    defaultValue="Enter your code..." defaultLanguage="plaintext" language={codeLanguage} 
                    value={code ?? ""} onChange={(value) => setCode(value)} />
                </div>

                <div className="flex-1 bg-gray-900 m-4 rounded-lg overflow-y-auto max-h-[80vh]">
                    <div className="text-white font-bold text-xl px-4 py-2 border-b-2 border-gray-400 text-center">
                        Review Results
                    </div>
                    <ul className="m-4">
                        {modelResponse ? modelResponse.modelOutput.map((item, index) => (   // Must have the same names as in the JSON
                            <li key={index} className={`${
                                item.severity == 'Low' ? "bg-sky-800" :
                                item.severity == 'Medium' ? "bg-yellow-600" :
                                "bg-red-800"
                            } py-3 px-4 my-4 rounded-lg`}>
                            <div className="flex justify-between">
                                <span className="text-left font-bold border-b-2 mb-3">{item.issue} <b><i>[Ln {item.line}]</i></b></span>
                                <span className="text-right"><b>{item.severity}</b></span>
                            </div>
                            <u><b>Description</b></u> <br></br> {item.description}<br></br>
                            <u><b>Fix</b></u> <br></br> {item.fix}
                            </li>                 
                        )) : loading ?
                        <div className="flex justify-center items-center my-4">
                                <div className="w-10 h-10 border-4 border-white-500 border-dashed rounded-full animate-spin"></div>
                            </div>  
                            : <div className="text-center">
                                No code to review yet...
                            </div>
                        }
                    </ul>
                </div>
            </div>
            <div>
                <input type='file' onChange={handleFileInput} className="file:bg-blue-500 file:text-white file:px-4 file:py-2 file:rounded-md hover:file:bg-blue-600 m-4"/>
                <button type='button' onClick={handleSubmission} disabled={!code || loading} className={`text-white px-5 py-2 rounded-md 
                    ${(code && !loading) ? "bg-green-500 hover:bg-green-600" : "bg-green-900 cursor-not-allowed"} `}>{loading ? "Processing..." : "Submit"}</button>
            </div>
        </div>
    );
}