import Phaser from 'phaser';

const DEFAULT_ZOOM_MIN = 0.5;
const DEFAULT_ZOOM_MAX = 2;

export class CameraRig {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly camera: Phaser.Cameras.Scene2D.Camera,
    private readonly panSpeed: number,
    private readonly zoomMin = DEFAULT_ZOOM_MIN,
    private readonly zoomMax = DEFAULT_ZOOM_MAX,
  ) {
    scene.input.on(
      'wheel',
      (
        _pointer: Phaser.Input.Pointer,
        _gameObjects: unknown,
        _deltaX: number,
        deltaY: number,
      ) => {
        if (Math.abs(deltaY) < 0.001) return;
        const factor = deltaY > 0 ? 0.92 : 1.08;
        this.camera.zoom = Phaser.Math.Clamp(
          this.camera.zoom * factor,
          this.zoomMin,
          this.zoomMax,
        );
      },
    );
  }

  updatePanAxes(keys: {
    left: Phaser.Input.Keyboard.Key[];
    right: Phaser.Input.Keyboard.Key[];
    up: Phaser.Input.Keyboard.Key[];
    down: Phaser.Input.Keyboard.Key[];
  }): void {
    const cam = this.camera;
    const anyDown = (ks: Phaser.Input.Keyboard.Key[]) => ks.some((k) => k.isDown);
    if (anyDown(keys.left)) cam.scrollX -= this.panSpeed;
    if (anyDown(keys.right)) cam.scrollX += this.panSpeed;
    if (anyDown(keys.up)) cam.scrollY -= this.panSpeed;
    if (anyDown(keys.down)) cam.scrollY += this.panSpeed;
  }
}
