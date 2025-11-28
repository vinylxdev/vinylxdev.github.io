import { mat4 } from "gl-matrix";
import Program from "./program";
import { buildQuad } from "./utilities";
import Texture from "./texture";

export default class Skybox
{
  public glContext: any;
  public renderCanvas: any;
  public skyboxProgram: any;
  public skybox: any;
  public textures: any;

  constructor(skyboxSource: any, renderCanvas: any)
  {
    this.renderCanvas = renderCanvas;
    this.glContext = this.renderCanvas.getContext("webgl");
    this.glContext.pixelStorei(this.glContext.UNPACK_FLIP_Y_WEBGL, true);

    skyboxSource = skyboxSource.toString("utf-8");

    this.skyboxProgram = new Program(this.glContext, skyboxSource);
    this.skybox = buildQuad(this.glContext, this.skyboxProgram);
    this.textures = {};
  }

  setTextures(canvases: any): void
  {
    this.textures = {};
    let keys = Object.keys(canvases);

    for (let keyIndex = 0; keyIndex < keys.length; keyIndex++)
    {
      let canvas = canvases[keys[keyIndex]];

      this.textures[keys[keyIndex]] = new Texture(this.glContext, 0, canvas, canvas.width, canvas.height,
      {
        min: this.glContext.LINEAR_MIPMAP_LINEAR,
        mag: this.glContext.LINEAR,
      });
    }
  }

  render(view: any, projection: any): void
  {
    this.glContext.viewport(0, 0, this.renderCanvas.width, this.renderCanvas.height);

    let model = mat4.create();

    this.skyboxProgram.use();
    this.skyboxProgram.setUniform("uView", "Matrix4fv", false, view);
    this.skyboxProgram.setUniform("uProjection", "Matrix4fv", false, projection);

    this.textures.front.bind();
    this.skyboxProgram.setUniform("uModel", "Matrix4fv", false, model);
    this.skybox.render();

    this.textures.back.bind();
    mat4.rotateY(model, mat4.create(), Math.PI);
    this.skyboxProgram.setUniform("uModel", "Matrix4fv", false, model);
    this.skybox.render();

    this.textures.left.bind();
    mat4.rotateY(model, mat4.create(), Math.PI / 2);
    this.skyboxProgram.setUniform("uModel", "Matrix4fv", false, model);
    this.skybox.render();

    this.textures.right.bind();
    mat4.rotateY(model, mat4.create(), -Math.PI / 2);
    this.skyboxProgram.setUniform("uModel", "Matrix4fv", false, model);
    this.skybox.render();

    this.textures.top.bind();
    mat4.rotateX(model, mat4.create(), Math.PI / 2);
    this.skyboxProgram.setUniform("uModel", "Matrix4fv", false, model);
    this.skybox.render();

    this.textures.bottom.bind();
    mat4.rotateX(model, mat4.create(), -Math.PI / 2);
    this.skyboxProgram.setUniform("uModel", "Matrix4fv", false, model);
    this.skybox.render();
  }
};
