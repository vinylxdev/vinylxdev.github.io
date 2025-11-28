export default class Program 
{
  public glContext: any;
  public source: any;
  public program: any;
  public attributes: any;
  public uniforms: any;

  constructor(glContext: any, source: any) {
    this.glContext = glContext;

    this.source = source;
    this.source = this.source.split("__split__");

    this.program = this.compileProgram(this.source[0], this.source[1]);
    this.attributes = this.gatherAttribs();
    this.uniforms = this.gatherUniforms();
  }

  use(): void
  {
    this.glContext.useProgram(this.program);
  }

  compileProgram(vertexSource: any, fragmentSource: any): any
  {
    let vertexShader = this.compileShader(vertexSource, this.glContext.VERTEX_SHADER);
    let fragmentShader = this.compileShader(fragmentSource, this.glContext.FRAGMENT_SHADER);
    let program = this.glContext.createProgram();

    this.glContext.attachShader(program, vertexShader);
    this.glContext.attachShader(program, fragmentShader);
    this.glContext.linkProgram(program);

    if (!this.glContext.getProgramParameter(program, this.glContext.LINK_STATUS))
    {
      console.error(this.glContext.getProgramInfoLog(program));
      throw new Error("Failed to compile program.");
    }

    return program;
  }

  compileShader(source: any, type: any): any
  {
    let shader = this.glContext.createShader(type);

    this.glContext.shaderSource(shader, source);
    this.glContext.compileShader(shader);

    if (!this.glContext.getShaderParameter(shader, this.glContext.COMPILE_STATUS))
    {
      let error = this.glContext.getShaderInfoLog(shader);
      let lineNumber = parseInt(error.split(":")[2]);
      let split = source.split("\n");

      for (let errorIndex in split)
      {
        let errorNumber = parseInt(errorIndex);

        console.error(errorNumber + "  " + split[errorIndex]);
        if (parseInt(errorIndex) === lineNumber - 1)
        {
          console.error(error);
        }
      }

      let typeString = type === this.glContext.VERTEX_SHADER ? "vertex" : "fragment";
      throw Error("Failed to compile " + typeString + " shader.");
    }

    return shader;
  }

  setUniform(name: any, type: any, value: any): void
  {
    let args = Array.prototype.slice.call(arguments, 2);
    let location;

    this.use(); // Make this idempotent. At the context level, perhaps?

    try
    {
      location = this.uniforms[name].location;
    }
    catch (exception)
    {
      console.error(name);
      throw exception;
    }

    this.glContext["uniform" + type].apply(this.glContext, [location].concat(args));
  }

  gatherUniforms(): any
  {
    let uniforms: any = {};
    let nUniforms = this.glContext.getProgramParameter(this.program, this.glContext.ACTIVE_UNIFORMS);

    for (let uniformIndex = 0; uniformIndex < nUniforms; uniformIndex++)
    {
      let uniform = this.glContext.getActiveUniform(this.program, uniformIndex);

      uniforms[uniform.name] =
      {
        name: uniform.name,
        location: this.glContext.getUniformLocation(this.program, uniform.name),
        type: uniform.type,
        size: uniform.size
      };
    }

    return uniforms;
  }

  gatherAttribs(): any
  {
    let attribs: any = {};
    let nAttribs = this.glContext.getProgramParameter(this.program, this.glContext.ACTIVE_ATTRIBUTES);

    for (let attributeIndex = 0; attributeIndex < nAttribs; attributeIndex++)
    {
      let attrib = this.glContext.getActiveAttrib(this.program, attributeIndex);

      attribs[attrib.name] =
      {
        name: attrib.name,
        location: this.glContext.getAttribLocation(this.program, attrib.name),
        type: attrib.type,
        size: attrib.size
      };
    }

    return attribs;
  }
}
