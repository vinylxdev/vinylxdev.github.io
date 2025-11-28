export default class GLBuffer
{
  public glContext: any;
  public buffer: any;

  constructor(glContext: any)
  {
    this.glContext = glContext;
    this.buffer = this.glContext.createBuffer();
  }

  bind(): void
  {
    this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, this.buffer);
  }

  set(data: any): void
  {
    this.bind();

    this.glContext.bufferData(this.glContext.ARRAY_BUFFER, data, this.glContext.STATIC_DRAW);
  }
};
