/**
 * This simple object, used to represent a console window, is just a helper
 * class to make it easy to store functions for activating and deactivating
 * the console's event listeners, as well as centering the window.
 */
export class ConsoleWindow {
  private _connectionId: string;
  private _activate: () => void;
  private _deactivate: () => void;
  private _center: () => void;

  constructor(
    connectionId: string,
    activate: () => void,
    deactivate: () => void,
    center: () => void,
  ) {
    this._connectionId = connectionId;
    this._activate = activate;
    this._deactivate = deactivate;
    this._center = center;
  }

  public get connectionId(): string {
    return this._connectionId;
  }

  public activate() {
    this._activate();
  }

  public deactivate() {
    this._deactivate();
  }

  public center() {
    this._center();
  }
}
