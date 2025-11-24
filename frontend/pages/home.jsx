import { useState } from "react";
import api from "../services/api";
import Editor from "@monaco-editor/react"
import { getCodingLanguages } from "../data/codeLanguages";
import { severityColors } from "../data/severityColors";

export default function Home() {
    
    // UseState() returns an array containing a variable, and a function that can edit that variable's value
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [modelOutput,setModelOutput] = useState('')
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

        setModelOutput(response.data.modelOutput)
    };
    
    // TODO: Implement error handling
    return(
        <div className="flex flex-col w-full ">
            <div className="bg-gray-900 text-white font-bold text-3xl mb-3 py-3 border-b-3 border-gray-600 text-center">
                👁️ Dev Eye
            </div>
            <div className="flex">
                <div className="flex-2 m-4 rounded-2xl overflow-hidden">
                    <Editor height="80vh" theme="vs-dark" 
                    defaultValue="Enter your code..." defaultLanguage="plaintext" language={codeLanguage} 
                    value={code ?? ""} onChange={(value) => setCode(value)} />
                </div>

                <div className="flex-1 bg-gray-900 m-4 rounded-lg overflow-y-auto max-h-[80vh]">
                    <div className="text-white font-bold text-xl px-4 py-2 border-b-2 border-gray-400 text-center sticky top-0 bg-gray-900 z-10">
                        Review Results
                    </div>
                    <ul className="m-4">
                        {modelOutput ? modelOutput.map((item, index) => (   // Must have the same names as in the JSON
                            <li key={index} className={`border-l-7 ${severityColors[item.severity].border} bg-gray-800 py-3 px-4 my-4 rounded-lg`}>
                            <div className="flex justify-between items-start">
                                <span className="text-left font-bold border-b-2 mb-3">{item.issue} <b><i>[Ln {item.line}]</i></b></span>
                                <div className={`${severityColors[item.severity].bg} py-1 px-2 rounded-lg`}>
                                    <span className="text-right"><b>{item.severity}</b></span>
                                </div>
                            </div>
                            <b>Description</b> <br></br> {item.description}<br></br>
                            <b>Fix</b> <br></br> {item.fix}
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
                <input type='file' onChange={handleFileInput} className="file:bg-gray-700 file:text-white file:px-4 file:py-2 file:rounded-md hover:file:bg-gray-800 m-4 border-2 border-gray-700 rounded-lg hover:border-gray-800 "/>
                <button type='button' onClick={handleSubmission} disabled={!code || loading} className={`text-white px-5 py-2 rounded-md 
                    ${(code && !loading) ? "bg-green-500 hover:bg-green-600" : "bg-green-900 cursor-not-allowed"} `}>{loading ? "Processing..." : "Submit"}</button>
            </div>
        </div>
    );
}