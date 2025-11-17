export const useCanvasDraw = () => {
  /**
   * Clears webgl canvas
   */
  const clearRect = (
    context: CanvasRenderingContext2D,
    xx: number = 0,
    yy: number = 0,
    width: number = 1024,
    height: number = 1024,
  ) => {
    context.clearRect(xx, yy, width, height);
  };

  /**
   * Draws filled rectangle into web gl canvas
   */
  const drawRect = (
    context: any,
    xx: number = 0,
    yy: number = 0,
    width: number = 50,
    height: number = 50,
    border: number = 1,
    fillStyle: string = '#FFCC00',
  ) => {
    if (border > 0) {
      context.fillStyle = '#000000';
      context.fillRect(xx, yy, width, height);
    }

    context.fillStyle = fillStyle;
    context.fillRect(
      xx + border,
      yy + border,
      width - border * 2,
      height - border * 2,
    );
  };

  /**
   * Draws image into web gl canvas
   */
  const drawImage = (
    context: CanvasRenderingContext2D,
    source: any,
    xx: number = 0,
    yy: number = 0,
    width: number = 50,
    height: number = 50,
  ) => {
    //context.drawImage(ReactLogo, 50, 50);
    var img = new Image();

    img.onload = () => {
      context.drawImage(img, xx, yy, width, height);
    };
    img.src = source;

    //REF for string SVG
    //let p = new Path2D('M10 10 h 80 v 80 h -80 Z');
    //context.fill(p);
  };

  /**
   * Draws line into web gl canvas
   */
  const drawLine = (
    context: CanvasRenderingContext2D,
    xx: number = 0,
    yy: number = 0,
    endXX: number = 50,
    endYY: number = 50,
  ) => {
    context.beginPath();
    context.moveTo(xx, yy);
    context.lineTo(endXX, endYY);
    context.stroke();
  };

  /**
   * Draws text into web gl canvas
   */
  const drawText = (
    context: CanvasRenderingContext2D,
    text: string = 'Text',
    xx: number = 0,
    yy: number = 0,
    maxWidth: number = 500,
  ) => {
    // Insert your canvas API code to draw an image
    context.fillStyle = 'rgb(0, 0, 0)';
    // context.font = '18px Arial';
    context.fillText(text, xx, yy, maxWidth);
  };

  /**
   * Returns width of text area required to render string
   */
  const getTextWidth = (context: CanvasRenderingContext2D, text: string) => {
    return context.measureText(text).width;
  };

  /**
   * Set font style of web gl canvas
   */
  const setFont = (
    context: CanvasRenderingContext2D,
    style: string = '18px Arial',
  ) => {
    context.font = style;
  };

  return {
    clearRect,
    drawImage,
    drawLine,
    drawRect,
    drawText,
    getTextWidth,
    setFont,
  };
};
