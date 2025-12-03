const languages = {
    "c": "cpp",
    "h": "cpp",
    "cpp": "cpp",
    "hpp": "cpp",
    "cs": "csharp",
    "css" : "css",
    "dart" : "dart",
    "go": "go",
    "html": "html",
    "htm" : "html",
    "java": "java",
    "js": "javascript",
    "jsx": "javascript",
    "kt": "kotlin",
    "ts": "typescript",
    "tsx": "typescript",
    "md" : "markdown",
    "py": "python",
    "rb": "ruby",
    "php": "php",
    "swift": "swift",
    "yaml": "yaml",
    "yml": "yaml",
}

export function getCodingLanguages(fileName){
    const fileExtension = fileName.slice(fileName.lastIndexOf('.') + 1, fileName.length)
    return languages[fileExtension]
}

