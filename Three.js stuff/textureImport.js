function onRead(b64,name) {
    console.log(name)
    if (isImg(name)) block64[name.split(".")[0]] = b64
}
function isImg(name) {
    const ending = name.split(".")[1]
    return ending == "png" || ending == "jpg"
}
function getFiles(folder) {
    return new Promise((resolve,reject) => {
        const toRes = folder.entries()
        try {
            resolve(toRes)
        } catch (err) {
            reject(err)
        }
    })
}
function readFolder(folder) {
    console.log(folder.name)
    getFiles(folder).then((res) => {
        let cancontinue = true
        recursion()
        function recursion() {
            const file = getFile(res).then((redFile) => {
                if (!redFile.value) cancontinue = false
                if (cancontinue) {
                    recursion()
                } else {                    
                    console.log("hello")
                    const thing = document.querySelector("#textures")
                    thing.remove()
                    return
                }
                let f = redFile.value
                let fName = f[0]
                f = f[1]
                const reader = new FileReader()
                reader.onload = (evt) => {
                    const b64 = evt.target.result
                    onRead(b64,fName)
                }
                f.getFile().then((file) => {
                    toy = file
                    reader.readAsDataURL(file)
                })
                
            })
        }

    })
}
function getFileAsText(file) {
    return new Promise((resolve,reject) => {
        const text = file.text()
        try {
            resolve(text)
        } catch (err) {
            reject(err)
        }
    })
}
function readFile(f) {
    return new Promise((resolve,reject) => {
        const file = f.getFile()
        try {
            resolve(file)
        } catch (err) {
            reject(err)
        }
    })
}
function getFile(entry) {
    return new Promise((resolve, reject) => {
        const file = entry.next()
        console.log(file)
        if (!file) resolve(false)
        try {
            resolve(file)
        } catch (err) {
            reject(err)
        }
    })
}
function initFolder() {
    const folder = getFolder().then((retrunFolder) => {
        readFolder(retrunFolder)
    })
}
function getFolder() {
    return new Promise((resolve,reject) => {
        const folder = showDirectoryPicker()
        try {
            resolve(folder)
        } catch (err) {
            reject(err)
        }
    })
}