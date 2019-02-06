const _TWO_PI_ = Math.PI * 2;
function ParticleSystem(x, obj = {
  "particle" : {
    "number": 1
  }
}) {

  // SETUP CANVAS AND PARENT

  this.canvas = document.createElement("canvas");   
  this.canvas.width = x.offsetWidth;
  this.canvas.height = x.offsetHeight;
  this.canvas.style.position = "absolute";
  this.canvas.style.top = "0";
  this.canvas.style.left = "0";
  this.context = this.canvas.getContext("2d");
  this.parent = x;
  this.parent.appendChild(this.canvas);

  // SINGLE PARTICLE FOR TRACKING MOUSE

  this.mouse = new Particle(0, 0, 0, 0, 0, 0);

  // CLOSURE TO ASSIGN EVENT HANDLER TO CANVAS
  function mouseUpdate(x) {
    let self = x;
    self.canvas.addEventListener("mousemove", function(e) {
    self.mouse.x = e.clientX;
    self.mouse.y = e.clientY;
    });
  }
  mouseUpdate(this);

  // SETUP PARTICLES
  // ALSO SET DEFAULTS IF NOT PASSED

  let particleProperties = obj.hasOwnProperty("particle")? obj.particle :  {};
  this.numParticles = assigner(particleProperties, "number",  50);                    // CREATES 50 PARTICLE BY DEFAULT
  this.fillStyle = assigner(particleProperties, "color",  "black");                    // PARTICLE FILL COLOR
  this.strokeStyle = assigner(particleProperties, "stroke",  "white");                 // PARTICLE STROKE COLOR
  this.particleLineWidth = assigner(particleProperties, "strokeWeight",  0);    // PARTICLE STROKE COLOR
  this.collision = assigner(particleProperties, "collision",  "wrap");             // BOUNDARY COLLISION (WRAP/REFLECT)

  // PARTICLE DISPLAY DEFAULTS
  let displayProperties = assigner(particleProperties, "display",  {});
  this.randomSize = assigner(displayProperties, "random",  false);           // CONTROLS RANDOM SIZE
  this.particleSize = assigner(displayProperties, "size",  4);                // PARTICLE SIZE

  // PARTICLE VELOCITY DEFAULTS
  // SET RANDOM DIRECTION AS DEFAULT
  let velocityProperties = assigner(particleProperties, "velocity",  {});
  this.velocityDirection = assigner(velocityProperties, "direction",  "random");
  this.velocityRandom = assigner(velocityProperties, "random",  false);
  this.velocityValue = assigner(velocityProperties, "value",  5);
  this.velocityX = assigner(velocityProperties, "x",  5);
  this.velocityY = assigner(velocityProperties, "y",  5);
  this.maxVelocity = 10;

  // PARTICLE OPACITY DEFAULTS
  let opacityProperties = assigner(particleProperties, "opacity", {});
  this.opacity = assigner(opacityProperties, "value", 1);  // PARTICLE OPACITY
  this.deltaAlpha = assigner(opacityProperties, "speed", 0.1); // RATE OF CHANGE OF OPACITY
  this.animateOpacity = assigner(opacityProperties, "animate", false);    // OPACITY ANIMATION ENABLE
  this.randomOpacity = assigner(opacityProperties, "random", false);
  
  //LINKING DEFAULTS
  let linkingProperties = assigner(obj, "linking", {});
  this.linking = assigner(linkingProperties, "enabled", false);
  this.lineColor = assigner(linkingProperties, "color", "black");
  this.lineWidth = assigner(linkingProperties, "width", 1);
  this.distance = assigner(linkingProperties, "distance", 50);
  this.mouseLinking = assigner(linkingProperties, "mouseLinking", false);
  this.distance *= this.distance;
  

  // INTERACTIVITY DEFAULTS
  let interactivityProperties = assigner(obj, "interaction", {});

  // INTERACTIVITY MOUSEMOVE
  let mouseMoveProperties = assigner(interactivityProperties, "mousemove", {});
  this.mousemove = {
    "enabled": assigner(mouseMoveProperties, "enabled", false),
    "force": assigner(mouseMoveProperties, "force", 100),
    "radius": assigner(mouseMoveProperties, "radius", 100)
  };

  // CREATE PARTICLES
  this.particles = [];
  this.particles.push(this.mouse);

  for(let i = 0; i < this.numParticles ; i++) {
    let direction = Math.random() * Math.PI * 2;
    this.particles.push(new Particle(
        //X POS  
        Math.random() * this.canvas.width,
        // Y POS
        Math.random() * this.canvas.height,
        // SIZE
        this.randomSize? this.particleSize * Math.random(): this.particleSize,
        // X VELOCITY
        this.velocityDirection === "random"? (this.velocityRandom? Math.cos(direction) * Math.random() * this.velocityValue : this.velocityValue * Math.cos(direction)) : (this.velocityRandom? this.velocityX * Math.random() : this.velocityX),
        // Y VELOCITY
        this.velocityDirection === "random"? (this.velocityRandom? Math.sin(direction) * Math.random() * this.velocityValue : this.velocityValue * Math.sin(direction)) : (this.velocityRandom? this.velocityY * Math.random() : this.velocityY),
        // INITIAL OPACITY
        this.animateOpacity? (this.randomOpacity? Math.random() * 10 : this.opacity) : (this.randomOpacity? this.opacity * Math.random() : this.opacity)));
    }
  this.createDraw = function() {
    let drawString = "";
    drawString += "this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);\n"; // CLEAR CANVAS
    if(this.linking) {
      let start = 1;
      if(this.mouseLinking) start = 0;
      drawString +=`
      this.context.strokeStyle = this.lineColor;
      this.context.lineWidth = this.lineWidth;
      for(let i = ${start} ; i < this.particles.length ; i++) {
        let pi = this.particles[i];
        for(let j = ${start}; j < this.particles.length ; j++) {
          let pj = this.particles[j];
          let dis = Math.pow(pi.x - pj.x, 2) + Math.pow(pi.y - pj.y, 2);
          if(dis < this.distance && !pi.neighbours.includes(pj) && !pj.neighbours.includes(pi) && pi != pj) {
            this.context.beginPath();
            this.context.moveTo(pi.x, pi.y);
            this.context.lineTo(pj.x, pj.y);
            pi.neighbours.push(pj);
            pj.neighbours.push(pi);
            this.context.globalAlpha = this._map_(dis, 0, this.distance, 1, 0);
            this.context.stroke();
          }
        }
      }`;

      drawString += `
      ${this.fillStyle === "random"? "" : "this.context.fillStyle = this.fillStyle;"}
      ${this.strokeStyle === "random"? "" : "this.context.strokeStyle = this.strokeStyle;"}
      ${this.animateOpacity? "" : "this.context.globalAlpha = this.opacity;"}
      this.context.lineWidth = this.particleLineWidth;`;

    } else {
      this.context.fillStyle = this.fillStyle;
      this.context.strokeStyle = this.strokeStyle;
      this.context.lineWidth = this.particleLineWidth;
      this.context.globalAlpha = this.opacity;
    }

    drawString += `    
    for(let i = 1 ; i < this.particles.length ; i++) {  
      let particle = this.particles[i];`;

    if(this.fillStyle == "random") drawString += `
      this.context.fillStyle = particle.color;`;
    if(this.strokeStyle == "random") drawString += `
      this.context.strokeStyle = particle.strokeColor;`;

    if(this.animateOpacity) {
      drawString += `
      this.context.globalAlpha = this._map_(1 + Math.sin(particle.alpha), 0, 2, 0, this.opacity); 
      particle.alpha += this.deltaAlpha;`;
    }

    if(this.randomOpacity) {
      drawString += `this.context.globalAlpha = particle.alpha;`
    }

    drawString += `      
      this.context.beginPath();
      this.context.arc(particle.x, particle.y, particle.size, 0, _TWO_PI_);
      this.context.fill();`;

    if(this.particleLineWidth) drawString += `this.context.stroke();`;
    
    if(this.mousemove.enabled) {
      drawString += `
      let dx = particle.x - this.mouse.x;
      let dy = particle.y - this.mouse.y;
      
      let dis = dx * dx + dy * dy;
      let mag = Math.sqrt(dis);
      if(mag < this.mousemove.radius) {
        dx /= mag;
        dy /= mag;
        if(dis < 50) dis = 50;
        particle.vx += this.mousemove.force * dx / dis;
        particle.vy += this.mousemove.force * dy / dis;
        
        let magVec = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        if(magVec > this.maxVelocity) { 
          particle.vx *= 0.5;
          particle.vy *= 0.5;
        }
      }`;
    }
    
    if(this.collision == "reflect") {
      drawString += `
      particle.x += particle.vx; if(particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
      particle.y += particle.vy; if(particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;`;
    } else {
      drawString += `
      particle.x = (this.canvas.width + particle.x + particle.vx) % this.canvas.width; 
      particle.y = (this.canvas.height + particle.y + particle.vy) % this.canvas.height;`;
    }

    if(this.linking) drawString += `particle.neighbours = []; this.mouse.neighbours = [];`; 
    drawString += "this.mouse.neighbours = []}";
    this.draw = Function(drawString);
  }
  
  this.draw = null;
  this.createDraw();

  function Particle(x, y, size, vx, vy, alpha) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.vx = vx;
    this.vy = vy;
    this.mag = Math.sqrt(vx * vx + vy * vy);
    this.alpha = alpha;
    this.neighbours = [];
    this.color = "hsl(" + Math.random() * 255 + ", 100%, 50%)";
    this.strokeColor = "hsl(" + Math.random() * 255 + ", 100%, 50%)";
  }

  this._map_ = function( x,  u1,  v1,  u2,  v2) {
    return u2 + x / (v1 - u1) * (v2 - u2);
  }


  this.handler = new CustomEventHandler();
  this.handler.setAnimation(this);
  this.handler.startAnimation();

  function assigner(target, tValue, def) {
    return target.hasOwnProperty(tValue)? target[tValue] : def;
  }
}




