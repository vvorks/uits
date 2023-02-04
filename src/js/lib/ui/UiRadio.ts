import type { UiApplication } from '~/lib/ui/UiApplication';
import { Value } from '~/lib/lang';
import { UiImageNode } from '~/lib/ui/UiImageNode';
import { RecordHolder } from '~/lib/ui/RecordHolder';
import { KeyCodes } from '~/lib/ui/KeyCodes';
import { UiNode, UiResult } from '~/lib/ui/UiNode';

//
//取得元 https://fonts.google.com/icons?utm_source=developers.google.com&utm_medium=referral
//
const RADIO_ON_DATA =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAA9BJ' +
  'REFUaEPtmf2RTUEQxc9GgAgQASJABIgAESACRIAIEAEiQASIABEgAupXNb3Vb+7MdM99H7urtqvmj/fu3Jk+/XG6Z+' +
  '6RzrgcnXH9dQ7gpD24Sw9ckXRH0i1JF8u4XgB+lfS7jE+SPkj6sQvw2wJA0fuSHkgyZbN6AQowzwuw7Hsb89YCQPFH' +
  'kh4XS6/avLyEZ15KerUGyBoAdyW9kETIePkj6X2xKuFhgznMZQCc9xkXqvcB8rCskTbILICnkp5Vq38u/xEOM0KusN' +
  'bN6iX+I6xSkgWA5bA6sW7ys/yeVbxWDCCE0DX3AE/iDbwylCyA15Xyb0v8hxtECpTnGAgQEILJmwJiawC4lNAxwb11' +
  'GCX1DKdN7xV5gGR7dyDlbZsaxL1RYo8A4NbvjiYJG58DoTm3mED4WDgRpld7+TAC4C3xrVTY2Zg3hoGpZgTjQQ6W2N' +
  '2w7QGorX+7LBgpYWxFVa4rM5WX8STDLsVgH8uGXS/0AMAIVFoE60F1kZAvsBUgRjJTsPCCeZFKTeXfkB4AYt8qbcb6' +
  'Nc1GYHmeoUkMZ17AezcyAFAcAAjtQWTRmqkyytucIcO48LG2g2Te6GJbHsBNVF0kYp46V2aUZ+6QYcpinpHIH8L7WF' +
  'oAKOP09UhkIb/4rPI2PzKS9zDnCH4PAfjEieL/y4pzQA20Gdtuks+DBaG0POCVWsRctfvftWav3hvVI+gYnZAF2NaL' +
  'XqnRwt4y2+KIPN3V6b8EgJushJ+2EKKl2ajwLQ/MJLEHuzaMFkpVC00nsadRTkVQZU8OQaN0wFR6JEWjs4WMylgf0L' +
  'PeoNJT+Udd7nQh860EC18KtNl3K/HLtTOpVsL41hI5ojjmrwmlqAKzro//Zq70eN6HEUkNiEjwBECicCJsiGtyLRI6' +
  'UWvlF30QL48OND62M15gPbtdgOr8NQnPsCCshXEyJztv/W6uZI+UgKEXz2zsrWrWm707whC0D3YmmT5SmjWx2OWiES' +
  '6nOz2EcBNiXScXaHi0abzZa5XmsW7HiPxxlqVXX6uYXj6h+Y8NSKh9CAcpf+5tJq7fOPKAza1pMn13mURJzFNt/WEl' +
  'Q7Ppb2Stu0sSGwtl6HCEg0RHeX9dn757zXqgF078b19ZZpkGxblzra9spu5eZwGgMG4mD4ydDBws4T9wwN2wGAKLUO' +
  'CwMgqzRn3bMVPgjj26BoBRLMnGiCpvlAYojkEYs3UmnQM9JbAibQGjrryR4lRmwo472GnFbfG1HmgpR3gQGv4zq4FC' +
  'Wf+ZlVA7FZ9ZIyvv/fkuPbB3ZVsbnAM4EbO7Tf8B13TkMZ4GyP0AAAAASUVORK5CYII=';

