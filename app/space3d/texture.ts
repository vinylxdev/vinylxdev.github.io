export default class Texture
{
  public glContext: any;
  public index: any;
  public data: any;
  public width: any;
  public height: any;
  public options: any;
  public texture: any;

  constructor(glContext: any, index: any, data: any, width: any, height: any, options: any)
  {
    this.glContext = glContext;
    this.index = index;
    this.data = data;
    this.width = width;
    this.height = height;

    this.options = options || {};
    this.options.target = options.target || this.glContext.TEXTURE_2D;
    this.options.mag = options.mag || this.glContext.NEAREST;
    this.options.min = options.min || this.glContext.NEAREST;
    this.options.wraps = options.wraps || this.glContext.CLAMP_TO_EDGE;
    this.options.wrapt = options.wrapt || this.glContext.CLAMP_TO_EDGE;
    this.options.internalFormat = options.internalFormat || this.glContext.RGBA;
    this.options.format = options.format || this.glContext.RGBA;
    this.options.type = options.type || this.glContext.UNSIGNED_BYTE;
    
    this.activate();
    this.texture = this.glContext.createTexture();
    this.bind();

    this.glContext.texImage2D(this.options.target, 0, this.options.internalFormat, this.options.format, this.options.type, data);
    this.glContext.texParameteri(this.options.target, this.glContext.TEXTURE_MAG_FILTER, this.options.mag);
    this.glContext.texParameteri(this.options.target, this.glContext.TEXTURE_MIN_FILTER, this.options.min);
    this.glContext.texParameteri(this.options.target, this.glContext.TEXTURE_WRAP_S, this.options.wraps);
    this.glContext.texParameteri(this.options.target, this.glContext.TEXTURE_WRAP_T, this.options.wrapt);

    if (this.options.mag !== this.glContext.NEAREST || this.options.min !== this.glContext.NEAREST)
    {
      this.glContext.generateMipmap(this.options.target);
    }
  }

  activate(): void
  {
    this.glContext.activeTexture(this.glContext.TEXTURE0 + this.index);
  }

  bind(): void
  {
    this.glContext.bindTexture(this.options.target, this.texture);
  }

  reset(): void
  {
    this.activate();
    this.bind();
    
    this.glContext = this.glContext.texImage2D(this.options.target, 0, this.options.internalFormat, this.width, this.height,
                                               0, this.options.format, this.options.type, this.data);
  }
};
