const files = {
    "bozo.jpg": bozothing,
    "top.jpg": topthing,
    "side.jpg": sidething,
    "oakleft.jpg": leftoaklog,
    "oaktop.jpg": topoaklog,
    "oakleaf.png": oakLeaves,
    "stone.jpg": "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",
    "ironore.jpg": "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", 
    "zombie.glb": testZombieModel,
    "font.json": font,
}

const mime = {
    "png": "image/png",
    "webp": "image/webp",
    "jpg": "image/jpg",
    "glb": "model/gltf-binary",
    "json": "application/json"
}

var warningGiven = false;

function file(name) {
    if (!window.location.href.replace(/^.*\:\/\//, "").includes(":") && !window.location.href.includes("file") || window.location.href.includes("localhost")) {
        if (!warningGiven) {
            console.log("Loading files from the server...");
            warningGiven = true;
        }
        return "../static/threejs/media/" + name;
    } else {
        if (files[name] != undefined) {
            if (mime[name.split(".")[1]] != undefined) {
                if (!warningGiven) {
                    console.log("Loading files from base64...");
                    warningGiven = true;
                }
                return "data:" + mime[name.split(".")[1]] + ";base64," + files[name];
            } else {
                console.error("'" + name.split(".")[1] + "' is not in your MIME mappings!")
            }
        } else {
            console.error("'" + name + "' is not encoded in your files.js!");
        }
    }
}
;