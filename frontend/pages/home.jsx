import { useState } from "react";
import api from "../services/api";

export default function Home() {
    
    // UseState() returns an array containing a variable, and a function that can edit that variable's value
    const [output, setOutput] = useState('')
    const [file, setFile] = useState(null)

    const handleSubmission = async () => {
        // To send the file to the backend
        const formData = new FormData()
        
        if (!file){
            alert("Error")
            return
        }
        formData.append('file', file)
        const response = await api.post('/upload', formData)
        console.log(response)
    };

    return(
        <>
            <input type='file' onChange={(e) => setFile(e.target.files[0])} className="file:bg-blue-500 file:text-white file:px-4 file:py-2 file:rounded-md hover:file:bg-blue-600"/>
            <button type='button' onClick={handleSubmission} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">Submit</button>
        </>
    );
}