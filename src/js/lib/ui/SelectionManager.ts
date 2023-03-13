/**
 * SelectionManager
 */
export interface SelectionManager<K> {
  isSelected(key: K): boolean;
  setSelected(key: K, on: boolean): K[];
  getSelection(): K[];
}

export type SELECTION_TYPE = 'SINGLE' | 'MULTI';
export const FIELD_SELECTED = 'selected';

/**
 * MutiSelectionManager
 */
export class MultiSelectionManager<K> implements SelectionManager<K> {
  private _selectionList = new Map<K, boolean>();

  public isSelected(key: K): boolean {
    return !!this._selectionList.get(key);
  }

  public setSelected(key: K, on: boolean): K[] {
    this._selectionList.set(key, on);
    return [key];
  }

  public getSelection(): K[] {
    let list: K[] = [];
    this._selectionList.forEach((on, key) => {
      if (on) {
        list.push(key);
      }
    });
    return list;
  }
}

/**
 * SingleSelectionManager
 */
export class SingleSelectionManager<K> implements SelectionManager<K> {
  private _selection: K | undefined;
  private _selectionValue: boolean = false;

  public isSelected(key: K): boolean {
    return key == this._selection && this._selectionValue;
  }

  public setSelected(key: K, on: boolean): K[] {
    let oldSelection = this._selection;
    let list: K[] = [key];
    if (oldSelection != null && oldSelection != key) {
      if (this._selectionValue && on) {
        list.push(oldSelection);
      }
    }
    this._selection = key;
    this._selectionValue = on;
    return list;
  }

  public getSelection(): K[] {
    return this._selection != null && this._selectionValue ? [this._selection] : [];
  }
}
