export class KeyCodes {

	public static readonly WIN_KEY_FF_LINUX		= 0x00;
	public static readonly MAC_ENTER			= 0x03;
	public static readonly BACKSPACE			= 0x08;
	public static readonly TAB					= 0x09;
	public static readonly NUM_CENTER			= 0x0C;
	public static readonly ENTER				= 0x0D;
	public static readonly SHIFT				= 0x10;
	public static readonly CTRL					= 0x11;
	public static readonly ALT					= 0x12;
	public static readonly PAUSE				= 0x13;
	public static readonly CAPS_LOCK			= 0x14;
	public static readonly ESCAPE				= 0x1B;
	public static readonly SPACE				= 0x20;
	public static readonly PAGEUP				= 0x21;
	public static readonly PAGEDOWN				= 0x22;
	public static readonly END					= 0x23;
	public static readonly HOME					= 0x24;
	public static readonly LEFT					= 0x25;
	public static readonly UP					= 0x26;
	public static readonly RIGHT				= 0x27;
	public static readonly DOWN					= 0x28;
	public static readonly PRINT_SCREEN			= 0x2C;
	public static readonly INSERT				= 0x2D;
	public static readonly DELETE				= 0x2E;

	public static readonly KEY_0				= 0x30;
	public static readonly KEY_1				= 0x31;
	public static readonly KEY_2				= 0x32;
	public static readonly KEY_3				= 0x33;
	public static readonly KEY_4				= 0x34;
	public static readonly KEY_5				= 0x35;
	public static readonly KEY_6				= 0x36;
	public static readonly KEY_7				= 0x37;
	public static readonly KEY_8				= 0x38;
	public static readonly KEY_9				= 0x39;

	public static readonly KEY_A				= 0x41;
	public static readonly KEY_B				= 0x42;
	public static readonly KEY_C				= 0x43;
	public static readonly KEY_D				= 0x44;
	public static readonly KEY_E				= 0x45;
	public static readonly KEY_F				= 0x46;
	public static readonly KEY_G				= 0x47;
	public static readonly KEY_H				= 0x48;
	public static readonly KEY_I				= 0x49;
	public static readonly KEY_J				= 0x4A;
	public static readonly KEY_K				= 0x4B;
	public static readonly KEY_L				= 0x4C;
	public static readonly KEY_M				= 0x4D;
	public static readonly KEY_N				= 0x4E;
	public static readonly KEY_O				= 0x4F;
	public static readonly KEY_P				= 0x50;
	public static readonly KEY_Q				= 0x51;
	public static readonly KEY_R				= 0x52;
	public static readonly KEY_S				= 0x53;
	public static readonly KEY_T				= 0x54;
	public static readonly KEY_U				= 0x55;
	public static readonly KEY_V				= 0x56;
	public static readonly KEY_W				= 0x57;
	public static readonly KEY_X				= 0x58;
	public static readonly KEY_Y				= 0x59;
	public static readonly KEY_Z				= 0x5A;

	public static readonly WIN_KEY_LEFT_META	= 0x5B;
	public static readonly WIN_KEY_RIGHT		= 0x5C;
	public static readonly CONTEXT_MENU			= 0x5D;

	public static readonly NUM_0				= 0x60;
	public static readonly NUM_1				= 0x61;
	public static readonly NUM_2				= 0x62;
	public static readonly NUM_3				= 0x63;
	public static readonly NUM_4				= 0x64;
	public static readonly NUM_5				= 0x65;
	public static readonly NUM_6				= 0x66;
	public static readonly NUM_7				= 0x67;
	public static readonly NUM_8				= 0x68;
	public static readonly NUM_9				= 0x69;
	public static readonly NUM_MULTIPLY			= 0x6A;
	public static readonly NUM_PLUS				= 0x6B;

	public static readonly NUM_MINUS			= 0x6D;
	public static readonly NUM_PERIOD			= 0x6E;
	public static readonly NUM_DIVISION			= 0x6F;

	public static readonly F1					= 0x70;
	public static readonly F2					= 0x71;
	public static readonly F3					= 0x72;
	public static readonly F4					= 0x73;
	public static readonly F5					= 0x74;
	public static readonly F6					= 0x75;
	public static readonly F7					= 0x76;
	public static readonly F8					= 0x77;
	public static readonly F9					= 0x78;
	public static readonly F10					= 0x79;
	public static readonly F11					= 0x7A;
	public static readonly F12					= 0x7B;

	public static readonly NUMLOCK				= 0x90;
	public static readonly SCROLL_LOCK			= 0x91;

	public static readonly FIRST_MEDIA_KEY		= 0xA6;
	public static readonly LAST_MEDIA_KEY		= 0xB7;

	public static readonly MINUS				= 0xBD;
	public static readonly CARET				= 0xDE;
	public static readonly YEN					= 0xDC;

	public static readonly AT					= 0xC0;
	public static readonly LBRACKET				= 0xDB;

	public static readonly SEMICOLON			= 0xBB;
	public static readonly COLON				= 0xBA;
	public static readonly RBRACKET				= 0xDD;

	public static readonly COMMA				= 0xBC;
	public static readonly PERIOD				= 0xBE;
	public static readonly DIVISION				= 0xBF;
	public static readonly BACKSLASH			= 0xE2;

	public static readonly WIN_KEY				= 0xE0;
	public static readonly MAC_FF_META			= 0xE0;
	public static readonly WIN_IME				= 0xE5;

	public static readonly LBUTTON				= 0xF8;
	public static readonly MBUTTON				= 0xF9;
	public static readonly RBUTTON				= 0xFA;

	public static readonly UNUSED				= 0xFF;

	public static readonly MAX_KEY_CODE			= 0x100;

	public static readonly MOD_LBUTTON			= 0x0001;
	public static readonly MOD_RBUTTON			= 0x0002;
	public static readonly MOD_MBUTTON			= 0x0004;
	public static readonly MOD_DOUBLECLICK		= 0x0008;

	public static readonly MOD_SHIFT			= 0x0100;
	public static readonly MOD_CTRL				= 0x0200;
	public static readonly MOD_ALT				= 0x0400;
	public static readonly MOD_META				= 0x0800;
	public static readonly MOD_REPEAT			= 0x1000;

	public static readonly MOD_CS				= KeyCodes.MOD_CTRL
												| KeyCodes.MOD_SHIFT
												;
	public static readonly MOD_AC				= KeyCodes.MOD_META
												| KeyCodes.MOD_ALT
												| KeyCodes.MOD_CTRL
												;
	public static readonly MOD_ACS				= KeyCodes.MOD_META
												| KeyCodes.MOD_ALT
												| KeyCodes.MOD_CTRL
												| KeyCodes.MOD_SHIFT
												;
	public static readonly MOD_BUTTONS			= KeyCodes.MOD_LBUTTON
												| KeyCodes.MOD_MBUTTON
												| KeyCodes.MOD_RBUTTON
												;

}