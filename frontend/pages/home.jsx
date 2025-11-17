import { useState } from "react";
import api from "../services/api";

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
        console.log(response)
    };

    return(
        <div className="flex flex-col w-2/3">
            <textarea placeholder="Enter your code..." value={code} onChange={(e) => setCode(e.target.value)} className="bg-gray-700 rounded-lg h-170 m-4 p-3 resize-none" />
            <div>
                <input type='file' onChange={handleFileInput} className="file:bg-blue-500 file:text-white file:px-4 file:py-2 file:rounded-md hover:file:bg-blue-600 m-4"/>
                <button type='button' onClick={handleSubmission} disabled={!code} className={`text-white px-4 py-2 rounded-md 
                    ${code ? "bg-green-500 hover:bg-green-600" : "bg-green-900 cursor-not-allowed"} `}>Submit</button>
            </div>
        </div>
    );
}