import { ParamError, Strings } from "../lang";

export type Color = number;

export class Colors {
	public static readonly ALICE_BLUE = 0xFFF0F8FF;
	public static readonly ANTIQUE_WHITE = 0xFFFAEBD7;
	public static readonly AQUA = 0xFF00FFFF;
	public static readonly AQUAMARINE = 0xFF7FFFD4;
	public static readonly AZURE = 0xFFF0FFFF;
	public static readonly BEIGE = 0xFFF5F5DC;
	public static readonly BISQUE = 0xFFFFE4C4;
	public static readonly BLACK = 0xFF000000;
	public static readonly BLANCHED_ALMOND = 0xFFFFEBCD;
	public static readonly BLUE = 0xFF0000FF;
	public static readonly BLUE_VIOLET = 0xFF8A2BE2;
	public static readonly BROWN = 0xFFA52A2A;
	public static readonly BURLY_WOOD = 0xFFDEB887;
	public static readonly CADET_BLUE = 0xFF5F9EA0;
	public static readonly CHARTREUSE = 0xFF7FFF00;
	public static readonly CHOCOLATE = 0xFFD2691E;
	public static readonly CORAL = 0xFFFF7F50;
	public static readonly CORNFLOWER_BLUE = 0xFF6495ED;
	public static readonly CORNSILK = 0xFFFFF8DC;
	public static readonly CRIMSON = 0xFFDC143C;
	public static readonly CYAN = 0xFF00FFFF;
	public static readonly DARK_BLUE = 0xFF00008B;
	public static readonly DARK_CYAN = 0xFF008B8B;
	public static readonly DARK_GOLDEN_ROD = 0xFFB8860B;
	public static readonly DARK_GRAY = 0xFFA9A9A9;
	public static readonly DARK_GREY = 0xFFA9A9A9;
	public static readonly DARK_GREEN = 0xFF006400;
	public static readonly DARK_KHAKI = 0xFFBDB76B;
	public static readonly DARK_MAGENTA = 0xFF8B008B;
	public static readonly DARK_OLIVE_GREEN = 0xFF556B2F;
	public static readonly DARKORANGE = 0xFFFF8C00;
	public static readonly DARK_ORCHID = 0xFF9932CC;
	public static readonly DARK_RED = 0xFF8B0000;
	public static readonly DARK_SALMON = 0xFFE9967A;
	public static readonly DARK_SEA_GREEN = 0xFF8FBC8F;
	public static readonly DARK_SLATE_BLUE = 0xFF483D8B;
	public static readonly DARK_SLATE_GRAY = 0xFF2F4F4F;
	public static readonly DARK_SLATE_GREY = 0xFF2F4F4F;
	public static readonly DARK_TURQUOISE = 0xFF00CED1;
	public static readonly DARK_VIOLET = 0xFF9400D3;
	public static readonly DEEP_PINK = 0xFFFF1493;
	public static readonly DEEP_SKY_BLUE = 0xFF00BFFF;
	public static readonly DIM_GRAY = 0xFF696969;
	public static readonly DIM_GREY = 0xFF696969;
	public static readonly DODGER_BLUE = 0xFF1E90FF;
	public static readonly FIRE_BRICK = 0xFFB22222;
	public static readonly FLORAL_WHITE = 0xFFFFFAF0;
	public static readonly FOREST_GREEN = 0xFF228B22;
	public static readonly FUCHSIA = 0xFFFF00FF;
	public static readonly GAINSBORO = 0xFFDCDCDC;
	public static readonly GHOST_WHITE = 0xFFF8F8FF;
	public static readonly GOLD = 0xFFFFD700;
	public static readonly GOLDEN_ROD = 0xFFDAA520;
	public static readonly GRAY = 0xFF808080;
	public static readonly GREY = 0xFF808080;
	public static readonly GREEN = 0xFF008000;
	public static readonly GREEN_YELLOW = 0xFFADFF2F;
	public static readonly HONEY_DEW = 0xFFF0FFF0;
	public static readonly HOT_PINK = 0xFFFF69B4;
	public static readonly INDIAN_RED = 0xFFCD5C5C;
	public static readonly INDIGO = 0xFF4B0082;
	public static readonly IVORY = 0xFFFFFFF0;
	public static readonly KHAKI = 0xFFF0E68C;
	public static readonly LAVENDER = 0xFFE6E6FA;
	public static readonly LAVENDER_BLUSH = 0xFFFFF0F5;
	public static readonly LAWN_GREEN = 0xFF7CFC00;
	public static readonly LEMON_CHIFFON = 0xFFFFFACD;
	public static readonly LIGHT_BLUE = 0xFFADD8E6;
	public static readonly LIGHT_CORAL = 0xFFF08080;
	public static readonly LIGHT_CYAN = 0xFFE0FFFF;
	public static readonly LIGHT_GOLDEN_ROD_YELLOW = 0xFFFAFAD2;
	public static readonly LIGHT_GRAY = 0xFFD3D3D3;
	public static readonly LIGHT_GREY = 0xFFD3D3D3;
	public static readonly LIGHT_GREEN = 0xFF90EE90;
	public static readonly LIGHT_PINK = 0xFFFFB6C1;
	public static readonly LIGHT_SALMON = 0xFFFFA07A;
	public static readonly LIGHT_SEA_GREEN = 0xFF20B2AA;
	public static readonly LIGHT_SKY_BLUE = 0xFF87CEFA;
	public static readonly LIGHT_SLATE_GRAY = 0xFF778899;
	public static readonly LIGHT_SLATE_GREY = 0xFF778899;
	public static readonly LIGHT_STEEL_BLUE = 0xFFB0C4DE;
	public static readonly LIGHT_YELLOW = 0xFFFFFFE0;
	public static readonly LIME = 0xFF00FF00;
	public static readonly LIME_GREEN = 0xFF32CD32;
	public static readonly LINEN = 0xFFFAF0E6;
	public static readonly MAGENTA = 0xFFFF00FF;
	public static readonly MAROON = 0xFF800000;
	public static readonly MEDIUM_AQUA_MARINE = 0xFF66CDAA;
	public static readonly MEDIUM_BLUE = 0xFF0000CD;
	public static readonly MEDIUM_ORCHID = 0xFFBA55D3;
	public static readonly MEDIUM_PURPLE = 0xFF9370D8;
	public static readonly MEDIUM_SEA_GREEN = 0xFF3CB371;
	public static readonly MEDIUM_SLATE_BLUE = 0xFF7B68EE;
	public static readonly MEDIUM_SPRING_GREEN = 0xFF00FA9A;
	public static readonly MEDIUM_TURQUOISE = 0xFF48D1CC;
	public static readonly MEDIUM_VIOLET_RED = 0xFFC71585;
	public static readonly MIDNIGHT_BLUE = 0xFF191970;
	public static readonly MINT_CREAM = 0xFFF5FFFA;
	public static readonly MISTY_ROSE = 0xFFFFE4E1;
	public static readonly MOCCASIN = 0xFFFFE4B5;
	public static readonly NAVAJO_WHITE = 0xFFFFDEAD;
	public static readonly NAVY = 0xFF000080;
	public static readonly OLD_LACE = 0xFFFDF5E6;
	public static readonly OLIVE = 0xFF808000;
	public static readonly OLIVE_DRAB = 0xFF6B8E23;
	public static readonly ORANGE = 0xFFFFA500;
	public static readonly ORANGE_RED = 0xFFFF4500;
	public static readonly ORCHID = 0xFFDA70D6;
	public static readonly PALE_GOLDEN_ROD = 0xFFEEE8AA;
	public static readonly PALE_GREEN = 0xFF98FB98;
	public static readonly PALE_TURQUOISE = 0xFFAFEEEE;
	public static readonly PALE_VIOLET_RED = 0xFFD87093;
	public static readonly PAPAYA_WHIP = 0xFFFFEFD5;
	public static readonly PEACH_PUFF = 0xFFFFDAB9;
	public static readonly PERU = 0xFFCD853F;
	public static readonly PINK = 0xFFFFC0CB;
	public static readonly PLUM = 0xFFDDA0DD;
	public static readonly POWDER_BLUE = 0xFFB0E0E6;
	public static readonly PURPLE = 0xFF800080;
	public static readonly RED = 0xFFFF0000;
	public static readonly ROSY_BROWN = 0xFFBC8F8F;
	public static readonly ROYAL_BLUE = 0xFF4169E1;
	public static readonly SADDLE_BROWN = 0xFF8B4513;
	public static readonly SALMON = 0xFFFA8072;
	public static readonly SANDY_BROWN = 0xFFF4A460;
	public static readonly SEA_GREEN = 0xFF2E8B57;
	public static readonly SEA_SHELL = 0xFFFFF5EE;
	public static readonly SIENNA = 0xFFA0522D;
	public static readonly SILVER = 0xFFC0C0C0;
	public static readonly SKY_BLUE = 0xFF87CEEB;
	public static readonly SLATE_BLUE = 0xFF6A5ACD;
	public static readonly SLATE_GRAY = 0xFF708090;
	public static readonly SLATE_GREY = 0xFF708090;
	public static readonly SNOW = 0xFFFFFAFA;
	public static readonly SPRING_GREEN = 0xFF00FF7F;
	public static readonly STEEL_BLUE = 0xFF4682B4;
	public static readonly TAN = 0xFFD2B48C;
	public static readonly TEAL = 0xFF008080;
	public static readonly THISTLE = 0xFFD8BFD8;
	public static readonly TOMATO = 0xFFFF6347;
	public static readonly TURQUOISE = 0xFF40E0D0;
	public static readonly VIOLET = 0xFFEE82EE;
	public static readonly WHEAT = 0xFFF5DEB3;
	public static readonly WHITE = 0xFFFFFFFF;
	public static readonly WHITE_SMOKE = 0xFFF5F5F5;
	public static readonly YELLOW = 0xFFFFFF00;
	public static readonly YELLOW_GREEN = 0xFF9ACD32;
	public static readonly TRANSPARENT = 0x00000000;

