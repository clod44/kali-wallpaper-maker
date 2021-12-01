let c;
//^you don't have to specify this canvas name everytime you want to do something to it. just type out the function like background(0);
let pimg;
let lookupColors;

function setup() {
    pixelDensity(1);
    c = createCanvas(100,100);
    c.style("display","none");
    c.style("grid-area","preview-canvas");
}




const btnInitializeCanvas = document.getElementById("btnInitializeCanvas");
btnInitializeCanvas.addEventListener("click", constructPreviewCanvas);

function constructPreviewCanvas(){
    
    const outputResolution = [  int(document.getElementById("output-resolution-width").value),
                                int(document.getElementById("output-resolution-height").value)];

    const previewResolution =   [int(outputResolution[0]/100*document.getElementById("preview-resolution-width").value),
                                int(outputResolution[1]/100*document.getElementById("preview-resolution-width").value)];
    //!! ^pcanvas dimensions are not same as the preview image dimensions!!!! we will paste the image on pcanvas by stretching it out if necessary
    
    const holder = document.getElementById("sketch-container");
    //width and height multipliers. use the smallest one so we dont overshoot from container div
    const pcanvasSizeMultiplier = min(holder.offsetWidth/previewResolution[0],
                                      holder.offsetHeight/previewResolution[1]);

    //pcanvas is a dynamic sized preview canvas that has the wanted aspect ratio
    //pimg will be the actual preview rendering canvas which has the previewResolution sizes as its width and height. it will be stretched
    resizeCanvas(int(previewResolution[0]*pcanvasSizeMultiplier),
                int(previewResolution[1]*pcanvasSizeMultiplier));
    c.parent('sketch-container');
    c.background(0, 255, 0);
    c.style("display","unset");
    background(0,0,255);
    document.getElementById("process-part-1").style.display = "none";
    document.getElementById("process-part-2").style.display = "unset";

    readyToRender = true;
}



function generateBackground(resolution, willRender){

    pimg = createGraphics(resolution[0],resolution[1]);
    pimg.background(255,0,255);
    const bgR = document.getElementById("background-r").value;
    const bgG = document.getElementById("background-g").value;
    const bgB = document.getElementById("background-b").value;
    const bgColor = color(bgR, bgG, bgB);
    pimg.background(bgColor);
    const fgR = document.getElementById("foreground-r").value;
    const fgG = document.getElementById("foreground-g").value;
    const fgB = document.getElementById("foreground-b").value;
    const fgColor = color(fgR, fgG, fgB);
    
    const octaves = document.getElementById("noise-octaves").value;
    const falloff = document.getElementById("noise-falloff").value;
    const scale = document.getElementById("noise-scale").value;

    const noiseMap = generateNoiseMap(pimg, scale, octaves, falloff);

    function generateNoiseMap(canvas, scale, octaves, falloff){
        noiseDetail(octaves, falloff);
        const tempNoiseMap = new Array(canvas.width*canvas.height).fill(0);
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const index = x+y*canvas.width;
                const noiseVal = getNoise(x,y);;
                tempNoiseMap[index] = noiseVal;
            }
        }
        
        
        function getNoise(x,y){
            const noiseVal = noise(   (x / max(canvas.width,canvas.height)) *scale,
                                      (y / max(canvas.width,canvas.height)) *scale);

            return noiseVal*noiseVal;
        }
        
        background(255,0,0);
        return tempNoiseMap;
    }

    generateLookupColors(octaves, bgColor, fgColor);

    function generateLookupColors(octaves, bgColor, fgColor){
        const colorLookupQuality = int(document.getElementById("colorLookupQuality").value);
        const val1 = int(document.getElementById("foreground-val1").value) * octaves;
        const val2 = document.getElementById("foreground-val2").value;
        lookupColors = [];
        
        for (let noiseVal = 0; noiseVal < octaves*colorLookupQuality; noiseVal++) {    
            if(noiseVal % val1*colorLookupQuality < val2*colorLookupQuality){
                lookupColors.push(fgColor);
            }else{
                lookupColors.push(bgColor);    
            }   
        }
    }

    renderImage(noiseMap, pimg, willRender);
}






function renderImage(noiseMap, canvas, willRender){

    const colorLookupQuality = int(document.getElementById("colorLookupQuality").value);
    canvas.loadPixels();
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const noiseIndex = x + y * canvas.width; 
            const noiseVal = noiseMap[noiseIndex];
            canvas.set(x,y,lookupColors[int(noiseVal * colorLookupQuality)]);
        }
    }
    canvas.updatePixels();

    c.background(0,255,255);

    if(willRender){
        image(canvas, 0, 0, width, height);
    }else{
        window.open(canvas.canvas.toDataURL("image/png",
                                            int(document.getElementById("png-quality").value)));
    }
    
}




const btnGeneratePreviewImage = document.getElementById("btnGeneratePreviewImage");
btnGeneratePreviewImage.addEventListener("click",()=>{
    const outputResolution =    [int(document.getElementById("output-resolution-width").value),
                                int(document.getElementById("output-resolution-height").value)];
    const previewResolution =   [int(outputResolution[0]/100*document.getElementById("preview-resolution-width").value),
                                int(outputResolution[1]/100*document.getElementById("preview-resolution-width").value)];
    generateBackground(previewResolution, true);
});



const btnGenerateImage = document.getElementById("btnGenerateImage");
btnGenerateImage.addEventListener("click",()=>{
    const outputResolution =    [int(document.getElementById("output-resolution-width").value),
                                 int(document.getElementById("output-resolution-height").value)];
    generateBackground(outputResolution, false);
});






