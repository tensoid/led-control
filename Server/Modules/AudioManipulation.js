module.exports = class Reshaper {
  constructor(){
    this.cache = [];

    // Kick Detection
    this.peaked = false;
    this.currentColor = {r: 255, g: 0, b: 0};

    // Random Color
    this.goldenRatio = 0.618033988749895;
    this.h = Math.random();
  }

  next(data, bassData, size, profile, brightness){

    let uneven = size % 2 != 0;
    if(uneven) size++; // make sure size is even

    data *= profile.amplitudeMul; 

    // check for kick
    if(bassData >= profile.kickDetectThreshold && !this.peaked){
      this.peaked = true;
      this.currentColor = this.getRandomColor();
    }
    else if(bassData < profile.kickDetectThreshold && this.peaked){
      this.peaked = false;
    }


    // volume visualizer
    data = Array(size/2).fill(data);

    let minToLowMulFinal = (1/size) * profile.minToLowMul;

    for(let i = 0; i < data.length; i++){
      data[i] -= minToLowMulFinal*i; 
      if(data[i] < 0) data[i] = 0;
    }
    
    // slow build down
    if(this.cache.length != 0){
      for(let i = 0; i < data.length; i++){
        let diff = this.cache[i] - data[i];
        if(diff > 0) data[i] = this.cache[i] - (diff * profile.builddownMul);
        if(data[i] < 0) data[i] = 0;
      }
    }

    
    this.cache = [...data]; 
    

    //transform to rgb
    for(let i = 0; i < data.length; i++){

      //let col = this.interpolateRGB(profile.baseColor, profile.peakColor, data[i] > 1 ? 1 : data[i]);
      let col = this.interpolateRGB({r: 0, g: 0, b: 0}, this.currentColor, data[i] > 1 ? 1 : data[i]);

      data[i] = [col.r, col.g, col.b];

      //apply brightness
      data[i] = data[i].map(d => d * (brightness / 100));
    }
    
    
    // mirror
    data.reverse();
    data.push(...[...data].reverse());

    // remove middle led to account for adding one prior
    if(uneven) data.splice(data.length/2, 1); 
    
    return data;
  }

  interpolateRGB(baseColor, peakColor, amount){
    let newR = baseColor.r + (peakColor.r - baseColor.r) * amount;
    let newG = baseColor.g + (peakColor.g - baseColor.g) * amount;
    let newB = baseColor.b + (peakColor.b - baseColor.b) * amount;
  
    return {r: newR, g: newG, b: newB};
  }

  hsl2rgb(h,s,l){
    h *= 360;
    let a=s*Math.min(l,1-l);
    let f= (n,k=(n+h/30)%12) => (l - a*Math.max(Math.min(k-3,9-k,1),-1))*255;
    return {r: f(0), g: f(8), b: f(4)};
  } 

  getRandomColor(){
    this.h += this.goldenRatio;
    this.h %= 1;
    return this.hsl2rgb(this.h, 1, 0.5);
  }
}