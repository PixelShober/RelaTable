// Runnable check for the cropper coordinate mapping. Run: node scripts/crop-math.check.mjs
import assert from 'node:assert/strict';

// Mirror of src/lib/cropMath.ts (kept in sync; pure math, no DOM).
function cropDrawRect(natW, natH, s, tx, ty, box, out) {
	const k = out / box;
	return {
		dw: k * s * natW,
		dh: k * s * natH,
		dx: out / 2 + k * (tx - (s * natW) / 2),
		dy: out / 2 + k * (ty - (s * natH) / 2)
	};
}

// No pan, no zoom: image centre must land on the canvas centre.
{
	const { dx, dy, dw, dh } = cropDrawRect(1000, 800, 0.32, 0, 0, 280, 320);
	assert.ok(Math.abs(dx + dw / 2 - 160) < 1e-9, 'centre x');
	assert.ok(Math.abs(dy + dh / 2 - 160) < 1e-9, 'centre y');
}
// Panning by +14px in box space shifts the centre by +k*14 in output space.
{
	const k = 320 / 280;
	const { dx, dw } = cropDrawRect(1000, 800, 0.32, 14, 0, 280, 320);
	assert.ok(Math.abs(dx + dw / 2 - (160 + k * 14)) < 1e-9, 'pan offset');
}
// Output size scales with s: doubling s doubles drawn width.
{
	const a = cropDrawRect(1000, 800, 0.3, 0, 0, 280, 320);
	const b = cropDrawRect(1000, 800, 0.6, 0, 0, 280, 320);
	assert.ok(Math.abs(b.dw - 2 * a.dw) < 1e-9, 'zoom scales width');
}

console.log('crop-math: all checks passed');
