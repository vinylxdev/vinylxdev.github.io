import { vec3, mat4 } from "gl-matrix";
import Program from "./program";
import { buildAttributes, buildBox, buildStar, hashcode, randomRotation, randomVec3 } from "./utilities";
import Renderable from "./renderable";
import { RNG } from '@jacobbubu/rngmt'

export default class Space3D
{
  public starCount: any;
  public canvas: any;
  public glContext: any;
  public nebulaProgram: any;
  public nebulaRenderable: any;
  public pointStarsProgram: any;
  public pointStarsRenderable: any;
  public starProgram: any;
  public starRenderable: any;
  public sunProgram: any;
  public sunRenderable: any;

  constructor(nebula: any, pointStars: any, star: any, sun: any)
  {
    this.starCount = 100000;
    this.canvas = document.createElement("canvas");
    this.glContext = this.canvas.getContext("webgl");
    this.glContext.enable(this.glContext.BLEND);
    this.glContext.blendFuncSeparate(this.glContext.SRC_ALPHA, this.glContext.ONE_MINUS_SRC_ALPHA, this.glContext.ZERO, this.glContext.ONE);

    nebula = nebula.toString("utf-8");
    pointStars = pointStars.toString("utf-8");
    star = star.toString("utf-8");
    sun = sun.toString("utf-8");
    this.nebulaProgram = new Program(this.glContext, nebula,);
    this.pointStarsProgram = new Program(this.glContext, pointStars);
    this.starProgram = new Program(this.glContext, star);
    this.sunProgram = new Program(this.glContext, sun);

    let rand = new RNG(hashcode("best seed ever") + 5000);
    let position = new Float32Array(18 * this.starCount);
    let color = new Float32Array(18 * this.starCount);
    for (let starIndex = 0; starIndex < this.starCount; starIndex++)
    {
      let size = 0.05;
      let pos = vec3.random(vec3.create(), 1.0);

      star = buildStar(size, pos, 128.0, rand);
      position.set(star.position, starIndex * 18);
      color.set(star.color, starIndex * 18);
    }

    let attributes = buildAttributes(this.glContext, { aPosition: 3, aColor: 3 });
    attributes.aPosition.buffer.set(position);
    attributes.aColor.buffer.set(color);
    let count = position.length / 9;
    this.pointStarsRenderable = new Renderable(this.glContext, this.pointStarsProgram, attributes, count);

    this.nebulaRenderable = buildBox(this.glContext, this.nebulaProgram);
    this.sunRenderable = buildBox(this.glContext, this.sunProgram);
    this.starRenderable = buildBox(this.glContext, this.starProgram);
  }

