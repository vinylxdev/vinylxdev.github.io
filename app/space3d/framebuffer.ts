export default class Framebuffer
{
  public glContext: any;
  public color: any;
  public depth: any;
  public extensions: any;
  public framebuffer: any;

  constructor(glContext: any, color: any, depth: any, extensions: any)
  {
    this.glContext = glContext;
    this.color = color;
    this.depth = depth;
    this.extensions = extensions;
    this.framebuffer = this.glContext.createFramebuffer();

    this.bind();

    if (this.color.length > 1)
    {
      let drawBuffers = [];

      for (let colorIndex = 0; colorIndex < this.color.length; colorIndex++)
      {
        drawBuffers.push(this.extensions["COLOR_ATTACHMENT" + colorIndex + "_WEBGL"]);
      }

      this.extensions.drawBuffersWEBGL(drawBuffers);

      for (let colorIndex = 0; colorIndex < this.color.length; colorIndex++)
      {
        this.glContext.framebufferTexture2D(this.glContext.FRAMEBUFFER, this.extensions["COLOR_ATTACHMENT" + colorIndex + "_WEBGL"],
                                            this.glContext.TEXTURE_2D, this.color[colorIndex].texture, 0);
      }
    }
    else
    {
      this.glContext.framebufferTexture2D(this.glContext.FRAMEBUFFER, this.glContext.COLOR_ATTACHMENT0, this.glContext.TEXTURE_2D, this.color[0].texture, 0);
    }

    if (this.depth !== undefined)
    {
      this.glContext.framebufferTexture2D(this.glContext.FRAMEBUFFER, this.glContext.DEPTH_ATTACHMENT, this.glContext.TEXTURE_2D, this.depth.texture, 0);
    }
  }

  bind(): void
  {
    this.glContext.bindFramebuffer(this.glContext.FRAMEBUFFER, this.framebuffer);
  }
};
