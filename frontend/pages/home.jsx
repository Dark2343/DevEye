import { useState } from "react";
import api from "../services/api";
import Editor from "@monaco-editor/react"
import { getCodingLanguages } from "../data/codeLanguages";
import { severityColors } from "../data/severityColors";
import logo from '../assets/DevEye.png'

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
            {/* NavBar */}
            <div className="flex justify-center items-center gap-2 bg-gray-900 text-white font-bold text-3xl mb-1 py-3 border-b-3 border-gray-600 text-center tracking-wide">
                <img src={logo} width={50}/> <span>Dev Eye</span>
            </div>
            <div className="flex">
                {/* Monaco Code Editor */}
                <div className="flex-2 m-4 rounded-2xl overflow-hidden">
                    <Editor height="80vh" theme="vs-dark" 
                    defaultValue="Enter your code..." defaultLanguage="plaintext" language={codeLanguage} 
                    value={code ?? ""} onChange={(value) => setCode(value)} />
                </div>

                {/* Results Tab */}
                <div className="flex-1 bg-gray-900 m-4 rounded-lg overflow-y-auto max-h-[80vh]">
                    {/* Title */}
                    <div className="text-white font-bold text-xl px-4 py-2 border-b-2 border-gray-400 text-center sticky top-0 bg-gray-900 z-10">
                        Review Results
                    </div>
                    {/* List Items */}
                    <ul className="m-4">
                        {modelOutput ? modelOutput.map((item, index) => (   // Must have the same names as in the JSON
                            /* Border Color */
                            <li key={index} className={`border-l-8 ${severityColors[item.severity].border} bg-gray-800 py-2 px-4 my-4 rounded-lg transition-all hover:scale-[1.01] hover:bg-gray-800/70`}>
                                {/* Details/Summary is for making cards collapsible */}
                                <details>
                                    <summary className="flex justify-between items-start">
                                        <div className="p-1 text-left border-gray-400 cursor-pointer list-none">
                                            <span className="font-bold">{item.issue}</span> <span className="font-semibold italic">[Ln {item.line}]</span>
                                        </div>
                                        <div className={`${severityColors[item.severity].bg} py-1 px-2 rounded-full font-semibold text-right`}>
                                            {item.severity}
                                        </div>
                                    </summary>

                                    {/* Fieldset/Legend is for text sit on a rounded border */}
                                    <div className="mt-2 ml-1">
                                        <fieldset className="border border-gray-400 rounded-xl px-3 py-2 mb-2">
                                            <legend className="font-semibold px-2">Description</legend>

                                            {item.description}
                                        </fieldset>
                                        <fieldset className="border border-gray-400 rounded-xl px-3 py-2">
                                            <legend className="font-semibold px-2">Fix</legend>

                                            {item.fix}
                                        </fieldset>
                                    </div>
                                </details>
                            </li>
                            /* Loading results / No code inputted yet */
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
            {/* Choosing files / Submitting code */}
            <div className="mx-4">
                <input type='file' onChange={handleFileInput} className="cursor-pointer file:cursor-pointer file:bg-gray-700 file:text-white file:px-4 file:py-2 file:rounded-md hover:file:bg-gray-800 border-2 border-gray-700 rounded-lg hover:border-gray-800"/>
                <button type='button' onClick={handleSubmission} disabled={!code || loading} className={`text-white mx-4 px-5 py-2 rounded-md cursor-pointer
                    ${(code && !loading) ? "bg-emerald-600 hover:bg-emerald-700" : "bg-emerald-900 cursor-not-allowed"} `}>{loading ? "Processing..." : "Submit"}</button>
            </div>
        </div>
    );
}