/* ANIMATION HANDLER */
function CustomEventHandler() {
  this.aCount = 0;
  this.activities = [];
  this.cycle = false;
  this.timer = null;
  this.animation = null;
  this.frameRequest = null;
  
  this.setActivities = function(act) {
    this.activities = act;
  }
  
  this.startActivities = function() {
    function dispatcher(x) {  
       x.timer = setInterval(function() {
        if(!x.activities[x.aCount].name()) {
          if(x.cycle) x.aCount = (x.aCount + 1) % x.activities.length;
          else if(x.aCount < x.activities.length - 1) x.aCount++;
          else clearInterval(x.timer);
        }
      }, x.activities[x.aCount].delay)
    }
    dispatcher(this);
  }
  
  this.stopActivities = function() {
    clearInterval(this.timer);
  }
  
  this.objs = this;
  this.startAnimation = null;
  this.setAnimation = function(x) {
    if(typeof(x) === "object") {
      this.startAnimation = function() {
        self = this;
        self.objs = x;
        self.objs.draw(); 
        self.frameRequest = window.requestAnimationFrame(() => self.startAnimation());
      }
    } else {
      this.startAnimation = function() {
        var self = this;
        self.animation(); 
        self.frameRequest = window.requestAnimationFrame(() => self.startAnimation());
      }
      this.animation = x;
    }
  }
  
  this.stopAnimation = function() {
    window.cancelAnimationFrame(this.frameRequest);
  }
}