	public static toCssColor(color: Color):string {
		let a = (color >> 24) & 0xFF;
		if (a == 0xFF) {
			//opaque color
			let rgb = color & 0xFFFFFF;
			let buf = "000000" + rgb.toString(16);
			return "#" + buf.substring(buf.length - 6);
		} else if (a != 0x00) {
			//translucent color
			let r = (color >> 16) & 0xFF;
			let g = (color >>  8) & 0xFF;
			let b = (color >>  0) & 0xFF;
			return `rgba(${r},${g},${b}, $(a / 0xFF})`;
		} else {
			//transparent color
			return "rgba(0,0,0,0)";
		}
	}

	public static parse(str:string):Color {
		let color:Color;
		str = str.trim();
		if (str.startsWith("#") && str.length == 4) {
			//#RGB format
			let r = parseInt(Strings.repeat(str.substring(1, 2), 2), 16);
			let g = parseInt(Strings.repeat(str.substring(2, 3), 2), 16);
			let b = parseInt(Strings.repeat(str.substring(3, 4), 2), 16);
			color = (r << 16) | (g << 8) | (b << 0);
		} else if (str.startsWith("#") && str.length == 7) {
			//#RRGGBB format
			let r = parseInt(Strings.repeat(str.substring(1, 3), 2), 16);
			let g = parseInt(Strings.repeat(str.substring(3, 5), 2), 16);
			let b = parseInt(Strings.repeat(str.substring(5, 7), 2), 16);
			color = 0xFF000000 | (r << 16) | (g << 8) | (b << 0);
		} else if (str.startsWith("rgba(")) {
			let values = str.substring(5, str.length - 1).split(",");
			let r = parseInt(values[0], 10);
			let g = parseInt(values[1], 10);
			let b = parseInt(values[2], 10);
			let a = parseInt(values[3], 10);
			color = ((a * 0xFF) << 24) | (r << 16) | (g << 8) | (b << 0);
		} else if (str.startsWith("rgb(")) {
			let values = str.substring(5, str.length - 1).split(",");
			let r = parseInt(values[0], 10);
			let g = parseInt(values[1], 10);
			let b = parseInt(values[2], 10);
			color = 0xFF000000 | (r << 16) | (g << 8) | (b << 0);
		} else {
			throw new ParamError();
		}
		return color;
	}
}