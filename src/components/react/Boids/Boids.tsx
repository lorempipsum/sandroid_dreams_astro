import React, { useRef, useEffect, useState } from 'react';
import styles from './Boids.module.scss';

const NUM_BOIDS = 100;
const BOID_SIZE = 5;
const MAX_FORCE = 0.2; // Max steering force

// Simple Vector class
class Vector {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(v: Vector) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  sub(v: Vector) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  mult(n: number) {
    this.x *= n;
    this.y *= n;
    return this;
  }

  div(n: number) {
    this.x /= n;
    this.y /= n;
    return this;
  }

  mag() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const m = this.mag();
    if (m > 0) {
      this.div(m);
    }
    return this;
  }

  limit(max: number) {
    if (this.mag() > max) {
      this.normalize().mult(max);
    }
    return this;
  }

  static sub(v1: Vector, v2: Vector): Vector {
    return new Vector(v1.x - v2.x, v1.y - v2.y);
  }

  static random2D(): Vector {
    const angle = Math.random() * Math.PI * 2;
    return new Vector(Math.cos(angle), Math.sin(angle));
  }
}

class Boid {
  position: Vector;
  velocity: Vector;
  acceleration: Vector;
  canvasWidth: number;
  canvasHeight: number;

  constructor(x: number, y: number, canvasWidth: number, canvasHeight: number) {
    this.position = new Vector(x, y);
    this.velocity = Vector.random2D().mult(Math.random() * 2 + 2); // Initial speed 2-4
    this.acceleration = new Vector();
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  applyForce(force: Vector) {
    this.acceleration.add(force);
  }

  edges() {
    if (this.position.x > this.canvasWidth) {
      this.position.x = 0;
    } else if (this.position.x < 0) {
      this.position.x = this.canvasWidth;
    }
    if (this.position.y > this.canvasHeight) {
      this.position.y = 0;
    } else if (this.position.y < 0) {
      this.position.y = this.canvasHeight;
    }
  }

  align(boids: Boid[], visionRadius: number): Vector {
    const steering = new Vector();
    let total = 0;
    for (const other of boids) {
      const d = Vector.sub(other.position, this.position).mag();
      if (other !== this && d < visionRadius) {
        steering.add(other.velocity);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.normalize();
      // steering.sub(this.velocity).limit(MAX_FORCE); // This was incorrect, should be applied after all forces
    }
    return steering;
  }

  cohesion(boids: Boid[], visionRadius: number): Vector {
    const steering = new Vector();
    let total = 0;
    for (const other of boids) {
      const d = Vector.sub(other.position, this.position).mag();
      if (other !== this && d < visionRadius) {
        steering.add(other.position);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.sub(this.position);
      steering.normalize();
      // steering.sub(this.velocity).limit(MAX_FORCE); // This was incorrect
    }
    return steering;
  }

  separate(boids: Boid[], separationDistance: number): Vector {
    const steering = new Vector();
    let total = 0;
    for (const other of boids) {
      const d = Vector.sub(this.position, other.position).mag();
      if (other !== this && d < separationDistance) {
        const diff = Vector.sub(this.position, other.position);
        diff.normalize().div(d || 1); // Weight by distance
        steering.add(diff);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.normalize();
      // steering.sub(this.velocity).limit(MAX_FORCE); // This was incorrect
    }
    return steering;
  }

  flock(boids: Boid[], separationForceFactor: number, alignmentForceFactor: number, cohesionForceFactor: number, separationDist: number, visionRad: number, maxSpeed: number) {
    const separation = this.separate(boids, separationDist).mult(separationForceFactor);
    const alignment = this.align(boids, visionRad).mult(alignmentForceFactor);
    const cohesion = this.cohesion(boids, visionRad).mult(cohesionForceFactor);

    this.applyForce(separation);
    this.applyForce(alignment);
    this.applyForce(cohesion);

    // After applying all forces, then adjust velocity
    this.velocity.add(this.acceleration);
    this.velocity.limit(maxSpeed); // Use maxSpeed parameter here
    this.position.add(this.velocity);
    this.acceleration.mult(0); // Reset acceleration
  }


  update(maxSpeed: number) { // maxSpeed is now passed to flock
    // this.velocity.add(this.acceleration);
    // this.velocity.limit(maxSpeed); // Use maxSpeed parameter here
    // this.position.add(this.velocity);
    // this.acceleration.mult(0); // Reset acceleration
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(Math.atan2(this.velocity.y, this.velocity.x));
    ctx.beginPath();
    ctx.moveTo(BOID_SIZE, 0);
    ctx.lineTo(-BOID_SIZE / 2, BOID_SIZE / 2);
    ctx.lineTo(-BOID_SIZE / 2, -BOID_SIZE / 2);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fill();
    ctx.restore();
  }
}


const Boids: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [speed, setSpeed] = useState(3); // Default speed
  const [visionRadius, setVisionRadius] = useState(50);
  const [separationDistance, setSeparationDistance] = useState(25); // Default separation
  const boidsRef = useRef<Boid[]>([]); // Ref to store boids array

  // Constants for force factors (can be made adjustable later if needed)
  const SEPARATION_FORCE = 1.5;
  const ALIGNMENT_FORCE = 1.0;
  const COHESION_FORCE = 1.0;


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const initializeBoids = (width: number, height: number) => {
      const newBoids = [];
      for (let i = 0; i < NUM_BOIDS; i++) {
        newBoids.push(new Boid(Math.random() * width, Math.random() * height, width, height));
      }
      boidsRef.current = newBoids;
    };

    // Resize canvas and re-initialize boids
    const resizeCanvasAndBoids = () => {
      if (canvas.parentElement) {
        const parentWidth = canvas.parentElement.clientWidth;
        const parentHeight = Math.max(300, canvas.parentElement.clientHeight - 100); // Ensure min height and space for controls
        canvas.width = parentWidth;
        canvas.height = parentHeight;
        initializeBoids(canvas.width, canvas.height);
      }
    };

    resizeCanvasAndBoids(); // Initial setup

    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      boidsRef.current.forEach(boid => {
        boid.canvasWidth = canvas.width; // Update canvas dimensions for boids
        boid.canvasHeight = canvas.height;
        boid.flock(boidsRef.current, SEPARATION_FORCE, ALIGNMENT_FORCE, COHESION_FORCE, separationDistance, visionRadius, speed);
        // boid.update(speed); // update is now part of flock
        boid.edges();
        boid.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate(); // Start animation

    window.addEventListener('resize', resizeCanvasAndBoids);

    return () => {
      window.removeEventListener('resize', resizeCanvasAndBoids);
      cancelAnimationFrame(animationFrameId);
    };
  }, [speed, visionRadius, separationDistance]); // Re-run effect if parameters change

  return (
    <div className={styles.boidsContainer}>
      <div className={styles.controlsPanel}>
        <div className={styles.controlItem}>
          <label htmlFor="speed">Speed: {speed}</label>
          <input
            type="range"
            id="speed"
            min="0.1"
            max="10"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
          />
        </div>
        <div className={styles.controlItem}>
          <label htmlFor="visionRadius">Vision Radius: {visionRadius}</label>
          <input
            type="range"
            id="visionRadius"
            min="10"
            max="200"
            step="1"
            value={visionRadius}
            onChange={(e) => setVisionRadius(parseInt(e.target.value, 10))}
          />
        </div>
        <div className={styles.controlItem}>
          <label htmlFor="separationDistance">Separation Distance: {separationDistance}</label>
          <input
            type="range"
            id="separationDistance"
            min="5"
            max="100"
            step="1"
            value={separationDistance}
            onChange={(e) => setSeparationDistance(parseInt(e.target.value, 10))}
          />
        </div>
      </div>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
};

export default Boids;