  render(params: any): any
  {
    let textures: any = {};

    this.canvas.width = this.canvas.height = params.resolution;
    this.glContext.viewport(0, 0, params.resolution, params.resolution);

    let randomNumber = new RNG(hashcode(params.seed) + 1000);
    let pointStarParams = [];
    while (params.pointStars)
    {
      pointStarParams.push({ rotation: randomRotation(randomNumber) });

      if (randomNumber.random() < 0.2)
      {
        break;
      }
    }

    randomNumber = new RNG(hashcode(params.seed) + 3000);
    let starParams = [];
    while (params.stars)
    {
      starParams.push(
      {
        pos: randomVec3(randomNumber),
        color: [1, 1, 1],
        size: 0.0,
        falloff: randomNumber.random() * Math.pow(2, 20) + Math.pow(2, 20),
      });

      if (randomNumber.random() < 0.01)
      {
        break;
      }
    }

    randomNumber = new RNG(hashcode(params.seed) + 2000);
    let nebulaParams = [];
    while (params.nebulae)
    {
      nebulaParams.push(
      {
        scale: randomNumber.random() * 0.5 + 0.25,
        color: [randomNumber.random(), randomNumber.random(), randomNumber.random()],
        intensity: randomNumber.random() * 0.2 + 0.9,
        falloff: randomNumber.random() * 3.0 + 3.0,
        offset: [randomNumber.random() * 2000 - 1000, randomNumber.random() * 2000 - 1000, randomNumber.random() * 2000 - 1000],
      });

      if (randomNumber.random() < 0.5)
      {
        break;
      }
    }

    randomNumber = new RNG(hashcode(params.seed) + 4000);
    let sunParams = [];
    if (params.sun)
    {
      sunParams.push(
      {
        pos: randomVec3(randomNumber),
        color: [randomNumber.random(), randomNumber.random(), randomNumber.random()],
        size: randomNumber.random() * 0.0001 + 0.0001,
        falloff: randomNumber.random() * 16.0 + 8.0,
      });
    }

    let directions: any =
    {
      front:
      {
        target: [0, 0, -1],
        up: [0, 1, 0]
      },
      back:
      {
        target: [0, 0, 1],
        up: [0, 1, 0]
      },
      left:
      {
        target: [-1, 0, 0],
        up: [0, 1, 0]
      },
      right:
      {
        target: [1, 0, 0],
        up: [0, 1, 0]
      },
      top:
      {
        target: [0, 1, 0],
        up: [0, 0, 1]
      },
      bottom:
      {
        target: [0, -1, 0],
        up: [0, 0, -1]
      }
    };

    let model = mat4.create();
    let view = mat4.create();
    let projection = mat4.create();
    mat4.perspective(projection, Math.PI / 2, 1.0, 0.1, 256);

    let keys = Object.keys(directions);
    for (let keyIndex = 0; keyIndex < keys.length; keyIndex++)
    {
      this.glContext.clearColor(0, 0, 0, 1);
      this.glContext.clear(this.glContext.COLOR_BUFFER_BIT);

      let direction = directions[keys[keyIndex]];
      mat4.lookAt(view, [0, 0, 0], direction.target, direction.up);

      this.pointStarsProgram.use();
      model = mat4.create();
      this.pointStarsProgram.setUniform("uView", "Matrix4fv", false, view);
      this.pointStarsProgram.setUniform("uProjection", "Matrix4fv", false, projection);
      for (let pointStarsParamIndex = 0; pointStarsParamIndex < pointStarParams.length; pointStarsParamIndex++)
      {
        let pointStar = pointStarParams[pointStarsParamIndex];

        mat4.mul(model, pointStar.rotation, model);
        this.pointStarsProgram.setUniform("uModel", "Matrix4fv", false, model);
        this.pointStarsRenderable.render();
      }

      this.starProgram.use();
      this.starProgram.setUniform("uView", "Matrix4fv", false, view);
      this.starProgram.setUniform("uProjection", "Matrix4fv", false, projection);
      this.starProgram.setUniform("uModel", "Matrix4fv", false, model);
      for (let starParamIndex = 0; starParamIndex < starParams.length; starParamIndex++)
      {
        let star = starParams[starParamIndex];

        this.starProgram.setUniform("uPosition", "3fv", star.pos);
        this.starProgram.setUniform("uColor", "3fv", star.color);
        this.starProgram.setUniform("uSize", "1f", star.size);
        this.starProgram.setUniform("uFalloff", "1f", star.falloff);
        this.starRenderable.render();
      }

      this.nebulaProgram.use();
      model = mat4.create();
      for (let nebulaParamIndex = 0; nebulaParamIndex < nebulaParams.length; nebulaParamIndex++)
      {
        let nebula = nebulaParams[nebulaParamIndex];
        this.nebulaProgram.setUniform("uModel", "Matrix4fv", false, model);
        this.nebulaProgram.setUniform("uView", "Matrix4fv", false, view);
        this.nebulaProgram.setUniform("uProjection", "Matrix4fv", false, projection);
        this.nebulaProgram.setUniform("uScale", "1f", nebula.scale);
        this.nebulaProgram.setUniform("uColor", "3fv", nebula.color);
        this.nebulaProgram.setUniform("uIntensity", "1f", nebula.intensity);
        this.nebulaProgram.setUniform("uFalloff", "1f", nebula.falloff);
        this.nebulaProgram.setUniform("uOffset", "3fv", nebula.offset);
        this.nebulaRenderable.render();
      }

      this.sunProgram.use();
      this.sunProgram.setUniform("uView", "Matrix4fv", false, view);
      this.sunProgram.setUniform("uProjection", "Matrix4fv", false, projection);
      this.sunProgram.setUniform("uModel", "Matrix4fv", false, model);
      for (let sunParamIndex = 0; sunParamIndex < sunParams.length; sunParamIndex++)
      {
        let sun = sunParams[sunParamIndex];
        this.sunProgram.setUniform("uPosition", "3fv", sun.pos);
        this.sunProgram.setUniform("uColor", "3fv", sun.color);
        this.sunProgram.setUniform("uSize", "1f", sun.size);
        this.sunProgram.setUniform("uFalloff", "1f", sun.falloff);
        this.sunRenderable.render();
      }

      let canvas = document.createElement("canvas");
      canvas.width = canvas.height = params.resolution;
      let ctx = canvas.getContext("2d");
      if (ctx)
      {
        ctx.drawImage(this.canvas, 0, 0);
      }
      textures[keys[keyIndex]] = canvas;
    }

    return textures;
  }
};