//
//取得元 https://fonts.google.com/icons?utm_source=developers.google.com&utm_medium=referral
//
const RADIO_OFF_DATA =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAA1BJ' +
  'REFUaEPtmf+RDUEQx78XgRMBIjgiQASIwIkAESACRMBFgAgQwREBIkAE1KdqWvWbndnt2d23c09dV80fb9/sTH/7d/' +
  'ce6cDp6MD51yWA3hpcUwPXJd2TdEfScVo3E8Avkn6l9UnSB0nf1wC/FACMPpR0KsmYjfIFKMC8SMCi7+3smwsAxh9L' +
  'epIkPevy9BKaeSXp9RwgcwDcl/RSEibj6bek90mqmIct9rCXBXDeZ13J3gfIo3RGWCCtAJ5Jep6d/jk9wxxaCF/hrN' +
  'vZSzzDrEIUBYDkkDq2bvQj/W5lPGcMIJjQifsDTaINtDJKUQBvMubPkv1PXjDFQPofAQGCgGD0NoFYDACVYjpGqDc3' +
  'oyCfk9ua75rSAM72biPm7ZocxIMxxx4DgFq/uTCJ2XgfmBTngg2Yj5kTZnqj5g9jALwkvqYMu5bNT2FDeAQHc+yq2d' +
  'YA5NK/mw6cunjN/4lOH9OBVS3UABARyLQQcZ7DehBasDxBpibz71ANALZvmbaH9I1JrwVqp1sRADAOAIjyAHPqSZiP' +
  'lR04804VW9IAaiLrQltGnpqQfER6mhLev70lAKRx6npoNAZvpBafi+gj+D0KwDtOT/sv+cEgoJQ0cO6ak4HNbSR1fw' +
  '2NEjxBA0cuAfgzoaEOGFTl6b8EgJoshV80E6Kk2em9Sxo4eCf2YZSuiDjck6iAaaigUBg9+ETmSwnS+NWe4pf005Uz' +
  'oVLC4q05cs9k5ou5gQPDaK0a9WaEUwOiB9EPWCk/qIPGAFCBUvVZFdhDC176VMWY9qAjjLaUgKEW37KlpHywnqS5pU' +
  'Q7aIGkdi3ZDuGV6nQLYhJiVScDNJJXUXitY5ViW7cyIt/OcvTssYrx5R2aZ1yAQ+2DaKR831t0XH/xlAZsr++KeBae' +
  'XQZRYq5kW9+shLrBKIDS7BLHRkKAWUJEG5j34/rw7DUKoGZOPLevLK1Tahhn5pqPbJpmr60AYBg14wcWnQwcUcJ/4C' +
  'B2E8Ugogg5BSnDMGfk0w72U7g1aXQOAAuxOBsr/9LSak4wjkBYzXlmLgBjEikiNZb/QBEBQW2D2TGDbWbcLlgKwDOK' +
  'eWAa/jOrgYJZ/5kVM7kQn1kjkt7rnjU1sFdGa4dfAugidnfpX3zXuDEwPejGAAAAAElFTkSuQmCC';

export class UiRadio extends UiImageNode {
  private _recordHolder: RecordHolder;

  private _value: Value | null;

  private _specValue: Value;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiRadio {
    return new UiRadio(this);
  }

  /**
   * 通常コンストラクタ
   *
   * @param app アプリケーション
   * @param name ノード名
   */
  constructor(app: UiApplication, name: string, spec: Value);

  /**
   * コピーコンストラクタ
   *
   * @param src 複製元
   */
  constructor(src: UiRadio);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string, spec?: Value) {
    if (param instanceof UiRadio) {
      super(param as UiRadio);
      let src = param as UiRadio;
      this._recordHolder = src._recordHolder;
      this._value = src._value;
      this._specValue = src._specValue;
    } else {
      super(param as UiApplication, name as string);
      this._recordHolder = UiNode.VOID_REcORD_HOLDER;
      this._value = null;
      this._specValue = spec as Value;
    }
  }

  public onDataHolderChanged(holder: RecordHolder): UiResult {
    this._recordHolder = holder;
    this.value = this._recordHolder.getValue(this.dataFieldName) as Value;
    return UiResult.AFFECTED;
  }

  public get value(): Value {
    return this._value;
  }

  public set value(v: Value) {
    if (this._value != v) {
      this._value = v;
      this.imageContent = this.matched ? RADIO_ON_DATA : RADIO_OFF_DATA;
      this.imageWidth = '1rem';
      this._recordHolder.setValue(this.dataFieldName, this._value);
      this.onContentChanged();
    }
  }

  private get matched(): boolean {
    return this._value == this._specValue;
  }

  public onKeyDown(target: UiNode, key: number, ch: number, mod: number, at: number): UiResult {
    let result = UiResult.IGNORED;
    switch (key | (mod & KeyCodes.MOD_MACS)) {
      case KeyCodes.ENTER:
        result |= this.doChange();
        break;
    }
    return result;
  }

  public onMouseDown(target: UiNode, x: number, y: number, mod: number, at: number): UiResult {
    //Drag And Drop 動作を禁止させるためイベントを消費する
    return UiResult.CONSUMED;
  }

  public onMouseClick(target: UiNode, x: number, y: number, mod: number, at: number): UiResult {
    return this.doChange();
  }

  private doChange(): UiResult {
    let result = UiResult.IGNORED;
    if (this.enable && !this.matched) {
      this.value = this._specValue;
      result |= UiResult.AFFECTED;
    }
    return result;
  }
}
