import axios from "axios"

// Pre-configures axios so requests have base defaults 
const api = axios.create({
    baseURL: "http://localhost:5000",
})

export default api;