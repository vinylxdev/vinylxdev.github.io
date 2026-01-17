import type { Route } from "./+types/application";
import React, { Component, type JSX } from "react";
import { mat4 } from "gl-matrix";
import Skybox from "~/space3d/skybox";
import Space3D from "~/space3d/space3D";

export function meta({}: Route.MetaArgs)
{
  return [
    { title: "Vinyl" },
    { name: "description", content: "Vinyl" },
  ];
}

interface IHeaderProps {}

interface IHeaderState
{
  pageData: any;
}

class App extends Component<IHeaderProps, IHeaderState>
{
  public fov: any;
  public pointStars: any;
  public seed: any;
  public stars: any;
  public sun: any;
  public nebulae: any;
  public resolution: any;
  public animationSpeed: any;
  public unifiedTexture: any;
  public renderCanvas: any;
  public tick: any;
  public skybox: any;
  public space: any;

  constructor(props: IHeaderProps)
  {
    super(props);

    this.fov = 60;
    this.fov = (this.fov / 360) * Math.PI * 2;
    this.pointStars = true;
    this.seed = (Math.random() * 1000000000000000000).toString(36);
    this.stars = true;
    this.sun = true;
    this.nebulae = true;
    this.resolution = 1024;
    this.animationSpeed = 0.015;
    this.unifiedTexture = true;
    
    this.tick = 0.0;

    this.renderSpace = this.renderSpace.bind(this);

    this.state =
    {
      pageData: {}
    }
  }

  componentDidMount(): void
  {
    this.renderCanvas = document.getElementById("render-canvas");
    this.renderCanvas.width = window.innerWidth;
    this.renderCanvas.height = window.innerHeight;

    let fetchShaders = async () =>
    {
      let nebulaResponse = await fetch("glsl/nebula.glsl");
      let nebula = await nebulaResponse.text();

      let pointStarsResponse = await fetch("glsl/point-stars.glsl");
      let pointStars = await pointStarsResponse.text();

      let skyboxResponse = await fetch("glsl/skybox.glsl");
      let skybox = await skyboxResponse.text();

      let starResponse = await fetch("glsl/star.glsl");
      let star = await starResponse.text();

      let sunResponse = await fetch("glsl/sun.glsl");
      let sun = await sunResponse.text();

      this.skybox = new Skybox(skybox, this.renderCanvas);
      this.space = new Space3D(nebula, pointStars, star, sun);

      this.renderTextures();
      this.renderSpace();
    }

    fetch("pageData.json")
      .then(response => response.text())
      .then(text => { this.setState({ pageData: JSON.parse(text) }) });

    fetchShaders();
  }

  hideUnified(): void
  {
    let texture = document.getElementById("texture-canvas");
    if (texture)
    {
      texture.style.display = "none";
    }
  }

  hideSplit(): void
  {
    let textureLeft = document.getElementById("texture-left");
    if (textureLeft)
    {
      textureLeft.style.display = "none";
    }
    let textureRight = document.getElementById("texture-right");
    if (textureRight)
    {
      textureRight.style.display = "none";
    }
    let textureTop = document.getElementById("texture-top");
    if (textureTop)
    {
      textureTop.style.display = "none";
    }
    let textureBottom = document.getElementById("texture-bottom");
    if (textureBottom)
    {
      textureBottom.style.display = "none";
    }
    let textureFront = document.getElementById("texture-front");
    if (textureFront)
    {
      textureFront.style.display = "none";
    }
    let textureBack = document.getElementById("texture-back");
    if (textureBack)
    {
      textureBack.style.display = "none";
    }
  }

  renderTextures(): void
  {
    let drawIndividual = (source: any, targetId: any) =>
    {
      let canvas = document.getElementById(targetId) as HTMLCanvasElement;
      if (canvas)
      {
        canvas.width = canvas.height = this.resolution;
        let ctx = canvas.getContext("2d");
        if (ctx)
        {
          ctx.drawImage(source, 0, 0);
        }
      }
    }

    let textures = this.space.render(
    {
      seed: this.seed,
      pointStars: this.pointStars,
      stars: this.stars,
      sun: this.sun,
      nebulae: this.nebulae,
      unifiedTexture: this.unifiedTexture,
      resolution: this.resolution,
    });
    this.skybox.setTextures(textures);

    let canvas = document.getElementById("texture-canvas") as HTMLCanvasElement;
    if (canvas)
    {
      canvas.width = 4 * this.resolution;
      canvas.height = 3 * this.resolution;
      let ctx = canvas.getContext("2d");
      if (ctx)
      {
        ctx.drawImage(textures.left, this.resolution * 0, this.resolution * 1);
        ctx.drawImage(textures.right, this.resolution * 2, this.resolution * 1);
        ctx.drawImage(textures.front, this.resolution * 1, this.resolution * 1);
        ctx.drawImage(textures.back, this.resolution * 3, this.resolution * 1);
        ctx.drawImage(textures.top, this.resolution * 1, this.resolution * 0);
        ctx.drawImage(textures.bottom, this.resolution * 1, this.resolution * 2);
      }
    }

    drawIndividual(textures.left, "texture-left");
    drawIndividual(textures.right, "texture-right");
    drawIndividual(textures.front, "texture-front");
    drawIndividual(textures.back, "texture-back");
    drawIndividual(textures.top, "texture-top");
    drawIndividual(textures.bottom, "texture-bottom");
  }

  renderSpace(): void
  {
    this.hideUnified();
    this.hideSplit();

    this.tick += 0.0025 * this.animationSpeed;

    let view = mat4.create();
    let projection = mat4.create();

    this.renderCanvas.width = window.innerWidth;
    this.renderCanvas.height = window.innerHeight;

    mat4.lookAt(view, [0, 0, 0], [Math.cos(this.tick), Math.sin(this.tick * 0.555), Math.sin(this.tick)], [0, 1, 0]);

    mat4.perspective(projection, this.fov, this.renderCanvas.width / this.renderCanvas.height, 0.1, 8);

    this.skybox.render(view, projection);

    requestAnimationFrame(this.renderSpace)
  }

  getLinks(): any
  {
    let elements = [];

    for (let socialLink in this.state.pageData.socialLinks)
    {
      elements.push(
        <a key={this.state.pageData.socialLinks[socialLink].name} href={this.state.pageData.socialLinks[socialLink].url} target="_blank" rel="noopener noreferrer">
          <img src={"assets/" + this.state.pageData.socialLinks[socialLink].logo} alt={this.state.pageData.socialLinks[socialLink].name} />
        </a>
      );
    }

    return elements;
  }

  render(): JSX.Element
  {
    return (
      <div id="App">
        <div id="information">
          <p>{this.state.pageData.pageTitle}</p>
          <div id="links">
            {this.getLinks()}
          </div>
        </div>

        <canvas id="render-canvas"></canvas>
        <canvas id="texture-canvas"></canvas>

        <canvas id="texture-left" className="texture"></canvas>
        <canvas id="texture-right" className="texture"></canvas>
        <canvas id="texture-top" className="texture"></canvas>
        <canvas id="texture-bottom" className="texture"></canvas>
        <canvas id="texture-front" className="texture"></canvas>
        <canvas id="texture-back" className="texture"></canvas>
      </div>
    );
  }
};

export default function Application()
{
  return (
    <App />
  );
}
