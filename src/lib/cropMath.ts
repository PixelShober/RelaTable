/** Map the cropper's box transform (cover-scale `s`, pan `tx,ty`) onto an OUT×OUT canvas. */
export function cropDrawRect(
	natW: number,
	natH: number,
	s: number,
	tx: number,
	ty: number,
	box: number,
	out: number
): { dx: number; dy: number; dw: number; dh: number } {
	const k = out / box;
	return {
		dw: k * s * natW,
		dh: k * s * natH,
		dx: out / 2 + k * (tx - (s * natW) / 2),
		dy: out / 2 + k * (ty - (s * natH) / 2)
	};
}
