function ParticleSystem(x, obj) {

  // SETUP CONSTANTS
  const _TWO_PI_ = Math.PI * 2;

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

  // SETUP PARTICLES
  this.fillStyle = obj.particle.color || "white";
  this.strokeStyle = obj.particle.stroke || "white";
  this.particleLineWidth = obj.particle.strokeWeight || 0;
  this.opacity = obj.particle.opacity.value || 1;
  this.deltaAlpha = obj.particle.opacity.opacityAnimationSpeed || 0;
  this.animateOpacity = obj.particle.opacity.opacityAnimationSpeed;
  this.linking = obj.linking.enabled;
  this.lineColor = obj.linking.lineColor || "white";
  this.lineWidth = obj.linking.lineWidth || 1;
  this.distance = (obj.linking.distance * obj.linking.distance) || 2500;

  // CREATE PARTICLES
  this.particles = [];

  for(let i = 0; i < obj.particle.number ; i++) {
    let direction = Math.random() * _TWO_PI_;
    this.particles.push(new Particle(
        Math.random() * this.canvas.width,
        Math.random() * this.canvas.height,
        obj.particle.random? obj.particle.size * Math.random(): obj.particle.size,
        obj.particle.random? Math.cos(direction) * obj.particle.velocity * Math.random() : Math.cos(direction) * obj.particle.velocity,
        obj.particle.random? Math.sin(direction) * obj.particle.velocity * Math.random() : Math.sin(direction) * obj.particle.velocity,
        (obj.particle.opacity.opacityAnimation? (obj.particle.random? Math.random() * 10 : obj.particle.opacity.value || 1) : obj.particle.opacity.value || 1)));
        console.log(this.particles[i]);
    }
  
  this.draw = function() {      

    // CLEAR CANVAS
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // IF LINKING ENABLED
    if(this.linking) {

      // SETUP CONTEXT FOR LINES
      this.context.strokeStyle = this.lineColor;
      this.context.lineWidth = this.lineWidth;

      for(let i = 0 ; i < this.particles.length ; i++) {
        let pi = this.particles[i];
        for(let j = 0 ; j < this.particles.length ; j++) {
          let pj = this.particles[j];
          let dis = Math.pow(pi.x - pj.x, 2) + Math.pow(pi.y - pj.y, 2);
          if(dis < this.distance && !pi.neighbours.includes(pj) && !pj.neighbours.includes(pi) && pi != pj) {
            // DRAW LINES AND UPDATE NEIGHBOURS
            this.context.beginPath();
            this.context.moveTo(pi.x, pi.y);
            this.context.lineTo(pj.x, pj.y);
            pi.neighbours.push(pj);
            pj.neighbours.push(pi);
            this.context.globalAlpha = _map_(dis, 0, this.distance, 1, 0);
            this.context.stroke();
          }
        }
      }
    }

    // SETUP CONTEXT FOR PARTICLES
    this.context.fillStyle = this.fillStyle;
    this.context.strokeStyle = this.strokeStyle;
    this.context.lineWidth = this.particleLineWidth;
    this.context.globalAlpha = this.opacity;

    for(let i = 0 ; i < this.particles.length ; i++) {
      
      let particle = this.particles[i];

      // SET ALPHA IF ANIMATED
      if(this.animateOpacity) {
        this.context.globalAlpha = _map_(1 + Math.sin(particle.alpha), 0, 2, 0, this.opacity); 
        particle.alpha += this.deltaAlpha;
      }

      // DRAW ELLIPSE AT POSITION
      this.context.beginPath();
      this.context.arc(particle.x, particle.y, particle.size, 0, _TWO_PI_);
      this.context.fill();
      if(this.particleLineWidth) this.context.stroke();
      
      // UPDATE POSITION
      particle.x = (this.canvas.width + particle.x + particle.vx) % this.canvas.width;
      particle.y = (this.canvas.height + particle.y + particle.vy) % this.canvas.height;
      
      //CLEAR ITS NEIGHBOR
      particle.neighbours = [];
    }
  }

  function Particle(x, y, size, vx, vy, alpha) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.vx = vx;
    this.vy = vy;
    this.alpha = alpha;
    this.neighbours = [];
  }

  function _map_( x,  u1,  v1,  u2,  v2) {
    return u2 + x / (v1 - u1) * (v2 - u2);
  }

  this.handler = new CustomEventHandler();
  this.handler.setAnimation(this);
  this.handler.startAnimation();
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