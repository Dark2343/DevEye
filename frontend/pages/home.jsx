import { useState } from "react";
import api from "../services/api";
import modelData from "../modelOutput.json"

export default function Home() {
    
    // UseState() returns an array containing a variable, and a function that can edit that variable's value
    const [code, setCode] = useState('')

    const handleFileInput = (e) => {
        const file = e.target.files[0];

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

        const response = await api.post('/upload', {codeToReview: code})
    };

    return(
        <div className="flex flex-col w-full ">
            <div className="flex">
                <textarea className="flex-2 max-w-7xl bg-gray-700 rounded-lg h-170 m-4 p-3 resize-none" placeholder="Enter your code..." value={code} onChange={(e) => setCode(e.target.value)}  />
                <div className="bg-indigo-950 m-4 rounded-lg flex-1">
                    <ul className="m-4">
                        {modelData.modelOutput.map((item, index) => (   // Must have the same names as in the JSON
                            <li key={index} className={`${
                                item.severity == 'Low' ? "bg-sky-800" :
                                item.severity == 'Medium' ? "bg-yellow-600" :
                                "bg-red-800"
                            } py-3 px-4 my-4 rounded-lg`}>
                            Line: {item.line}
                            <div className="flex justify-between">
                                <span className="text-left">{item.issue}</span>
                                <span className="text-right"><b><i>{item.severity}</i></b></span>
                            </div>
                            <b>Description:</b> {item.description}<br></br>
                            <b>Fix:</b> {item.fix}
                            </li>                 
                        ))}
                    </ul>
                </div>
            </div>
            <div>
                <input type='file' onChange={handleFileInput} className="file:bg-blue-500 file:text-white file:px-4 file:py-2 file:rounded-md hover:file:bg-blue-600 m-4"/>
                <button type='button' onClick={handleSubmission} disabled={!code} className={`text-white px-4 py-2 rounded-md 
                    ${code ? "bg-green-500 hover:bg-green-600" : "bg-green-900 cursor-not-allowed"} `}>Submit</button>
            </div>
        </div>
    );
}