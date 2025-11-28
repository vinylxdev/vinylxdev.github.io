import { vec3, mat4, quat } from "gl-matrix";
import GLBuffer from "./glBuffer";
import Renderable from "./renderable";

export function buildAttributes(glContext: any, layout: any): any
{
  let attributes: any = {};

  for (let key in layout)
  {
    attributes[key] = { buffer: new GLBuffer(glContext), size: layout[key] };
  }

  return attributes;
}

export function getExtensions(glContext: any, extensionArray: any): any
{
  let extensions: any = {};

  for (let extensionIndex = 0; extensionIndex < extensionArray.length; extensionIndex++)
  {
    let extension = glContext.getExtension(extensionArray[extensionIndex]);

    if (extension === null)
    {
      throw Error("Extension " + extensionArray[extensionIndex] + "not available.");
    }

    extensions[extensionArray[extensionIndex]] = extension;
  }

  return extensions;
}

export function buildQuad(glContext: any, program: any): any
{
  let position =
  [
    -1, -1, -1,
    1, -1, -1,
    1, 1, -1,
    -1, -1, -1,
    1, 1, -1,
    -1, 1, -1,
  ];

  let uv =
  [
    0, 0,
    1, 0,
    1, 1,
    0, 0,
    1, 1,
    0, 1
  ];

  let attributes = buildAttributes(glContext, { aPosition: 3, aUV: 2 });

  attributes.aPosition.buffer.set(new Float32Array(position));
  attributes.aUV.buffer.set(new Float32Array(uv));

  let count = position.length / 9;
  let renderable = new Renderable(glContext, program, attributes, count);

  return renderable;
}

export function buildStar(size: any, pos: any, dist: any, rand: any): any
{
  let c = Math.pow(rand.random(), 4.0);
  let color =
  [
    c, c, c,
    c, c, c,
    c, c, c,
    c, c, c,
    c, c, c,
    c, c, c
  ];

  let vertices =
  [
    [-size, -size, 0],
    [size, -size, 0],
    [size, size, 0],
    [-size, -size, 0],
    [size, size, 0],
    [-size, size, 0]
  ];

  let position: any = [];

  for (let ii = 0; ii < 6; ii++)
  {
    let rot = quatRotFromForward(pos);
    vec3.transformQuat(vertices[ii], vertices[ii], rot);
    vertices[ii][0] += pos[0] * dist;
    vertices[ii][1] += pos[1] * dist;
    vertices[ii][2] += pos[2] * dist;
    position.push.apply(position, vertices[ii]);
  }

  return {
    position: position,
    color: color
  };
}

export function buildBox(glContext: WebGLRenderingContext, program: any): any
{
  let position =
  [
    -1, -1, -1,
    1, -1, -1,
    1, 1, -1,
    -1, -1, -1,
    1, 1, -1,
    -1, 1, -1,

    1, -1, 1,
    -1, -1, 1,
    -1, 1, 1,
    1, -1, 1,
    -1, 1, 1,
    1, 1, 1,

    1, -1, -1,
    1, -1, 1,
    1, 1, 1,
    1, -1, -1,
    1, 1, 1,
    1, 1, -1,

    -1, -1, 1,
    -1, -1, -1,
    -1, 1, -1,
    -1, -1, 1,
    -1, 1, -1,
    -1, 1, 1,

    -1, 1, -1,
    1, 1, -1,
    1, 1, 1,
    -1, 1, -1,
    1, 1, 1,
    -1, 1, 1,

    -1, -1, 1,
    1, -1, 1,
    1, -1, -1,
    -1, -1, 1,
    1, -1, -1,
    -1, -1, -1
  ];

  let attribs = buildAttributes(glContext, { aPosition: 3 });
  attribs.aPosition.buffer.set(new Float32Array(position));
  let count = position.length / 9;
  let renderable = new Renderable(glContext, program, attribs, count);

  return renderable;
}

export function quatRotBetweenVecs(a: any, b: any): any
{
  let theta = Math.acos(vec3.dot(a, b));
  let omega = vec3.create();
  vec3.cross(omega, a, b);
  vec3.normalize(omega, omega);
  let rot = quat.create();
  quat.setAxisAngle(rot, omega, theta);

  return rot;
}

export function quatRotFromForward(b: any): any
{
  return quatRotBetweenVecs(vec3.fromValues(0, 0, -1), b);
}

export function randomRotation(rand: any): any
{
  let rot = mat4.create();
  mat4.rotateX(rot, rot, rand.random() * Math.PI * 2);
  mat4.rotateY(rot, rot, rand.random() * Math.PI * 2);
  mat4.rotateZ(rot, rot, rand.random() * Math.PI * 2);
  return rot;
}

export function randomVec3(rand: any): any
{
  let v = [0, 0, 1];
  let rot = randomRotation(rand);
  vec3.transformMat4(v, v, rot);
  vec3.normalize(v, v);
  return v;
}

export function hashcode(str: any): any
{
  let hash = 0;
  for (let i = 0; i < str.length; i++)
  {
    let char = str.charCodeAt(i);
    hash += (i + 1) * char;
  }
  return hash;
}
